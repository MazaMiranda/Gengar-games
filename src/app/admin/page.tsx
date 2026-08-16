import {
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Users,
  Warning,
} from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminOverview } from '@/core/application/admin-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { ProportionBar, RevenueChart } from '@/components/admin/charts';
import { STATUS_META } from '@/components/account/order-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineThumb } from '@/components/shop/line-thumb';
import { cn, formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

const STATUS_HUE: Record<string, number> = {
  'aguardando-pagamento': 42,
  pago: 200,
  separando: 275,
  enviado: 190,
  entregue: 152,
  cancelado: 350,
};

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  const format = (metric: (typeof overview.metrics)[number]) => {
    if (metric.format === 'currency') return formatPrice(metric.value);
    if (metric.format === 'percent') return `${metric.value.toFixed(1)}%`;
    return metric.value.toLocaleString('pt-BR');
  };

  return (
    <AdminPage
      title="Dashboard"
      description="Visão consolidada da operação — faturamento, pedidos e saúde do estoque."
      actions={
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/relatorios">Ver relatórios</Link>
        </Button>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <div key={metric.id} className="plate flex flex-col gap-1.5 rounded-xl p-4">
            <span className="font-tech text-2xs text-ink-faint tracking-[0.16em] uppercase">
              {metric.label}
            </span>
            <span className="font-display text-ink text-2xl font-bold">{format(metric)}</span>
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'font-tech text-2xs inline-flex items-center gap-1 font-semibold',
                  metric.delta >= 0 ? 'text-success' : 'text-danger',
                )}
              >
                {metric.delta >= 0 ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {Math.abs(metric.delta).toFixed(1)}%
              </span>
              <span className="text-2xs text-ink-ghost">{metric.hint}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <AdminCard title="Faturamento nos últimos 8 meses">
          <RevenueChart data={overview.revenue} />
        </AdminCard>

        <AdminCard title="Pedidos por status">
          <ProportionBar
            segments={overview.statusBreakdown
              .filter((row) => row.count > 0)
              .map((row) => ({
                label: STATUS_META[row.status].label,
                value: row.count,
                hue: STATUS_HUE[row.status] ?? 265,
              }))}
          />
        </AdminCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <AdminCard
          title="Pedidos recentes"
          bodyClassName="p-0"
          action={
            <Link
              href="/admin/pedidos"
              className="text-brand-300 hover:text-brand-200 text-xs font-semibold"
            >
              Ver todos
            </Link>
          }
        >
          <DataTable
            rows={overview.recentOrders}
            getKey={(order) => order.id}
            columns={[
              {
                key: 'number',
                header: 'Pedido',
                render: (order) => (
                  <Link
                    href={`/admin/pedidos/${order.number}`}
                    className="tap-44 font-tech text-ink hover:text-brand-200 text-xs font-semibold transition-colors"
                  >
                    {order.number}
                  </Link>
                ),
              },
              {
                key: 'customer',
                header: 'Cliente',
                render: (order) => <span className="text-xs">{order.customerName}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (order) => (
                  <Badge variant={STATUS_META[order.status].variant} size="sm">
                    {STATUS_META[order.status].label}
                  </Badge>
                ),
              },
              {
                key: 'total',
                header: 'Total',
                align: 'right',
                render: (order) => (
                  <span className="font-display text-ink text-sm font-bold">
                    {formatPrice(order.total)}
                  </span>
                ),
              },
            ]}
          />
        </AdminCard>

        <AdminCard
          title="Produtos mais rentáveis"
          bodyClassName="p-0"
          action={
            <Link
              href="/admin/produtos"
              className="text-brand-300 hover:text-brand-200 text-xs font-semibold"
            >
              Catálogo
            </Link>
          }
        >
          <DataTable
            rows={overview.topProducts}
            getKey={(row) => row.product.slug}
            empty="Ainda não há vendas registradas."
            columns={[
              {
                key: 'product',
                header: 'Produto',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <LineThumb
                      slug={row.product.slug}
                      name={row.product.name}
                      type={row.product.type}
                      accent={row.product.accent}
                      className="border-line size-7 shrink-0 rounded-md border"
                    />
                    <span className="text-ink line-clamp-1 text-xs font-medium">
                      {row.product.name}
                    </span>
                  </div>
                ),
              },
              {
                key: 'units',
                header: 'Unid.',
                align: 'center',
                render: (row) => <span className="font-tech text-xs">{row.units}</span>,
              },
              {
                key: 'revenue',
                header: 'Receita',
                align: 'right',
                render: (row) => (
                  <span className="font-display text-ink text-sm font-bold">
                    {formatPrice(row.revenue)}
                  </span>
                ),
              },
            ]}
          />
        </AdminCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <AdminCard
          title="Estoque crítico"
          bodyClassName="p-0"
          action={
            <Link
              href="/admin/estoque"
              className="text-brand-300 hover:text-brand-200 text-xs font-semibold"
            >
              Gerenciar
            </Link>
          }
        >
          <DataTable
            rows={overview.lowStock}
            getKey={(product) => product.slug}
            empty="Todo o catálogo com estoque saudável."
            columns={[
              {
                key: 'name',
                header: 'Produto',
                render: (product) => (
                  <span className="text-ink line-clamp-1 text-xs font-medium">{product.name}</span>
                ),
              },
              {
                key: 'sku',
                header: 'SKU',
                render: (product) => <span className="font-tech text-2xs">{product.sku}</span>,
              },
              {
                key: 'stock',
                header: 'Estoque',
                align: 'right',
                render: (product) => (
                  <span
                    className={cn(
                      'font-tech inline-flex items-center gap-1.5 text-xs font-bold',
                      product.stock === 0 ? 'text-danger' : 'text-warning',
                    )}
                  >
                    <Warning className="size-3" />
                    {product.stock}
                  </span>
                ),
              },
            ]}
          />
        </AdminCard>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <AdminCard>
            <div className="flex items-center gap-3">
              <span className="border-line bg-brand-500/12 text-brand-300 grid size-9 place-items-center rounded-md border">
                <Users className="size-4" />
              </span>
              <div>
                <p className="font-display text-ink text-2xl font-bold">
                  {overview.customersCount}
                </p>
                <p className="text-2xs text-ink-faint">Clientes cadastrados</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-4">
              <span className="border-line bg-brand-500/12 text-brand-300 grid size-9 place-items-center rounded-md border">
                <Package className="size-4" />
              </span>
              <div>
                <p className="font-display text-ink text-2xl font-bold">{overview.productsCount}</p>
                <p className="text-2xs text-ink-faint">Produtos ativos no catálogo</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard className="sm:col-span-2 xl:col-span-1">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Última atualização</span>
              <p className="text-ink-muted text-sm">
                {formatDate(new Date(), { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  );
}
