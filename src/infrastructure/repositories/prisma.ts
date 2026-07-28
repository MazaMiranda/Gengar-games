import type {
  Address,
  CardAttributes,
  Category,
  CategoryKind,
  Coupon,
  CouponType,
  ConsoleAttributes,
  MediaItem,
  Order,
  OrderStatus,
  Product,
  ProductCondition,
  ProductType,
  SpecItem,
  User,
  UserRole,
} from '@/core/domain/entities';
import { runCatalogQuery } from '@/core/application/catalog-query';
import type {
  CatalogQuery,
  CouponRepository,
  OrderRepository,
  ProductRepository,
  Repositories,
  UserRepository,
} from '@/core/ports/repositories';
import { prisma } from '../db/prisma';

type ProductRow = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
type OrderRow = Awaited<ReturnType<typeof prisma.order.findFirst>>;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    type: row.type as ProductType,
    categorySlug: row.categorySlug,
    brandSlug: row.brandSlug,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    stock: row.stock,
    sku: row.sku,
    rating: row.rating,
    reviewCount: row.reviewCount,
    soldCount: row.soldCount,
    condition: row.condition as ProductCondition,
    platform: (row.platform ?? undefined) as Product['platform'],
    tcg: (row.tcg ?? undefined) as Product['tcg'],
    accent: row.accent,
    description: row.description,
    highlights: row.highlights,
    specs: (row.specs ?? []) as unknown as SpecItem[],
    media: (row.media ?? []) as unknown as MediaItem[],
    tags: row.tags,
    releasedAt: row.releasedAt.toISOString().slice(0, 10),
    featured: row.featured,
    preOrder: row.preOrder,
    card: (row.card ?? undefined) as unknown as CardAttributes | undefined,
    console: (row.consoleInfo ?? undefined) as unknown as ConsoleAttributes | undefined,
    relatedSlugs: row.relatedSlugs,
  };
}

export class PrismaProductRepository implements ProductRepository {
  /**
   * O catálogo desta operação cabe confortavelmente em memória, então filtro,
   * ordenação e facetas rodam no mesmo motor usado pelo repositório em memória.
   * Ao ultrapassar a casa das dezenas de milhares de SKUs, migre os predicados
   * para a cláusula `where` e as facetas para `groupBy`.
   */
  private async loadAll(): Promise<Product[]> {
    const rows = await prisma.product.findMany();
    return rows.map(toProduct);
  }

  async search(query: CatalogQuery) {
    const [products, categories, brands] = await Promise.all([
      this.loadAll(),
      prisma.category.findMany(),
      prisma.brand.findMany(),
    ]);
    return runCatalogQuery(products, query, { categories, brands });
  }

  async findBySlug(slug: string) {
    const row = await prisma.product.findUnique({ where: { slug } });
    return row ? toProduct(row) : null;
  }

  async findManyBySlugs(slugs: string[]) {
    if (!slugs.length) return [];
    const rows = await prisma.product.findMany({ where: { slug: { in: slugs } } });
    const bySlug = new Map(rows.map((row) => [row.slug, toProduct(row)]));
    return slugs.map((slug) => bySlug.get(slug)).filter((p): p is Product => Boolean(p));
  }

