import type { Product } from '@/core/domain/entities';
import { collectibleProducts } from './products.collectibles';
import { gamingProducts } from './products.gaming';
import { tcgProducts } from './products.tcg';

export const allProducts: Product[] = [...tcgProducts, ...gamingProducts, ...collectibleProducts];

export const productsBySlug = new Map(allProducts.map((product) => [product.slug, product]));

export * from './accounts';
export * from './social';
export * from './taxonomies';
