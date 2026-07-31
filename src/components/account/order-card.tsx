import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';
import type { Order, OrderStatus } from '@/core/domain/entities';
import { Badge, type BadgeProps } from '@/components/ui/badge';
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
    <article className="plate flex flex-col gap-5 rounded-xl p-6 transition-all duration-400 hover:border-line-brand">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-tech text-2xs uppercase tracking-[0.2em] text-ink-faint">
            Pedido {order.number}
          </span>
          <span className="text-xs text-ink-muted">{formatDate(order.createdAt)}</span>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </header>

      <ul className="flex flex-wrap gap-2">
        {order.items.slice(0, 4).map((item) => (
          <li
            key={item.productSlug}
            className="grid size-12 place-items-center rounded-md border border-line"
            style={{ background: `linear-gradient(150deg, hsl(${item.accent} 68% 20%), rgba(9,9,12,0.95))` }}
            title={item.name}
          >
            <span className="font-display text-xs font-bold text-white/75">{item.name.charAt(0)}</span>
          </li>
        ))}
        {order.items.length > 4 ? (
          <li className="grid size-12 place-items-center rounded-md border border-line bg-ink/3 font-tech text-2xs text-ink-muted">
            +{order.items.length - 4}
          </li>
        ) : null}
      </ul>

      <footer className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs text-ink-faint">
            {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} · {order.paymentMethod}
          </span>
          <span className="font-display text-lg font-bold text-ink">{formatPrice(order.total)}</span>
        </div>

        <div className="flex items-center gap-2">
          {order.trackingCode ? (
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-tech text-2xs text-ink-muted">
              <Package className="size-3" />
              {order.trackingCode}
            </span>
          ) : null}
          <Link
            href={`/conta/pedidos/${order.number}`}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-brand-300 transition-colors hover:text-brand-200"
          >
            Ver detalhes
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
