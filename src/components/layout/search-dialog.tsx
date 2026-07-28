'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, Search, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';

interface SearchHit {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAtPrice: number | null;
  type: string;
  accent: number;
  categorySlug: string;
  stock: number;
  card: { set: string; rarity: string } | null;
}

const SUGGESTIONS = [
  'Charizard',
  'PlayStation 5',
  'Booster box',
  'One Piece',
  'DualSense',
  'Lorcana',
];

async function fetchResults(term: string): Promise<SearchHit[]> {
  const response = await fetch(`/api/products?busca=${encodeURIComponent(term)}&limite=7`);
  if (!response.ok) throw new Error('Falha na busca');
  const data = await response.json();
  return data.items as SearchHit[];
}

export function SearchDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 220);
    return () => clearTimeout(timer);
  }, [term]);

  // Atalho global ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => fetchResults(debounced),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    setOpen(false);
    router.push(`/catalogo?busca=${encodeURIComponent(term.trim())}`);
  };

  const hrefFor = (hit: SearchHit) =>
    hit.type === 'tcg-card' ? `/carta/${hit.slug}` : `/produto/${hit.slug}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        hideClose
        className="top-[12%] max-w-2xl translate-y-0 gap-0 p-0"
        aria-describedby="busca-descricao"
      >
        <DialogTitle className="sr-only">Buscar produtos</DialogTitle>
        <DialogDescription id="busca-descricao" className="sr-only">
          Digite para encontrar cartas, consoles, jogos e acessórios.
        </DialogDescription>

        <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-5">
          <Search className="size-4 shrink-0 text-ink-faint" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Busque por carta, console, jogo ou acessório…"
            className="h-16 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-ghost"
          />
          {isFetching ? <Loader2 className="size-4 animate-spin text-brand-300" /> : null}
          <kbd className="hidden rounded-xs border border-line px-1.5 py-0.5 font-tech text-[0.625rem] text-ink-faint sm:block">
            ESC
          </kbd>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {debounced.length < 2 ? (
            <div className="flex flex-col gap-4 p-3">
              <p className="eyebrow flex items-center gap-2">
                <TrendingUp className="size-3" /> Buscas populares
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setTerm(suggestion)}
                    className="h-9 rounded-sm border border-line bg-white/3 px-3.5 text-xs font-medium text-ink-muted transition-all hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-ink"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : isFetching && !data ? (
            <div className="flex flex-col gap-2 p-1">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <Skeleton className="size-11 rounded-md" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.length ? (
            <ul className="flex flex-col">
              {data.map((hit) => (
                <li key={hit.slug}>
                  <Link
                    href={hrefFor(hit)}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-md p-3 transition-colors hover:bg-white/5"
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-md border border-line"
                      style={{
                        background: `linear-gradient(150deg, hsl(${hit.accent} 70% 20%), rgba(10,10,13,0.9))`,
                      }}
                    >
                      <span className="font-display text-sm font-bold text-white/80">
                        {hit.name.charAt(0)}
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold text-ink">{hit.name}</span>
                      <span className="truncate text-xs text-ink-faint">
                        {hit.card ? hit.card.set : hit.subtitle}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {hit.stock <= 0 ? (
                        <Badge variant="neutral" size="sm">Esgotado</Badge>
                      ) : null}
                      <span className="font-tech text-xs font-semibold text-ink-muted">
                        {formatPrice(hit.price)}
                      </span>
                      <ArrowRight className="size-3.5 text-ink-ghost transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-ink-muted">
                Nada encontrado para <strong className="text-ink">“{debounced}”</strong>.
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                Tente o nome da carta, da coleção ou do console.
              </p>
            </div>
          )}
        </div>

        {debounced.length >= 2 && data?.length ? (
          <button
            type="button"
            onClick={submit}
            className={cn(
              'flex items-center justify-between border-t border-line px-5 py-4 text-xs font-semibold text-ink-muted transition-colors hover:bg-white/4 hover:text-ink',
            )}
          >
            Ver todos os resultados para “{debounced}”
            <ArrowRight className="size-3.5" />
          </button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
