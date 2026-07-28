import { getRepositories } from '@/infrastructure/container';
import type { Address, Order, OrderItem, OrderStatus } from '../domain/entities';
import { computeTotals, type CartLine } from './cart';

export interface PlaceOrderInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  lines: CartLine[];
  couponCode?: string | null;
  shipping: number;
  paymentMethod: string;
  installments: number;
  address: Address;
}

export class OrderError extends Error {
  constructor(
    message: string,
    readonly code: 'carrinho-vazio' | 'estoque-insuficiente' | 'produto-invalido',
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const sequence = Math.floor(1000 + Math.random() * 8999);
  return `GG-${year}-${sequence}`;
}

/**
 * Cria o pedido revalidando preço e estoque no servidor — o carrinho do cliente
 * nunca é fonte de verdade para valores.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const { products, coupons, orders } = await getRepositories();

  if (!input.lines.length) {
    throw new OrderError('Seu carrinho está vazio.', 'carrinho-vazio');
  }

  const catalog = await products.findManyBySlugs(input.lines.map((line) => line.slug));
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));

  const verifiedLines: CartLine[] = input.lines.map((line) => {
    const product = bySlug.get(line.slug);
    if (!product) {
      throw new OrderError(`O produto "${line.name}" não está mais disponível.`, 'produto-invalido');
    }
    if (product.stock < line.quantity) {
      throw new OrderError(
        `Estoque insuficiente para "${product.name}". Restam ${product.stock} unidades.`,
        'estoque-insuficiente',
      );
    }
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

  const coupon = input.couponCode ? await coupons.findByCode(input.couponCode) : null;
  const totals = computeTotals(verifiedLines, { coupon, shipping: input.shipping });

  const items: OrderItem[] = verifiedLines.map((line) => ({
    productSlug: line.slug,
    name: line.name,
    unitPrice: line.price,
    quantity: line.quantity,
    accent: line.accent,
    type: line.type,
  }));

  const order: Order = {
    id: `o_${Date.now().toString(36)}`,
    number: generateOrderNumber(),
    userId: input.userId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    status: input.paymentMethod === 'Boleto' ? 'aguardando-pagamento' : 'pago',
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total,
    couponCode: coupon && totals.discount + (totals.shipping === 0 ? 1 : 0) > 0 ? coupon.code : null,
    paymentMethod: input.paymentMethod,
    installments: input.installments,
    address: input.address,
    createdAt: new Date().toISOString(),
    trackingCode: null,
  };

  return orders.create(order);
}

export async function listOrdersOf(userId: string) {
  const { orders } = await getRepositories();
  return orders.listByUser(userId);
}

export async function getOrder(numberOrId: string) {
  const { orders } = await getRepositories();
  return orders.findByNumber(numberOrId);
}

export async function listAllOrders() {
  const { orders } = await getRepositories();
  return orders.listAll();
}

export async function changeOrderStatus(id: string, status: OrderStatus) {
  const { orders } = await getRepositories();
  return orders.updateStatus(id, status);
}
