import { runCatalogQuery } from '@/core/application/catalog-query';
import type {
  Brand,
  Category,
  Coupon,
  MediaItem,
  Order,
  OrderStatus,
  PricePoint,
  Product,
  Question,
  Review,
  User,
} from '@/core/domain/entities';
import type {
  CatalogQuery,
  CatalogResult,
  CouponRepository,
  OrderRepository,
  ProductRepository,
  Repositories,
  UserRepository,
} from '@/core/ports/repositories';
import {
  allProducts,
  brands as brandSeed,
  categories as categorySeed,
  coupons as couponSeed,
  orders as orderSeed,
  priceHistoryForProduct,
  productsBySlug,
  questionsForProduct,
  reviewsForProduct,
  users as userSeed,
} from '../data';
import { addRuntimeProduct, runtimeProducts } from './runtime-store';

export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: Product[] = allProducts) {}

  /** Catálogo seed mais o que foi cadastrado depois que o servidor subiu. */
  private all(): Product[] {
    return runtimeProducts.length ? [...this.products, ...runtimeProducts] : this.products;
  }

  private bySlug(slug: string): Product | null {
    return productsBySlug.get(slug) ?? runtimeProducts.find((p) => p.slug === slug) ?? null;
  }

  async search(query: CatalogQuery): Promise<CatalogResult> {
    return runCatalogQuery(this.all(), query, { categories: categorySeed, brands: brandSeed });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.bySlug(slug);
  }

  async findManyBySlugs(slugs: string[]): Promise<Product[]> {
    return slugs.map((slug) => this.bySlug(slug)).filter((p): p is Product => Boolean(p));
  }

  /**
   * Sem banco, o produto cadastrado vive no processo — some quando o servidor
   * reinicia. Mesmo contrato do Prisma; só a durabilidade muda.
   */
  async create(product: Product): Promise<Product> {
    return addRuntimeProduct(product);
  }

  /**
   * `bySlug` devolve a mesma referência guardada no array/Map — mutar `.media`
   * nela já basta para o resto do processo enxergar a troca, sem precisar
   * reescrever a lista.
   */
  async updateMedia(slug: string, media: MediaItem[]): Promise<Product | null> {
    const product = this.bySlug(slug);
    if (!product) return null;
    product.media = media;
    return product;
  }

  async listCategories(): Promise<Category[]> {
    const products = this.all();
    return categorySeed.map((category) => ({
      ...category,
      productCount: products.filter((p) => p.categorySlug === category.slug).length,
    }));
  }

  async listBrands(): Promise<Brand[]> {
    return brandSeed;
  }

  async reviewsFor(slug: string): Promise<Review[]> {
    const product = productsBySlug.get(slug);
    return product ? reviewsForProduct(product) : [];
  }

  async questionsFor(slug: string): Promise<Question[]> {
    const product = productsBySlug.get(slug);
    return product ? questionsForProduct(product) : [];
  }

  async priceHistoryFor(slug: string): Promise<PricePoint[]> {
    const product = productsBySlug.get(slug);
    return product ? priceHistoryForProduct(product) : [];
  }

  async countAll(): Promise<number> {
    return this.all().length;
  }
}

/**
 * Persistência volátil de pedidos e contas — suficiente para a loja rodar sem
 * banco. Substituída pelos repositórios Prisma quando DATABASE_URL existe.
 */
const orderStore: Order[] = [...orderSeed];
const userStore: User[] = [...userSeed];

export class InMemoryOrderRepository implements OrderRepository {
  async listByUser(userId: string) {
    return orderStore
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findByNumber(numberOrId: string) {
    return orderStore.find((o) => o.number === numberOrId || o.id === numberOrId) ?? null;
  }

  async listAll() {
    return [...orderStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(order: Order) {
    orderStore.unshift(order);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = orderStore.find((o) => o.id === id || o.number === id);
    if (!order) return null;
    order.status = status;
    return order;
  }
}

export class InMemoryUserRepository implements UserRepository {
  async findByEmail(email: string) {
    return userStore.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findById(id: string) {
    return userStore.find((user) => user.id === id) ?? null;
  }

  async create(data: Omit<User, 'id' | 'createdAt'>) {
    const user: User = {
      ...data,
      id: `u_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    userStore.push(user);
    return user;
  }

  async listAll() {
    return userStore;
  }
}

export class InMemoryCouponRepository implements CouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    return couponSeed.find((coupon) => coupon.code.toUpperCase() === code.toUpperCase()) ?? null;
  }

  async listAll() {
    return couponSeed;
  }
}

export function createInMemoryRepositories(): Repositories {
  return {
    products: new InMemoryProductRepository(),
    orders: new InMemoryOrderRepository(),
    users: new InMemoryUserRepository(),
    coupons: new InMemoryCouponRepository(),
  };
}
