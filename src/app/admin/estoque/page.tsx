import type { Metadata } from 'next';
import { AlertTriangle, PackageX, TrendingDown } from 'lucide-react';
import { getAdminCatalog } from '@/core/application/admin-service';
import { listCategories } from '@/core/application/catalog-service';
import { AdminCard, AdminPage } from '@/components/admin/admin-shell';
import { ProductTable } from '@/components/admin/product-table';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Estoque' };

export default async function AdminStockPage() {
  const [catalog, categories] = await Promise.all([getAdminCatalog(), listCategories()]);

  const outOfStock = catalog.items.filter((product) => product.stock === 0);
  const critical = catalog.items.filter((product) => product.stock > 0 && product.stock <= 4);
  const inventoryValue = catalog.items.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  );

  const cards = [
    {
      icon: PackageX,
      label: 'Produtos esgotados',
      value: String(outOfStock.length),
      tone: 'text-danger',
    },
    {
      icon: AlertTriangle,
      label: 'Estoque crítico (≤ 4)',
      value: String(critical.length),
      tone: 'text-warning',
    },
    {
      icon: TrendingDown,
      label: 'Valor imobilizado',
      value: formatPrice(inventoryValue),
      tone: 'text-ink',
    },
  ];

  return (
    <AdminPage
      title="Estoque"
      description="Acompanhe disponibilidade, rupturas e o valor parado em prateleira."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <AdminCard key={card.label}>
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-md border border-line bg-white/3">
                <card.icon className={`size-5 ${card.tone}`} />
              </span>
              <div>
                <p className={`font-display text-xl font-bold ${card.tone}`}>{card.value}</p>
                <p className="text-2xs text-ink-faint">{card.label}</p>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <ProductTable
        products={[...catalog.items].sort((a, b) => a.stock - b.stock)}
        categories={categories}
        mode="stock"
      />
    </AdminPage>
  );
}
