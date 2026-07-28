import type { Metadata } from 'next';
import { getAdminOverview } from '@/core/application/admin-service';
import { searchCatalog } from '@/core/application/catalog-service';
import { listCategories } from '@/core/application/catalog-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { ProportionBar, RevenueChart } from '@/components/admin/charts';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Relatórios' };

export default async function AdminReportsPage() {
  const [overview, catalog, categories] = await Promise.all([
    getAdminOverview(),
    searchCatalog({ perPage: 500 }),
    listCategories(),
  ]);

  const byCategory = categories
    .map((category) => {
      const products = catalog.items.filter((product) => product.categorySlug === category.slug);
      return {
        category,
        products: products.length,
        stockValue: products.reduce((sum, product) => sum + product.price * product.stock, 0),
        averagePrice: products.length
          ? Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length)
          : 0,
        averageRating: products.length
          ? products.reduce((sum, product) => sum + product.rating, 0) / products.length
          : 0,
      };
    })
    .sort((a, b) => b.stockValue - a.stockValue);

  const totalRevenue = overview.revenue.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = overview.revenue.reduce((sum, point) => sum + point.orders, 0);

  return (
    <AdminPage
      title="Relatórios"
      description="Desempenho comercial consolidado a partir dos pedidos e do catálogo."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Receita acumulada (8 meses)', value: formatPrice(totalRevenue) },
          { label: 'Pedidos pagos no período', value: String(totalOrders) },
          {
            label: 'Ticket médio do período',
            value: formatPrice(totalOrders ? Math.round(totalRevenue / totalOrders) : 0),
          },
        ].map((card) => (
          <AdminCard key={card.label}>
            <div className="flex flex-col gap-1">
              <span className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">
                {card.label}
              </span>
              <span className="font-display text-2xl font-bold text-ink">{card.value}</span>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminCard title="Evolução do faturamento">
        <RevenueChart data={overview.revenue} />
      </AdminCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <AdminCard title="Distribuição do catálogo por grupo">
          <ProportionBar
            segments={[
              {
                label: 'Card games',
                value: catalog.items.filter((p) => p.type.startsWith('tcg')).length,
                hue: 265,
              },
              {
                label: 'Consoles',
                value: catalog.items.filter((p) => p.type === 'console').length,
                hue: 214,
              },
              { label: 'Jogos', value: catalog.items.filter((p) => p.type === 'game').length, hue: 152 },
              {
                label: 'Acessórios',
                value: catalog.items.filter((p) => p.type === 'accessory').length,
                hue: 190,
              },
              {
                label: 'Colecionáveis',
                value: catalog.items.filter((p) => p.type === 'collectible').length,
                hue: 320,
              },
            ]}
          />
        </AdminCard>

        <AdminCard title="Desempenho por categoria" bodyClassName="p-0">
          <DataTable
            rows={byCategory}
            getKey={(row) => row.category.slug}
            columns={[
              {
                key: 'category',
                header: 'Categoria',
                render: (row) => (
                  <span className="text-xs font-semibold text-ink">{row.category.name}</span>
                ),
              },
              {
                key: 'products',
                header: 'Itens',
                align: 'center',
                render: (row) => <span className="font-tech text-xs">{row.products}</span>,
              },
              {
                key: 'average',
                header: 'Preço médio',
                align: 'right',
                render: (row) => <span className="text-xs">{formatPrice(row.averagePrice)}</span>,
              },
              {
                key: 'rating',
                header: 'Nota',
                align: 'center',
                render: (row) => (
                  <span className="font-tech text-xs text-warning">
                    {row.averageRating.toFixed(1)}
                  </span>
                ),
              },
              {
                key: 'value',
                header: 'Valor em estoque',
                align: 'right',
                render: (row) => (
                  <span className="font-display text-sm font-bold text-ink">
                    {formatPrice(row.stockValue)}
                  </span>
                ),
              },
            ]}
          />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
