import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Copy, Package, Truck } from 'lucide-react';
import { getOrder } from '@/core/application/order-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/controls';
import { Aurora } from '@/components/layout/aurora';
import { LineThumb } from '@/components/shop/line-thumb';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pedido confirmado',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ numero: string }>;
}

export default async function CheckoutSuccessPage({ params }: PageProps) {
  const { numero } = await params;
  const order = await getOrder(decodeURIComponent(numero));
  if (!order) notFound();

  const steps = [
    { label: 'Pedido recebido', done: true },
    { label: 'Pagamento confirmado', done: order.status !== 'aguardando-pagamento' },
    { label: 'Em separação', done: ['separando', 'enviado', 'entregue'].includes(order.status) },
    { label: 'A caminho', done: ['enviado', 'entregue'].includes(order.status) },
  ];

  return (
    <div className="grain relative min-h-[80vh] overflow-hidden py-16">
      <Aurora intensity={0.7} />

      <div className="container-page relative flex flex-col items-center gap-10">
        <div className="flex max-w-xl flex-col items-center gap-5 text-center">
          <span className="grid size-20 place-items-center rounded-full border border-success/30 bg-success/12 shadow-[0_0_60px_-12px_rgba(52,211,153,0.5)]">
            <CheckCircle2 className="size-9 text-success" />
          </span>
          <div className="flex flex-col items-center gap-3">
            {/* Sem kicker acima do h1 — número do pedido vira cert-label
                anexado ao título, não uma linha decorativa antes. */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <h1 className="text-display font-extrabold text-ink">Compra confirmada</h1>
              <span className="cert-label">Pedido {order.number}</span>
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              Enviamos a confirmação para <strong className="text-ink">{order.customerEmail}</strong>. Você
              acompanha cada etapa pela sua conta e recebe o rastreio assim que o pedido for postado.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/conta/pedidos">Acompanhar pedido</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/catalogo">Continuar comprando</Link>
            </Button>
          </div>
        </div>

        <div className="grid w-full max-w-4xl gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="plate flex flex-col gap-6 rounded-xl p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-sm font-bold text-ink">Status do pedido</h2>
              <Badge variant={order.status === 'aguardando-pagamento' ? 'warning' : 'success'}>
                {order.status.replace('-', ' ')}
              </Badge>
            </div>

            <ol className="flex flex-col gap-0">
              {steps.map((step, index) => (
                <li key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid size-7 place-items-center rounded-full border ${
                        step.done
                          ? 'border-success/40 bg-success/15 text-success'
                          : 'border-line bg-ink/3 text-ink-ghost'
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    {index < steps.length - 1 ? (
                      <span className={`w-px flex-1 ${step.done ? 'bg-success/30' : 'bg-line'}`} />
                    ) : null}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-semibold ${step.done ? 'text-ink' : 'text-ink-ghost'}`}>
                      {step.label}
                    </p>
                    {index === 0 ? (
                      <p className="mt-0.5 text-2xs text-ink-faint">
                        {formatDate(order.createdAt, { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            <Separator />

            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                <Package className="size-4 text-brand-300" />
                Itens ({order.items.length})
              </h3>
              <ul className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <li key={item.productSlug} className="flex items-center gap-3">
                    <LineThumb
                      slug={item.productSlug}
                      name={item.name}
                      type={item.type}
                      accent={item.accent}
                      className="size-12 shrink-0 rounded-md border border-line"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                      <p className="font-tech text-2xs text-ink-faint">
                        {item.quantity}x {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-tech text-xs font-semibold text-ink">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="plate flex flex-col gap-4 rounded-xl p-6">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-ink">
                <Truck className="size-4 text-brand-300" />
                Entrega
              </h2>
              <address className="not-italic text-xs leading-relaxed text-ink-muted">
                {order.address.recipient}
                <br />
                {order.address.street}, {order.address.number}
                {order.address.complement ? ` · ${order.address.complement}` : ''}
                <br />
                {order.address.district} — {order.address.city}/{order.address.state}
                <br />
                CEP {order.address.zip}
              </address>
              {order.trackingCode ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-ink/2 px-3 py-2.5">
                  <span className="font-tech text-2xs text-ink-muted">{order.trackingCode}</span>
                  <Copy className="size-3.5 text-ink-ghost" />
                </div>
              ) : (
                <p className="text-2xs text-ink-faint">O código de rastreio aparece aqui após a postagem.</p>
              )}
            </section>

            <section className="plate flex flex-col gap-3 rounded-xl p-6">
              <h2 className="font-display text-sm font-bold text-ink">Pagamento</h2>
              <dl className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <dt>Forma</dt>
                  <dd className="text-ink">{order.paymentMethod}</dd>
                </div>
                {order.installments > 1 ? (
                  <div className="flex justify-between text-ink-muted">
                    <dt>Parcelas</dt>
                    <dd className="text-ink">
                      {order.installments}x de {formatPrice(Math.round(order.total / order.installments))}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between text-ink-muted">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(order.subtotal)}</dd>
                </div>
                {order.discount > 0 ? (
                  <div className="flex justify-between text-success">
                    <dt>Desconto</dt>
                    <dd>−{formatPrice(order.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between text-ink-muted">
                  <dt>Frete</dt>
                  <dd>{order.shipping === 0 ? 'Grátis' : formatPrice(order.shipping)}</dd>
                </div>
                <Separator className="my-1" />
                <div className="flex items-end justify-between">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="font-display text-xl font-bold text-ink">{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
