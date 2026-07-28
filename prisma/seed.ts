import { PrismaClient, type Prisma } from '@prisma/client';
import { allProducts } from '../src/infrastructure/data';
import { brands, categories } from '../src/infrastructure/data/taxonomies';
import { coupons, orders, users } from '../src/infrastructure/data/accounts';
import {
  priceHistoryForProduct,
  questionsForProduct,
  reviewsForProduct,
} from '../src/infrastructure/data/social';

const prisma = new PrismaClient();

/**
 * Popula o PostgreSQL com o mesmo catálogo usado pelo repositório em memória.
 * Rode com `npm run db:push && npm run db:seed`.
 */
async function main() {
  console.log('→ limpando tabelas');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pricePoint.deleteMany();
  await prisma.question.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  console.log('→ categorias e marcas');
  await prisma.category.createMany({
    data: categories.map(({ id: _id, productCount: _count, ...category }) => category),
  });
  await prisma.brand.createMany({
    data: brands.map(({ id: _id, ...brand }) => brand),
  });

  console.log(`→ ${allProducts.length} produtos`);
  for (const product of allProducts) {
    await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        subtitle: product.subtitle,
        type: product.type,
        categorySlug: product.categorySlug,
        brandSlug: product.brandSlug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        sku: product.sku,
        rating: product.rating,
        reviewCount: product.reviewCount,
        soldCount: product.soldCount,
        condition: product.condition,
        platform: product.platform,
        tcg: product.tcg,
        accent: product.accent,
        description: product.description,
        highlights: product.highlights,
        specs: product.specs as unknown as Prisma.InputJsonValue,
        media: product.media as unknown as Prisma.InputJsonValue,
        tags: product.tags,
        releasedAt: new Date(product.releasedAt),
        featured: product.featured,
        preOrder: product.preOrder,
        card: (product.card ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
        consoleInfo: (product.console ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
        relatedSlugs: product.relatedSlugs,
        reviews: {
          create: reviewsForProduct(product).map(({ id: _id, productSlug: _slug, createdAt, ...review }) => ({
            ...review,
            createdAt: new Date(createdAt),
          })),
        },
        questions: {
          create: questionsForProduct(product).map(({ id: _id, productSlug: _slug, createdAt, ...question }) => ({
            ...question,
            createdAt: new Date(createdAt),
          })),
        },
        pricePoints: {
          create: priceHistoryForProduct(product).map((point) => ({
            date: new Date(point.date),
            price: point.price,
          })),
        },
      },
    });
  }

  console.log('→ cupons');
  await prisma.coupon.createMany({
    data: coupons.map((coupon) => ({ ...coupon, expiresAt: new Date(coupon.expiresAt) })),
  });

  console.log('→ usuários');
  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        phone: user.phone,
        document: user.document,
        loyaltyPoints: user.loyaltyPoints,
        wishlist: user.wishlist,
        coupons: user.coupons,
        createdAt: new Date(user.createdAt),
        addresses: {
          create: user.addresses.map(({ id: _id, ...address }) => address),
        },
      },
    });
  }

  console.log('→ pedidos');
  for (const order of orders) {
    await prisma.order.create({
      data: {
        id: order.id,
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
        address: order.address as unknown as Prisma.InputJsonValue,
        trackingCode: order.trackingCode,
        createdAt: new Date(order.createdAt),
        items: { create: order.items },
      },
    });
  }

  console.log('✓ seed concluído');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
