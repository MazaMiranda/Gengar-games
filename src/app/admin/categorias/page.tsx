import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listCategories } from '@/core/application/catalog-service';
import { getAdminCatalog } from '@/core/application/admin-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Categorias' };

const KIND_LABEL: Record<string, string> = {
  tcg: 'Card game',
  gaming: 'Games',
  accessory: 'Acessórios',
  collectible: 'Colecionáveis',
};

export default async function AdminCategoriesPage() {
  const [categories, catalog] = await Promise.all([listCategories(), getAdminCatalog()]);

  const rows = categories.map((category) => {
    const products = catalog.items.filter((product) => product.categorySlug === category.slug);
    return {
      category,
      count: products.length,
      stock: products.reduce((sum, product) => sum + product.stock, 0),
      value: products.reduce((sum, product) => sum + product.price * product.stock, 0),
    };
  });

  return (
    <AdminPage
      title="Categorias"
      description="Estrutura de navegação da loja e distribuição do catálogo."
      actions={
        <Button size="sm">
          <Plus className="size-4" />
          Nova categoria
        </Button>
      }
    >
      <AdminCard bodyClassName="p-0">
        <DataTable
          rows={rows}
          getKey={(row) => row.category.slug}
          columns={[
            {
              key: 'name',
              header: 'Categoria',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <span
                    className="size-8 shrink-0 rounded-md border border-line"
                    style={{
                      background: `linear-gradient(150deg, hsl(${row.category.accent} 75% 45%), rgba(9,9,12,0.9))`,
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-ink">{row.category.name}</span>
                    <span className="font-tech text-2xs text-ink-ghost">/{row.category.slug}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'kind',
              header: 'Grupo',
              render: (row) => (
                <Badge variant="neutral" size="sm">
                  {KIND_LABEL[row.category.kind] ?? row.category.kind}
                </Badge>
              ),
            },
            {
              key: 'tagline',
              header: 'Descrição',
              render: (row) => (
                <span className="line-clamp-1 text-xs text-ink-muted">{row.category.tagline}</span>
              ),
            },
            {
              key: 'count',
              header: 'Produtos',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.count}</span>,
            },
            {
              key: 'stock',
              header: 'Unidades',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.stock}</span>,
            },
            {
              key: 'value',
              header: 'Valor em estoque',
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
                  href={`/catalogo?categoria=${row.category.slug}`}
                  className="text-2xs font-semibold text-ink-faint transition-colors hover:text-brand-200"
                >
                  Ver na loja
                </Link>
              ),
            },
          ]}
        />
      </AdminCard>
    </AdminPage>
  );
}
