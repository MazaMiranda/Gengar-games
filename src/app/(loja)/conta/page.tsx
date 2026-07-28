import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Package, Ticket, TrendingUp } from 'lucide-react';
import { auth } from '@/lib/auth';
import { listOrdersOf } from '@/core/application/order-service';
import { getRepositories } from '@/infrastructure/container';
import { OrderCard } from '@/components/account/order-card';
import { WishlistPreview } from '@/components/account/wishlist-preview';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Minha conta',
  robots: { index: false, follow: false },
};

export default async function AccountOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orders, { users, coupons }] = await Promise.all([listOrdersOf(userId), getRepositories()]);
  const [user, allCoupons] = await Promise.all([users.findById(userId), coupons.listAll()]);

  const spent = orders
    .filter((order) => order.status !== 'cancelado')
    .reduce((sum, order) => sum + order.total, 0);
  const active = orders.filter((order) => !['entregue', 'cancelado'].includes(order.status));
  const myCoupons = allCoupons.filter(
    (coupon) => coupon.active && (user?.coupons ?? []).includes(coupon.code),
  );

  const stats = [
    { label: 'Pedidos realizados', value: String(orders.length), icon: Package },
    { label: 'Total investido', value: formatPrice(spent), icon: TrendingUp },
    { label: 'Cupons disponíveis', value: String(myCoupons.length), icon: Ticket },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="plate flex flex-col gap-3 rounded-xl p-5">
            <span className="grid size-9 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
              <stat.icon className="size-4" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-xl font-bold text-ink">{stat.value}</span>
              <span className="text-2xs text-ink-faint">{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      {active.length ? (
        <section className="flex flex-col gap-5">
          <header className="flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-bold text-ink">Pedidos em andamento</h2>
            <Link
              href="/conta/pedidos"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-brand-200"
            >
              Ver todos
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </header>
          <div className="grid gap-4">
            {active.slice(0, 2).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      ) : (
        <section className="plate flex flex-col items-center gap-4 rounded-xl px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-line bg-white/3">
            <Package className="size-5 text-ink-faint" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink">Nenhum pedido em andamento</h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Assim que você comprar, o acompanhamento aparece aqui.
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/catalogo">Explorar catálogo</Link>
          </Button>
        </section>
      )}

      <WishlistPreview />
    </div>
  );
}
