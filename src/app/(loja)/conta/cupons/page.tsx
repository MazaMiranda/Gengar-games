import type { Metadata } from 'next';
import { Ticket } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getRepositories } from '@/infrastructure/container';
import { CouponCard } from '@/components/account/coupon-card';

export const metadata: Metadata = {
  title: 'Meus cupons',
  robots: { index: false, follow: false },
};

export default async function CouponsPage() {
  const session = await auth();
  const { users, coupons } = await getRepositories();
  const [user, all] = await Promise.all([users.findById(session!.user.id), coupons.listAll()]);

  const mine = all.filter((coupon) => (user?.coupons ?? []).includes(coupon.code));
  const available = all.filter(
    (coupon) => coupon.active && !mine.some((item) => item.code === coupon.code),
  );

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-xl font-bold text-ink">Meus cupons</h1>
        <p className="text-sm text-ink-muted">
          Aplique no carrinho antes de finalizar. Um cupom por pedido.
        </p>
      </header>

      {mine.length ? (
        <section className="flex flex-col gap-4">
          <h2 className="eyebrow">Disponíveis para você</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mine.map((coupon) => (
              <CouponCard key={coupon.code} coupon={coupon} owned />
            ))}
          </div>
        </section>
      ) : (
        <div className="plate flex flex-col items-center gap-4 rounded-xl px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-line bg-white/3">
            <Ticket className="size-5 text-ink-faint" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink">Nenhum cupom na sua carteira</h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Assine a newsletter para receber cupons exclusivos antes de todo mundo.
            </p>
          </div>
        </div>
      )}

      {available.length ? (
        <section className="flex flex-col gap-4">
          <h2 className="eyebrow">Campanhas abertas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {available.map((coupon) => (
              <CouponCard key={coupon.code} coupon={coupon} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
