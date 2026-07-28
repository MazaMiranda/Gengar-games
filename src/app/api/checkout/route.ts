import { NextResponse } from 'next/server';
import { OrderError, placeOrder } from '@/core/application/order-service';
import { auth } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validators';
import { shippingOptionById } from '@/lib/shipping';
import { createPaymentIntent } from '@/infrastructure/payments/stripe';
import { getRepositories } from '@/infrastructure/container';

export const runtime = 'nodejs';

const METHOD_LABEL = {
  credit: 'Cartão de crédito',
  pix: 'PIX',
  boleto: 'Boleto',
} as const;

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'Dados do checkout inválidos.', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const session = await auth();
  const { products } = await getRepositories();

  // Preço e estoque vêm do catálogo, nunca do cliente.
  const catalog = await products.findManyBySlugs(input.lines.map((line) => line.slug));
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));

  const lines = input.lines.map((line) => {
    const product = bySlug.get(line.slug);
    if (!product) throw new Error(`Produto ${line.slug} indisponível.`);
    return {
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: line.quantity,
      accent: product.accent,
      type: product.type,
      stock: product.stock,
    };
  });

  const shipping = shippingOptionById(input.shippingOptionId);

  try {
    const order = await placeOrder({
      userId: session?.user?.id ?? 'u_convidado',
      customerName: input.identification.name,
      customerEmail: input.identification.email,
      lines,
      couponCode: input.couponCode ?? null,
      shipping: shipping.price,
      paymentMethod: METHOD_LABEL[input.payment.method],
      installments: input.payment.method === 'credit' ? input.payment.installments : 1,
      address: {
        id: `addr_${Date.now().toString(36)}`,
        label: 'Entrega',
        recipient: input.address.recipient,
        street: input.address.street,
        number: input.address.number,
        complement: input.address.complement,
        district: input.address.district,
        city: input.address.city,
        state: input.address.state.toUpperCase(),
        zip: input.address.zip,
        isDefault: false,
      },
    });

    const payment = await createPaymentIntent({
      amount: order.total,
      method: input.payment.method,
      installments: order.installments,
      customerEmail: order.customerEmail,
      orderNumber: order.number,
    });

    return NextResponse.json({ ok: true, order, payment });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ ok: false, message: error.message, code: error.code }, { status: 409 });
    }

    console.error('[checkout]', error);
    return NextResponse.json(
      { ok: false, message: 'Não foi possível concluir o pedido. Tente novamente.' },
      { status: 500 },
    );
  }
}
