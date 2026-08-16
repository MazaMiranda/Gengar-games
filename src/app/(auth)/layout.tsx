import Link from 'next/link';
import { ArrowLeft, PackageCheck, ScanLine, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { Aurora } from '@/components/layout/aurora';

const PROOF = [
  { icon: ScanLine, text: 'Cada carta conferida à mão antes do envio' },
  { icon: PackageCheck, text: '18 mil pedidos entregues em todo o Brasil' },
  { icon: ShieldCheck, text: 'Garantia Gengar de 90 dias em usados' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Painel de marca */}
      <aside className="grain relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Aurora />
        <div className="grid-tech absolute inset-0 opacity-40" aria-hidden />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative flex flex-col gap-8">
          <h2 className="max-w-md text-display font-extrabold leading-[1.05] text-ink">
            {/* Cor sólida de marca, não degradê — banido pelo craft floor. */}
            A loja que trata sua <span className="text-brand-300">coleção</span> como você trata.
          </h2>
          <ul className="flex flex-col gap-4">
            {PROOF.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink-muted">
                <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-ink/3 text-brand-300">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-tech text-2xs uppercase tracking-[0.28em] text-ink-ghost">
          Gengar Games · Belo Horizonte, Brasil
        </p>
      </aside>

      {/* Formulário */}
      <main className="relative flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <Link
            href="/"
            className="-my-2.5 ml-auto inline-flex items-center gap-2 py-2.5 text-xs font-semibold text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" />
            Voltar para a loja
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
