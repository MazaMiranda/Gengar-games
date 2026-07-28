'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalogFilters } from '@/hooks/use-catalog-filters';
import { PARAM } from '@/lib/catalog-params';
import { cn } from '@/lib/utils';

/** Janela de páginas com reticências — nunca mais que 7 botões. */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap', total];
  if (current >= total - 3) return [1, 'gap', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'gap', current - 1, current, current + 1, 'gap', total];
}

export function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const { set, pending } = useCatalogFilters();

  if (pageCount <= 1) return null;

  const go = (target: number) => {
    set(PARAM.page, target > 1 ? String(target) : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={cn('flex items-center justify-center gap-1.5 transition-opacity', pending && 'opacity-50')}
      aria-label="Paginação"
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="grid size-10 place-items-center rounded-md border border-line text-ink-muted transition-all hover:border-brand-400/50 hover:text-ink disabled:opacity-30 disabled:hover:border-line"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pageWindow(page, pageCount).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-ink-ghost">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => go(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'grid size-10 place-items-center rounded-md border font-tech text-xs font-semibold transition-all duration-300',
              item === page
                ? 'border-brand-400/60 bg-brand-500/18 text-brand-100 shadow-glow-sm'
                : 'border-line text-ink-muted hover:border-brand-400/40 hover:text-ink',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        aria-label="Próxima página"
        className="grid size-10 place-items-center rounded-md border border-line text-ink-muted transition-all hover:border-brand-400/50 hover:text-ink disabled:opacity-30 disabled:hover:border-line"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
