import { Plus } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';
import Link from 'next/link';
import { searchCatalog } from '@/core/application/catalog-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineThumb } from '@/components/shop/line-thumb';
import { discountPercent, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Promoções' };

export default async function AdminPromotionsPage() {
  const [onSale, all] = await Promise.all([
    searchCatalog({ onSale: true, perPage: 200, sort: 'relevancia' }),
    searchCatalog({ perPage: 500 }),
  ]);

  const totalDiscount = onSale.items.reduce(
    (sum, product) =>
      sum + ((product.compareAtPrice ?? product.price) - product.price) * product.stock,
    0,
  );
  const averageOff =
    onSale.items.reduce(
      (sum, product) => sum + discountPercent(product.price, product.compareAtPrice),
      0,
    ) / (onSale.items.length || 1);

  const cards = [
    { label: 'Produtos em promoção', value: `${onSale.total}` },
    {
      label: 'Participação do catálogo',
      value: `${Math.round((onSale.total / all.total) * 100)}%`,
    },
    { label: 'Desconto médio', value: `${averageOff.toFixed(1)}%` },
    { label: 'Desconto potencial', value: formatPrice(totalDiscount) },
  ];

  return (
    <AdminPage
      title="Promoções"
      description="Campanhas ativas e produtos com preço promocional aplicado."
      actions={
        <Button size="sm">
          <Plus className="size-4" />
          Nova campanha
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <AdminCard key={card.label}>
            <div className="flex flex-col gap-1">
              <span className="font-tech text-2xs text-ink-faint tracking-[0.16em] uppercase">
                {card.label}
              </span>
              <span className="font-display text-ink text-2xl font-bold">{card.value}</span>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminCard title="Produtos com preço promocional" bodyClassName="p-0">
        <DataTable
          rows={onSale.items}
          getKey={(product) => product.slug}
          empty="Nenhum produto em promoção no momento."
          columns={[
            {
              key: 'product',
              header: 'Produto',
              render: (product) => (
                <div className="flex items-center gap-3">
                  <LineThumb
                    slug={product.slug}
                    name={product.name}
                    type={product.type}
                    accent={product.accent}
                    className="border-line size-9 shrink-0 rounded-md border"
                  />
                  <span className="text-ink line-clamp-1 text-xs font-semibold">
                    {product.name}
                  </span>
                </div>
              ),
            },
            {
              key: 'from',
              header: 'De',
              align: 'right',
              render: (product) => (
                <span className="text-ink-ghost text-xs line-through">
                  {formatPrice(product.compareAtPrice ?? product.price)}
                </span>
              ),
            },
            {
              key: 'to',
              header: 'Por',
              align: 'right',
              render: (product) => (
                <span className="font-display text-ink text-sm font-bold">
                  {formatPrice(product.price)}
                </span>
              ),
            },
            {
              key: 'off',
              header: 'Desconto',
              align: 'center',
              render: (product) => (
                <Badge variant="danger" size="sm">
                  -{discountPercent(product.price, product.compareAtPrice)}%
                </Badge>
              ),
            },
            {
              key: 'stock',
              header: 'Estoque',
              align: 'center',
              render: (product) => <span className="font-tech text-xs">{product.stock}</span>,
            },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (product) => (
                <Link
                  href={
                    product.type === 'tcg-card'
                      ? `/carta/${product.slug}`
                      : `/produto/${product.slug}`
                  }
                  className="text-2xs text-ink-faint hover:text-brand-200 font-semibold transition-colors"
                >
                  Ver
                </Link>
              ),
            },
          ]}
        />
      </AdminCard>
    </AdminPage>
  );
}
