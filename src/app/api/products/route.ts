import { NextResponse, type NextRequest } from 'next/server';
import { searchCatalog } from '@/core/application/catalog-service';
import { parseCatalogParams } from '@/lib/catalog-params';

export const runtime = 'nodejs';

/** Busca do catálogo — consumida pela busca instantânea e por listas paginadas. */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const perPage = Number(request.nextUrl.searchParams.get('limite') ?? 12);
  const query = parseCatalogParams(params, Number.isFinite(perPage) ? perPage : 12);

  const result = await searchCatalog(query);

  return NextResponse.json({
    total: result.total,
    page: result.page,
    pageCount: result.pageCount,
    items: result.items.map((product) => ({
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      type: product.type,
      accent: product.accent,
      categorySlug: product.categorySlug,
      stock: product.stock,
      rating: product.rating,
      card: product.card ? { set: product.card.set, rarity: product.card.rarity } : null,
    })),
  });
}
