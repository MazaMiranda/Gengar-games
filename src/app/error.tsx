'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
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
        <span className="grid size-16 place-items-center rounded-full border border-danger/30 bg-danger/10">
          <AlertTriangle className="size-7 text-danger" />
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-title font-bold text-ink">Algo saiu do trilho</h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            Tivemos um erro inesperado ao carregar esta página. Já registramos o ocorrido — tente de
            novo em instantes.
          </p>
          {error.digest ? (
            <p className="font-tech text-2xs uppercase tracking-wider text-ink-ghost">
              Código: {error.digest}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset} size="lg">
            <RotateCcw className="size-4" />
            Tentar novamente
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/">
              <Home className="size-4" />
              Ir para a home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
