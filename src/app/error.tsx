'use client';

import { ArrowCounterClockwise, House, Warning } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('[gengar] erro não tratado:', error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-7 text-center">
        <span className="border-danger/30 bg-danger/10 grid size-16 place-items-center rounded-full border">
          <Warning className="text-danger size-7" />
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-title text-ink font-bold">Algo saiu do trilho</h1>
          <p className="text-ink-muted text-sm leading-relaxed">
            Tivemos um erro inesperado ao carregar esta página. Já registramos o ocorrido — tente de
            novo em instantes.
          </p>
          {error.digest ? (
            <p className="font-tech text-2xs text-ink-ghost tracking-wider uppercase">
              Código: {error.digest}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset} size="lg">
            <ArrowCounterClockwise className="size-4" />
            Tentar novamente
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/">
              <House className="size-4" />
              Ir para a home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