  async listCategories(): Promise<Category[]> {
    const rows = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      kind: row.kind as CategoryKind,
      accent: row.accent,
      glyph: row.glyph,
      productCount: row._count.products,
    }));
  }

  async listBrands() {
    return prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async reviewsFor(slug: string) {
    const rows = await prisma.review.findMany({
      where: { productSlug: slug },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  }

  async questionsFor(slug: string) {
    const rows = await prisma.question.findMany({
      where: { productSlug: slug },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  }

  async priceHistoryFor(slug: string) {
    const rows = await prisma.pricePoint.findMany({
      where: { productSlug: slug },
      orderBy: { date: 'asc' },
    });
    return rows.map((row) => ({ date: row.date.toISOString().slice(0, 10), price: row.price }));
  }

  async countAll() {
    return prisma.product.count();
  }
}

function toOrder(row: NonNullable<OrderRow> & { items: { productSlug: string; name: string; unitPrice: number; quantity: number; accent: number; type: string }[] }): Order {
  return {
    id: row.id,
    number: row.number,
    userId: row.userId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    status: row.status as OrderStatus,
    items: row.items.map((item) => ({
      productSlug: item.productSlug,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      accent: item.accent,
      type: item.type as ProductType,
    })),
    subtotal: row.subtotal,
    discount: row.discount,
    shipping: row.shipping,
    total: row.total,
    couponCode: row.couponCode,
    paymentMethod: row.paymentMethod,
    installments: row.installments,
    address: row.address as unknown as Address,
    createdAt: row.createdAt.toISOString(),
    trackingCode: row.trackingCode,
  };
}

export class PrismaOrderRepository implements OrderRepository {
  async listByUser(userId: string) {
    const rows = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toOrder);
  }

  async findByNumber(numberOrId: string) {
    const row = await prisma.order.findFirst({
      where: { OR: [{ number: numberOrId }, { id: numberOrId }] },
      include: { items: true },
    });
    return row ? toOrder(row) : null;
  }

  async listAll() {
    const rows = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toOrder);
  }

  async create(order: Order) {
    const row = await prisma.order.create({
      data: {
        number: order.number,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        couponCode: order.couponCode,
        paymentMethod: order.paymentMethod,
        installments: order.installments,
        address: order.address as unknown as object,
        trackingCode: order.trackingCode,
        items: { create: order.items },
      },
      include: { items: true },
    });
    return toOrder(row);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const row = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return toOrder(row);
  }
}

type UserRow = NonNullable<Awaited<ReturnType<typeof prisma.user.findFirst>>>;
type AddressRow = NonNullable<Awaited<ReturnType<typeof prisma.address.findFirst>>>;

function toAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    recipient: row.recipient,
    street: row.street,
    number: row.number,
    complement: row.complement ?? undefined,
    district: row.district,
    city: row.city,
    state: row.state,
    zip: row.zip,
    isDefault: row.isDefault,
  };
}

function toUser(row: UserRow & { addresses: AddressRow[] }): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role as UserRole,
    createdAt: row.createdAt.toISOString(),
    phone: row.phone ?? undefined,
    document: row.document ?? undefined,
    addresses: row.addresses.map(toAddress),
    wishlist: row.wishlist,
    coupons: row.coupons,
    loyaltyPoints: row.loyaltyPoints,
  };
}

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string) {
    const row = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { addresses: true },
    });
    return row ? toUser(row) : null;
  }

  async findById(id: string) {
    const row = await prisma.user.findUnique({ where: { id }, include: { addresses: true } });
    return row ? toUser(row) : null;
  }

  async create(data: Omit<User, 'id' | 'createdAt'>) {
    const row = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        phone: data.phone,
        document: data.document,
        loyaltyPoints: data.loyaltyPoints,
        wishlist: data.wishlist,
        coupons: data.coupons,
        addresses: {
          create: data.addresses.map(({ id: _id, ...address }) => address),
        },
      },
      include: { addresses: true },
    });
    return toUser(row);
  }

  async listAll() {
    const rows = await prisma.user.findMany({ include: { addresses: true } });
    return rows.map(toUser);
  }
}

type CouponRow = NonNullable<Awaited<ReturnType<typeof prisma.coupon.findFirst>>>;

function toCoupon(row: CouponRow): Coupon {
  return {
    code: row.code,
    type: row.type as CouponType,
    value: row.value,
    minSubtotal: row.minSubtotal,
    description: row.description,
    expiresAt: row.expiresAt.toISOString().slice(0, 10),
    active: row.active,
    usageCount: row.usageCount,
    usageLimit: row.usageLimit,
  };
}

export class PrismaCouponRepository implements CouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    const row = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    return row ? toCoupon(row) : null;
  }

  async listAll(): Promise<Coupon[]> {
    const rows = await prisma.coupon.findMany({ orderBy: { code: 'asc' } });
    return rows.map(toCoupon);
  }
}

export function createPrismaRepositories(): Repositories {
  return {
    products: new PrismaProductRepository(),
    orders: new PrismaOrderRepository(),
    users: new PrismaUserRepository(),
    coupons: new PrismaCouponRepository(),
  };
}
