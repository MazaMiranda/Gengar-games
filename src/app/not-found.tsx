import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Aurora } from '@/components/layout/aurora';
import { Logo } from '@/components/layout/logo';

export default function NotFound() {
  return (
    <div className="grain relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <Aurora />
      <div className="grid-tech absolute inset-0 opacity-30" aria-hidden />

      <div className="relative flex max-w-lg flex-col items-center gap-8 text-center">
        <Logo />

        <div className="flex flex-col items-center gap-4">
          {/* Peso e o sweep de foil embaixo carregam a ênfase — sem
              texto em degradê (banido pelo craft floor). */}
          <span className="relative font-display text-[7rem] font-extrabold leading-none text-ink">
            404
            <span
              className="absolute -bottom-2 left-1/2 h-[3px] w-2/3 -translate-x-1/2 bg-[image:var(--gradient-foil-sweep)]"
              aria-hidden
            />
          </span>
          <h1 className="text-title font-bold text-ink">Essa carta não está no deck</h1>
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
            A página que você procurou saiu de linha, mudou de endereço ou nunca existiu. Nosso
            catálogo continua inteiro logo ali.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/catalogo">
              <Search className="size-4" />
              Explorar catálogo
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
