import { NextResponse, type NextRequest } from 'next/server';
import { getProductsBySlugs } from '@/core/application/catalog-service';

export const runtime = 'nodejs';

/** Hidrata listas mantidas no cliente (favoritos, vistos recentemente). */
export async function GET(request: NextRequest) {
  const slugs = (request.nextUrl.searchParams.get('slugs') ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 60);

  if (!slugs.length) return NextResponse.json({ items: [] });

  const products = await getProductsBySlugs(slugs);
  return NextResponse.json({ items: products });
}
