import type { Metadata } from 'next';
import Link from 'next/link';
import { searchCatalog } from '@/core/application/catalog-service';
import { platformList } from '@/core/domain/taxonomy';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Consoles' };

export default async function AdminConsolesPage() {
  const [consoles, byPlatform] = await Promise.all([
    searchCatalog({ types: ['console'], perPage: 200, sort: 'maior-preco' }),
    searchCatalog({ perPage: 500 }),
  ]);

  const platformRows = platformList.map((platform) => {
    const products = byPlatform.items.filter((product) => product.platform === platform.slug);
    return {
      platform,
      total: products.length,
      hardware: products.filter((product) => product.type === 'console').length,
      games: products.filter((product) => product.type === 'game').length,
      accessories: products.filter((product) => product.type === 'accessory').length,
      stock: products.reduce((sum, product) => sum + product.stock, 0),
    };
  });

  return (
    <AdminPage
      title="Consoles e plataformas"
      description={`${consoles.total} consoles cadastrados em ${platformList.length} plataformas.`}
    >
      <AdminCard title="Distribuição por plataforma" bodyClassName="p-0">
        <DataTable
          rows={platformRows}
          getKey={(row) => row.platform.slug}
          columns={[
            {
              key: 'platform',
              header: 'Plataforma',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <span
                    className="size-8 shrink-0 rounded-md border border-line"
                    style={{
                      background: `linear-gradient(150deg, hsl(${row.platform.accent} 78% 48%), rgba(9,9,12,0.9))`,
                    }}
                  />
                  <span className="text-xs font-semibold text-ink">{row.platform.name}</span>
                </div>
              ),
            },
            {
              key: 'hardware',
              header: 'Consoles',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.hardware}</span>,
            },
            {
              key: 'games',
              header: 'Jogos',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.games}</span>,
            },
            {
              key: 'accessories',
              header: 'Acessórios',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.accessories}</span>,
            },
            {
              key: 'stock',
              header: 'Unidades',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.stock}</span>,
            },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (row) => (
                <Link
                  href={`/gamer/${row.platform.slug}`}
                  className="text-2xs font-semibold text-ink-faint transition-colors hover:text-brand-200"
                >
                  Ver na loja
                </Link>
              ),
            },
          ]}
        />
      </AdminCard>

      <AdminCard title="Consoles cadastrados" bodyClassName="p-0">
        <DataTable
          rows={consoles.items}
          getKey={(product) => product.slug}
          columns={[
            {
              key: 'name',
              header: 'Console',
              render: (product) => (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-ink">{product.name}</span>
                  <span className="text-2xs text-ink-ghost">{product.console?.edition}</span>
                </div>
              ),
            },
            {
              key: 'generation',
              header: 'Geração',
              render: (product) => (
                <span className="text-xs">{product.console?.generation ?? '—'}</span>
              ),
            },
            {
              key: 'storage',
              header: 'Armazenamento',
              render: (product) => <span className="text-xs">{product.console?.storage ?? '—'}</span>,
            },
            {
              key: 'condition',
              header: 'Estado',
              render: (product) => (
                <Badge variant={product.condition === 'lacrado' ? 'success' : 'neutral'} size="sm">
                  {product.condition}
                </Badge>
              ),
            },
            {
              key: 'price',
              header: 'Preço',
              align: 'right',
              render: (product) => (
                <span className="font-display text-sm font-bold text-ink">
                  {formatPrice(product.price)}
                </span>
              ),
            },
            {
              key: 'stock',
              header: 'Estoque',
              align: 'center',
              render: (product) => <span className="font-tech text-xs">{product.stock}</span>,
            },
          ]}
        />
      </AdminCard>
    </AdminPage>
  );
}
