import { Package } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { listOrdersOf } from '@/core/application/order-service';
import { OrderCard } from '@/components/account/order-card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Meus pedidos',
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await auth();
  const orders = await listOrdersOf(session!.user.id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-ink text-xl font-bold">Meus pedidos</h1>
        <p className="text-ink-muted text-sm">
          {orders.length
            ? `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} no histórico.`
            : 'Seu histórico de compras aparece aqui.'}
        </p>
      </header>

      {orders.length ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="plate flex flex-col items-center gap-4 rounded-xl px-6 py-16 text-center">
          <span className="border-line bg-ink/3 grid size-14 place-items-center rounded-full border">
            <Package className="text-ink-faint size-5" />
          </span>
          <div>
            <h2 className="font-display text-ink text-base font-bold">Nenhum pedido ainda</h2>
            <p className="text-ink-muted mt-1.5 text-sm">
              Que tal começar pela sua primeira carta?
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/catalogo">Ver catálogo</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
