import { ArrowUpRight, Package } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import type { Order, OrderStatus } from '@/core/domain/entities';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { LineThumb } from '@/components/shop/line-thumb';
import { formatDate, formatPrice } from '@/lib/utils';

export const STATUS_META: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
  'aguardando-pagamento': { label: 'Aguardando pagamento', variant: 'warning' },
  pago: { label: 'Pago', variant: 'info' },
  separando: { label: 'Em separação', variant: 'brand' },
  enviado: { label: 'Enviado', variant: 'info' },
  entregue: { label: 'Entregue', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

export function OrderCard({ order }: { order: Order }) {
  const status = STATUS_META[order.status];

  return (
    <article className="plate hover:border-line-brand flex flex-col gap-5 rounded-xl p-6 transition-all duration-400">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-tech text-2xs text-ink-faint tracking-[0.2em] uppercase">
            Pedido {order.number}
          </span>
          <span className="text-ink-muted text-xs">{formatDate(order.createdAt)}</span>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </header>

      <ul className="flex flex-wrap gap-2">
        {order.items.slice(0, 4).map((item) => (
          <li key={item.productSlug} title={item.name}>
            <LineThumb
              slug={item.productSlug}
              name={item.name}
              type={item.type}
              accent={item.accent}
              className="border-line size-12 rounded-md border"
            />
          </li>
        ))}
        {order.items.length > 4 ? (
          <li className="border-line bg-ink/3 font-tech text-2xs text-ink-muted grid size-12 place-items-center rounded-md border">
            +{order.items.length - 4}
          </li>
        ) : null}
      </ul>

      <footer className="border-line flex flex-wrap items-end justify-between gap-4 border-t pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs text-ink-faint">
            {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} ·{' '}
            {order.paymentMethod}
          </span>
          <span className="font-display text-ink text-lg font-bold">
            {formatPrice(order.total)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {order.trackingCode ? (
            <span className="border-line font-tech text-2xs text-ink-muted inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5">
              <Package className="size-3" />
              {order.trackingCode}
            </span>
          ) : null}
          <Link
            href={`/conta/pedidos/${order.number}`}
            className="group text-brand-300 hover:text-brand-200 inline-flex items-center gap-2 text-xs font-semibold transition-colors"
          >
            Ver detalhes
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
