import type { Metadata } from 'next';
import Link from 'next/link';
import { searchCatalog } from '@/core/application/catalog-service';
import { tcgGameList } from '@/core/domain/taxonomy';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'TCGs' };

export default async function AdminTcgPage() {
  const catalog = await searchCatalog({ types: ['tcg-card', 'tcg-sealed'], perPage: 500 });

  const rows = tcgGameList.map((game) => {
    const products = catalog.items.filter((product) => product.tcg === game.slug);
    const singles = products.filter((product) => product.type === 'tcg-card');
    const sealed = products.filter((product) => product.type === 'tcg-sealed');
    const sets = new Set(products.map((product) => product.card?.set).filter(Boolean));

    return {
      game,
      total: products.length,
      singles: singles.length,
      sealed: sealed.length,
      sets: sets.size,
      stock: products.reduce((sum, product) => sum + product.stock, 0),
      value: products.reduce((sum, product) => sum + product.price * product.stock, 0),
    };
  });

  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <AdminPage
      title="Card games"
      description={`${catalog.total} produtos TCG · ${formatPrice(totalValue)} em estoque.`}
    >
      <AdminCard bodyClassName="p-0">
        <DataTable
          rows={rows}
          getKey={(row) => row.game.slug}
          columns={[
            {
              key: 'game',
              header: 'Jogo',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <span
                    className="size-8 shrink-0 rounded-md border border-line"
                    style={{
                      background: `linear-gradient(150deg, hsl(${row.game.accent} 78% 48%), rgba(9,9,12,0.9))`,
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-ink">{row.game.name}</span>
                    <span className="text-2xs text-ink-ghost">{row.game.publisher}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'singles',
              header: 'Singles',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.singles}</span>,
            },
            {
              key: 'sealed',
              header: 'Selados',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.sealed}</span>,
            },
            {
              key: 'sets',
              header: 'Coleções',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.sets}</span>,
            },
            {
              key: 'stock',
              header: 'Unidades',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.stock}</span>,
            },
            {
              key: 'value',
              header: 'Valor',
              align: 'right',
              render: (row) => (
                <span className="font-display text-sm font-bold text-ink">{formatPrice(row.value)}</span>
              ),
            },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (row) => (
                <Link
                  href={`/tcg/${row.game.slug}`}
                  className="text-2xs font-semibold text-ink-faint transition-colors hover:text-brand-200"
                >
                  Ver na loja
                </Link>
              ),
            },
          ]}
        />
      </AdminCard>

      <AdminCard title="Coleções com estoque ativo" bodyClassName="p-0">
        <DataTable
          rows={catalog.facets.sets}
          getKey={(bucket) => bucket.value}
          empty="Nenhuma coleção cadastrada."
          columns={[
            {
              key: 'set',
              header: 'Coleção / Expansão',
              render: (bucket) => <span className="text-xs font-medium text-ink">{bucket.label}</span>,
            },
            {
              key: 'count',
              header: 'Cartas',
              align: 'right',
              render: (bucket) => <span className="font-tech text-xs">{bucket.count}</span>,
            },
          ]}
        />
      </AdminCard>
    </AdminPage>
  );
}
