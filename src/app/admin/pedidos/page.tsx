import type { Metadata } from 'next';
import Link from 'next/link';
import { listAllOrders } from '@/core/application/order-service';
import type { OrderStatus } from '@/core/domain/entities';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { OrderStatusSelect } from '@/components/admin/order-status-select';
import { cn, formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Pedidos' };

const FILTERS: { value: OrderStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'aguardando-pagamento', label: 'Aguardando' },
  { value: 'pago', label: 'Pagos' },
  { value: 'separando', label: 'Separando' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'cancelado', label: 'Cancelados' },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const orders = await listAllOrders();
  const filtered = status && status !== 'todos' ? orders.filter((order) => order.status === status) : orders;

  const revenue = filtered
    .filter((order) => order.status !== 'cancelado')
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <AdminPage
      title="Pedidos"
      description={`${filtered.length} ${filtered.length === 1 ? 'pedido' : 'pedidos'} · ${formatPrice(revenue)} em valor`}
    >
      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por status">
        {FILTERS.map((filter) => {
          const active = (status ?? 'todos') === filter.value;
          const count =
            filter.value === 'todos'
              ? orders.length
              : orders.filter((order) => order.status === filter.value).length;

          return (
            <Link
              key={filter.value}
              href={filter.value === 'todos' ? '/admin/pedidos' : `/admin/pedidos?status=${filter.value}`}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-sm border px-3.5 text-xs font-semibold transition-all duration-300',
                active
                  ? 'border-brand-400/60 bg-brand-500/15 text-brand-100'
                  : 'border-line bg-ink/3 text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {filter.label}
              <span className="font-tech text-[0.625rem] text-ink-ghost">{count}</span>
            </Link>
          );
        })}
      </nav>

      <AdminCard bodyClassName="p-0">
        <DataTable
          rows={filtered}
          getKey={(order) => order.id}
          empty="Nenhum pedido com esse status."
          columns={[
            {
              key: 'number',
              header: 'Pedido',
              render: (order) => (
                <Link
                  href={`/admin/pedidos/${order.number}`}
                  className="font-tech text-xs font-semibold text-ink transition-colors hover:text-brand-200"
                >
                  {order.number}
                </Link>
              ),
            },
            {
              key: 'customer',
              header: 'Cliente',
              render: (order) => (
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-ink">{order.customerName}</span>
                  <span className="text-2xs text-ink-faint">{order.customerEmail}</span>
                </div>
              ),
            },
            {
              key: 'date',
              header: 'Data',
              render: (order) => <span className="text-xs">{formatDate(order.createdAt)}</span>,
            },
            {
              key: 'items',
              header: 'Itens',
              align: 'center',
              render: (order) => (
                <span className="font-tech text-xs">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              ),
            },
            {
              key: 'total',
              header: 'Total',
              align: 'right',
              render: (order) => (
                <span className="font-display text-sm font-bold text-ink">{formatPrice(order.total)}</span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              width: '13rem',
              render: (order) => (
                <OrderStatusSelect orderId={order.id} status={order.status} compact />
              ),
            },
          ]}
        />
      </AdminCard>

      <p className="text-2xs text-ink-ghost">
        Status atualizado altera o histórico visível para o cliente na área &ldquo;Meus pedidos&rdquo;.
      </p>
    </AdminPage>
  );
}
