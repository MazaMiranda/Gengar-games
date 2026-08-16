'use client';

import { CircleNotch, ImageBroken, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { TcgdexMatch, TcgdexSuggestion } from '@/infrastructure/tcgdex/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CardPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recebe a ficha completa da carta escolhida. */
  onSelect: (match: TcgdexMatch) => void;
}

/**
 * Escolha visual da carta na TCGdex.
 *
 * Digitar o nome e reconhecer a arte é muito mais confiável do que digitar
 * número e coleção à mão — é o mesmo Charizard em dez coleções diferentes, e
 * a arte é o que o operador tem na mesa.
 */
export function CardPicker({ open, onOpenChange, onSelect }: CardPickerProps) {
  const [term, setTerm] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [results, setResults] = React.useState<TcgdexSuggestion[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [searched, setSearched] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 350);
    return () => clearTimeout(timer);
  }, [term]);

  React.useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    (async () => {
      try {
        const response = await fetch('/api/admin/tcgdex/buscar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: debounced }),
        });
        const payload = await response.json().catch(() => null);
        // Uma busca mais nova já saiu na frente: descarta esta resposta.
        if (cancelled) return;
        setResults(payload?.ok ? (payload.results as TcgdexSuggestion[]) : []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) {
          setSearching(false);
          setSearched(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const choose = async (suggestion: TcgdexSuggestion) => {
    setLoadingId(suggestion.id);
    try {
      const response = await fetch('/api/admin/tcgdex/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestion.id }),
      });
      const payload = await response.json().catch(() => null);

      if (!payload?.ok) {
        toast.error(payload?.message ?? 'Não foi possível carregar esta carta.');
        return;
      }

      onSelect(payload.match as TcgdexMatch);
      onOpenChange(false);
      setTerm('');
    } catch {
      toast.error('Falha de rede ao falar com a TCGdex.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="border-line border-b px-5 py-4">
          <DialogTitle>Escolher a carta</DialogTitle>
          <DialogDescription>
            Busque pelo nome e clique na arte correspondente. Número, coleção, raridade e a imagem
            entram no cadastro automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="border-line flex items-center gap-3 border-b px-5">
          <MagnifyingGlass className="text-ink-faint size-4 shrink-0" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Nome da carta — ex.: Greninja, Charizard ex…"
            className="text-ink placeholder:text-ink-ghost h-14 flex-1 bg-transparent text-sm outline-none"
          />
          {searching ? <CircleNotch className="text-brand-300 size-4 animate-spin" /> : null}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {debounced.length < 2 ? (
            <p className="text-ink-faint py-10 text-center text-sm">
              Digite ao menos duas letras do nome da carta.
            </p>
          ) : searching && !results.length ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className="bg-ink/6 aspect-[5/7] animate-pulse rounded-md" />
              ))}
            </div>
          ) : results.length ? (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {results.map((card) => (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => choose(card)}
                    disabled={loadingId !== null}
                    title={`${card.name} · ${card.localId}`}
                    className={cn(
                      'group border-line relative block w-full overflow-hidden rounded-md border transition-all duration-300',
                      'hover:border-brand-400/60 hover:shadow-glow-sm hover:-translate-y-0.5',
                      'focus-visible:border-brand-400 disabled:opacity-50',
                    )}
                  >
                    <span className="bg-ink/6 relative block aspect-[5/7]">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          sizes="(max-width: 768px) 33vw, 160px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-ink-ghost grid h-full place-items-center">
                          <ImageBroken className="size-5" />
                        </span>
                      )}

                      {loadingId === card.id ? (
                        <span className="bg-void/70 absolute inset-0 grid place-items-center">
                          <CircleNotch className="text-brand-200 size-5 animate-spin" />
                        </span>
                      ) : null}
                    </span>

                    <span className="text-ink-muted block truncate px-2 py-1.5 text-left text-[0.625rem]">
                      {card.name} · {card.localId}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : searched ? (
            <div className="py-10 text-center">
              <p className="text-ink-muted text-sm">
                Nada encontrado para <strong className="text-ink">“{debounced}”</strong>.
              </p>
              <p className="text-ink-faint mt-1 text-xs">
                Tente o nome em inglês — é como a maioria das cartas está catalogada.
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
