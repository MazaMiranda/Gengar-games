import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Receipt, User } from 'lucide-react';
import { getOrder } from '@/core/application/order-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { OrderStatusSelect } from '@/components/admin/order-status-select';
import { Separator } from '@/components/ui/controls';
import { LineThumb } from '@/components/shop/line-thumb';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Detalhe do pedido' };

interface PageProps {
  params: Promise<{ numero: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { numero } = await params;
  const order = await getOrder(decodeURIComponent(numero));
  if (!order) notFound();

  return (
    <AdminPage
      title={`Pedido ${order.number}`}
      description={`Criado em ${formatDate(order.createdAt, { dateStyle: 'long', timeStyle: 'short' })}`}
      actions={<OrderStatusSelect orderId={order.id} status={order.status} />}
    >
      <Link
        href="/admin/pedidos"
        className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        Voltar para a lista
      </Link>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <AdminCard title={`Itens (${order.items.length})`} bodyClassName="p-0">
          <DataTable
            rows={order.items}
            getKey={(item) => item.productSlug}
            columns={[
              {
                key: 'product',
                header: 'Produto',
                render: (item) => (
                  <div className="flex items-center gap-3">
                    <LineThumb
                      slug={item.productSlug}
                      name={item.name}
                      type={item.type}
                      accent={item.accent}
                      className="size-9 shrink-0 rounded-md border border-line"
                    />
                    <Link
                      href={item.type === 'tcg-card' ? `/carta/${item.productSlug}` : `/produto/${item.productSlug}`}
                      className="line-clamp-1 text-xs font-medium text-ink hover:text-brand-200"
                    >
                      {item.name}
                    </Link>
                  </div>
                ),
              },
              {
                key: 'quantity',
                header: 'Qtd.',
                align: 'center',
                render: (item) => <span className="font-tech text-xs">{item.quantity}</span>,
              },
              {
                key: 'unit',
                header: 'Unitário',
                align: 'right',
                render: (item) => <span className="text-xs">{formatPrice(item.unitPrice)}</span>,
              },
              {
                key: 'total',
                header: 'Subtotal',
                align: 'right',
                render: (item) => (
                  <span className="font-display text-sm font-bold text-ink">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                ),
              },
            ]}
          />
        </AdminCard>

        <div className="flex flex-col gap-4">
          <AdminCard title="Cliente">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
                <User className="size-4" />
              </span>
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="font-semibold text-ink">{order.customerName}</span>
                <span className="text-ink-muted">{order.customerEmail}</span>
                <span className="font-tech text-2xs text-ink-ghost">ID {order.userId}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Entrega">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
                <MapPin className="size-4" />
              </span>
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
            </div>
            {order.trackingCode ? (
              <p className="mt-4 border-t border-line pt-4 font-tech text-2xs text-ink-muted">
                Rastreio: {order.trackingCode}
              </p>
            ) : null}
          </AdminCard>

          <AdminCard title="Financeiro">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
                <Receipt className="size-4" />
              </span>
              <dl className="flex flex-1 flex-col gap-2 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(order.subtotal)}</dd>
                </div>
                {order.discount > 0 ? (
                  <div className="flex justify-between text-success">
                    <dt>Desconto {order.couponCode ? `(${order.couponCode})` : ''}</dt>
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
                  <dd className="font-display text-lg font-bold text-ink">{formatPrice(order.total)}</dd>
                </div>
                <p className="text-2xs text-ink-faint">
                  {order.paymentMethod}
                  {order.installments > 1 ? ` · ${order.installments}x` : ''}
                </p>
              </dl>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  );
}
