import { ArrowLeft, CheckCircle, MapPin, Package, Receipt } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getOrder } from '@/core/application/order-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/controls';
import { STATUS_META } from '@/components/account/order-card';
import { LineThumb } from '@/components/shop/line-thumb';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Detalhe do pedido',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ numero: string }>;
}

const TIMELINE = [
  {
    key: 'recebido',
    label: 'Pedido recebido',
    statuses: ['aguardando-pagamento', 'pago', 'separando', 'enviado', 'entregue'],
  },
  {
    key: 'pago',
    label: 'Pagamento confirmado',
    statuses: ['pago', 'separando', 'enviado', 'entregue'],
  },
  { key: 'separando', label: 'Em separação', statuses: ['separando', 'enviado', 'entregue'] },
  { key: 'enviado', label: 'Enviado', statuses: ['enviado', 'entregue'] },
  { key: 'entregue', label: 'Entregue', statuses: ['entregue'] },
];

export default async function OrderDetailPage({ params }: PageProps) {
  const { numero } = await params;
  const session = await auth();
  const order = await getOrder(decodeURIComponent(numero));

  if (!order) notFound();
  // Um pedido só é visível para o dono ou para a administração.
  if (order.userId !== session!.user.id && session!.user.role !== 'admin')
    redirect('/conta/pedidos');

  const status = STATUS_META[order.status];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/conta/pedidos"
            className="text-ink-faint hover:text-ink inline-flex w-fit items-center gap-2 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Voltar aos pedidos
          </Link>
          <h1 className="font-display text-ink text-xl font-bold">Pedido {order.number}</h1>
          <p className="text-ink-muted text-xs">
            Realizado em {formatDate(order.createdAt, { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <Badge variant={status.variant} size="lg">
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="plate flex flex-col gap-6 rounded-xl p-6">
            <h2 className="font-display text-ink text-sm font-bold">Acompanhamento</h2>
            <ol className="flex flex-col">
              {TIMELINE.map((step, index) => {
                const done = step.statuses.includes(order.status);
                return (
                  <li key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid size-7 place-items-center rounded-full border ${
                          done
                            ? 'border-success/40 bg-success/15 text-success'
                            : 'border-line bg-ink/3 text-ink-ghost'
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="size-3.5" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      {index < TIMELINE.length - 1 ? (
                        <span className={`w-px flex-1 ${done ? 'bg-success/30' : 'bg-line'}`} />
                      ) : null}
                    </div>
                    <div className="pb-6">
                      <p
                        className={`text-sm font-semibold ${done ? 'text-ink' : 'text-ink-ghost'}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {order.trackingCode ? (
              <div className="border-line bg-ink/2 flex items-center justify-between gap-3 rounded-md border px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Package className="text-brand-300 size-4" />
                  <div>
                    <p className="text-2xs text-ink-faint tracking-wider uppercase">
                      Código de rastreio
                    </p>
                    <p className="font-tech text-ink text-sm">{order.trackingCode}</p>
                  </div>
                </div>
                <Button variant="secondary" size="xs">
                  Rastrear
                </Button>
              </div>
            ) : null}
          </section>

          <section className="plate flex flex-col gap-4 rounded-xl p-6">
            <h2 className="font-display text-ink text-sm font-bold">
              Itens do pedido ({order.items.length})
            </h2>
            <ul className="flex flex-col divide-y divide-[color:var(--color-line)]">
              {order.items.map((item) => (
                <li
                  key={item.productSlug}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <Link
                    href={
                      item.type === 'tcg-card'
                        ? `/carta/${item.productSlug}`
                        : `/produto/${item.productSlug}`
                    }
                    className="border-line block size-14 shrink-0 overflow-hidden rounded-md border transition-transform hover:scale-105"
                  >
                    <LineThumb
                      slug={item.productSlug}
                      name={item.name}
                      type={item.type}
                      accent={item.accent}
                      className="size-full"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate text-sm font-semibold">{item.name}</p>
                    <p className="font-tech text-2xs text-ink-faint">
                      {item.quantity}x {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-display text-ink text-sm font-bold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="plate flex flex-col gap-4 rounded-xl p-6">
            <h2 className="font-display text-ink flex items-center gap-2 text-sm font-bold">
              <MapPin className="text-brand-300 size-4" />
              Endereço de entrega
            </h2>
            <address className="text-ink-muted text-xs leading-relaxed not-italic">
              {order.address.recipient}
              <br />
              {order.address.street}, {order.address.number}
              {order.address.complement ? ` · ${order.address.complement}` : ''}
              <br />
              {order.address.district} — {order.address.city}/{order.address.state}
              <br />
              CEP {order.address.zip}
            </address>
          </section>

          <section className="plate flex flex-col gap-4 rounded-xl p-6">
            <h2 className="font-display text-ink flex items-center gap-2 text-sm font-bold">
              <Receipt className="text-brand-300 size-4" />
              Resumo financeiro
            </h2>
            <dl className="flex flex-col gap-2 text-xs">
              <div className="text-ink-muted flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="text-success flex justify-between">
                  <dt>Desconto {order.couponCode ? `(${order.couponCode})` : ''}</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              ) : null}
              <div className="text-ink-muted flex justify-between">
                <dt>Frete</dt>
                <dd>{order.shipping === 0 ? 'Grátis' : formatPrice(order.shipping)}</dd>
              </div>
              <Separator className="my-1" />
              <div className="flex items-end justify-between">
                <dt className="text-ink font-semibold">Total</dt>
                <dd className="font-display text-ink text-lg font-bold">
                  {formatPrice(order.total)}
                </dd>
              </div>
              <p className="text-2xs text-ink-faint mt-1">
                {order.paymentMethod}
                {order.installments > 1 ? ` · ${order.installments}x sem juros` : ''}
              </p>
            </dl>
          </section>

          <Button variant="secondary" block>
            Baixar nota fiscal
          </Button>
        </aside>
      </div>
    </div>
  );
}
