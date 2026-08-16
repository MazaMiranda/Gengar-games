import { MapPin, Pencil, Plus, Star, Trash } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getRepositories } from '@/infrastructure/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Endereços',
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const session = await auth();
  const { users } = await getRepositories();
  const user = await users.findById(session!.user.id);
  const addresses = user?.addresses ?? [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-ink text-xl font-bold">Endereços</h1>
          <p className="text-ink-muted text-sm">
            Cadastre os locais de entrega que você mais usa para agilizar o checkout.
          </p>
        </div>
        <Button size="sm">
          <Plus className="size-4" />
          Novo endereço
        </Button>
      </header>

      {addresses.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="plate hover:border-line-brand flex flex-col gap-4 rounded-xl p-6 transition-all duration-400"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="border-line bg-brand-500/12 text-brand-300 grid size-9 place-items-center rounded-md border">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-ink text-sm font-semibold">{address.label}</p>
                    <p className="text-2xs text-ink-faint">{address.recipient}</p>
                  </div>
                </div>
                {address.isDefault ? (
                  <Badge variant="brand" size="sm">
                    <Star className="size-2.5" weight="fill" />
                    Padrão
                  </Badge>
                ) : null}
              </header>

              <address className="text-ink-muted text-xs leading-relaxed not-italic">
                {address.street}, {address.number}
                {address.complement ? ` · ${address.complement}` : ''}
                <br />
                {address.district} — {address.city}/{address.state}
                <br />
                CEP {address.zip}
              </address>

              <footer className="border-line flex gap-2 border-t pt-4">
                <Button variant="ghost" size="xs">
                  <Pencil className="size-3" />
                  Editar
                </Button>
                {!address.isDefault ? (
                  <>
                    <Button variant="ghost" size="xs">
                      <Star className="size-3" />
                      Tornar padrão
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-ink-faint hover:text-danger ml-auto"
                    >
                      <Trash className="size-3" />
                      Remover
                    </Button>
                  </>
                ) : null}
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="plate flex flex-col items-center gap-4 rounded-xl px-6 py-16 text-center">
          <span className="border-line bg-ink/3 grid size-14 place-items-center rounded-full border">
            <MapPin className="text-ink-faint size-5" />
          </span>
          <div>
            <h2 className="font-display text-ink text-base font-bold">
              Nenhum endereço cadastrado
            </h2>
            <p className="text-ink-muted mt-1.5 text-sm">
              Adicione um endereço para deixar o checkout mais rápido.
            </p>
          </div>
          <Button size="sm">
            <Plus className="size-4" />
            Cadastrar endereço
          </Button>
        </div>
      )}
    </div>
  );
}
