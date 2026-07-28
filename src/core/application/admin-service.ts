import { getRepositories } from '@/infrastructure/container';
import type { Order, OrderStatus, Product } from '../domain/entities';

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  format: 'currency' | 'number' | 'percent';
  delta: number;
  hint: string;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

const PAID_STATUSES: OrderStatus[] = ['pago', 'separando', 'enviado', 'entregue'];

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '');
}

/** Série de faturamento dos últimos 8 meses a partir dos pedidos reais. */
function revenueSeries(orders: Order[]): RevenuePoint[] {
  const now = new Date();
  const buckets: RevenuePoint[] = [];

  for (let offset = 7; offset >= 0; offset--) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    const inMonth = orders.filter((order) => {
      const created = new Date(order.createdAt);
      return created >= cursor && created < next && PAID_STATUSES.includes(order.status);
    });

    buckets.push({
      label: monthLabel(cursor),
      revenue: inMonth.reduce((sum, order) => sum + order.total, 0),
      orders: inMonth.length,
    });
  }

  return buckets;
}

export interface AdminOverview {
  metrics: DashboardMetric[];
  revenue: RevenuePoint[];
  recentOrders: Order[];
  statusBreakdown: { status: OrderStatus; count: number; total: number }[];
  topProducts: { product: Product; units: number; revenue: number }[];
  lowStock: Product[];
  customersCount: number;
  productsCount: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const { orders: orderRepo, users, products } = await getRepositories();
  const [orders, customers, catalog] = await Promise.all([
    orderRepo.listAll(),
    users.listAll(),
    products.search({ perPage: 500 }),
  ]);

  const paid = orders.filter((order) => PAID_STATUSES.includes(order.status));
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const ticket = paid.length ? Math.round(revenue / paid.length) : 0;
  const conversion = orders.length ? (paid.length / orders.length) * 100 : 0;

  const unitsBySlug = new Map<string, { units: number; revenue: number }>();
  for (const order of paid) {
    for (const item of order.items) {
      const current = unitsBySlug.get(item.productSlug) ?? { units: 0, revenue: 0 };
      unitsBySlug.set(item.productSlug, {
        units: current.units + item.quantity,
        revenue: current.revenue + item.unitPrice * item.quantity,
      });
    }
  }

  const catalogBySlug = new Map(catalog.items.map((product) => [product.slug, product]));
  const topProducts = [...unitsBySlug.entries()]
    .map(([slug, stats]) => ({ product: catalogBySlug.get(slug), ...stats }))
    .filter((entry): entry is { product: Product; units: number; revenue: number } => Boolean(entry.product))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const statuses: OrderStatus[] = [
    'aguardando-pagamento',
    'pago',
    'separando',
    'enviado',
    'entregue',
    'cancelado',
  ];

  return {
    metrics: [
      { id: 'revenue', label: 'Faturamento', value: revenue, format: 'currency', delta: 18.4, hint: 'Pedidos pagos no período' },
      { id: 'orders', label: 'Pedidos', value: orders.length, format: 'number', delta: 12.1, hint: 'Todos os status' },
      { id: 'ticket', label: 'Ticket médio', value: ticket, format: 'currency', delta: 5.7, hint: 'Média por pedido pago' },
      { id: 'conversion', label: 'Conversão de pagamento', value: conversion, format: 'percent', delta: -2.3, hint: 'Pedidos pagos ÷ criados' },
    ],
    revenue: revenueSeries(orders),
    recentOrders: orders.slice(0, 6),
    statusBreakdown: statuses.map((status) => {
      const bucket = orders.filter((order) => order.status === status);
      return {
        status,
        count: bucket.length,
        total: bucket.reduce((sum, order) => sum + order.total, 0),
      };
    }),
    topProducts,
    lowStock: catalog.items.filter((product) => product.stock <= 4).sort((a, b) => a.stock - b.stock).slice(0, 8),
    customersCount: customers.length,
    productsCount: catalog.total,
  };
}

export async function getAdminCatalog() {
  const { products } = await getRepositories();
  return products.search({ perPage: 500, sort: 'mais-vendidos' });
}

export async function getAdminUsers() {
  const { users, orders } = await getRepositories();
  const [list, allOrders] = await Promise.all([users.listAll(), orders.listAll()]);

  return list.map((user) => {
    const own = allOrders.filter((order) => order.userId === user.id);
    return {
      user,
      orderCount: own.length,
      lifetimeValue: own.reduce((sum, order) => sum + order.total, 0),
      lastOrderAt: own[0]?.createdAt ?? null,
    };
  });
}

export async function getAdminCoupons() {
  const { coupons } = await getRepositories();
  return coupons.listAll();
}
