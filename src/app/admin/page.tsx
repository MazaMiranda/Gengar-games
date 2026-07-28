import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Package, Users } from 'lucide-react';
import { getAdminOverview } from '@/core/application/admin-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { ProportionBar, RevenueChart } from '@/components/admin/charts';
import { STATUS_META } from '@/components/account/order-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <div key={metric.id} className="plate flex flex-col gap-3 rounded-xl p-5">
            <span className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">
              {metric.label}
            </span>
            <span className="font-display text-2xl font-bold text-ink">{format(metric)}</span>
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-tech text-2xs font-semibold',
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

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
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

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard
          title="Pedidos recentes"
          bodyClassName="p-0"
          action={
            <Link href="/admin/pedidos" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
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
                    className="font-tech text-xs font-semibold text-ink transition-colors hover:text-brand-200"
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
                  <span className="font-display text-sm font-bold text-ink">
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
            <Link href="/admin/produtos" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
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
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-md border border-line"
                      style={{
                        background: `linear-gradient(150deg, hsl(${row.product.accent} 68% 22%), rgba(9,9,12,0.95))`,
                      }}
                    >
                      <span className="font-display text-2xs font-bold text-white/75">
                        {row.product.name.charAt(0)}
                      </span>
                    </span>
                    <span className="line-clamp-1 text-xs font-medium text-ink">{row.product.name}</span>
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
                  <span className="font-display text-sm font-bold text-ink">
                    {formatPrice(row.revenue)}
                  </span>
                ),
              },
            ]}
          />
        </AdminCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <AdminCard
          title="Estoque crítico"
          bodyClassName="p-0"
          action={
            <Link href="/admin/estoque" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
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
                  <span className="line-clamp-1 text-xs font-medium text-ink">{product.name}</span>
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
                      'inline-flex items-center gap-1.5 font-tech text-xs font-bold',
                      product.stock === 0 ? 'text-danger' : 'text-warning',
                    )}
                  >
                    <AlertTriangle className="size-3" />
                    {product.stock}
                  </span>
                ),
              },
            ]}
          />
        </AdminCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <AdminCard>
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
                <Users className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-ink">{overview.customersCount}</p>
                <p className="text-2xs text-ink-faint">Clientes cadastrados</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
                <Package className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-ink">{overview.productsCount}</p>
                <p className="text-2xs text-ink-faint">Produtos ativos no catálogo</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard className="sm:col-span-2 xl:col-span-1">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Última atualização</span>
              <p className="text-sm text-ink-muted">
                {formatDate(new Date(), { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  );
}
