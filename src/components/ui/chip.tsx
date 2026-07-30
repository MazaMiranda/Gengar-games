'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
  active?: boolean;
}

/** Chip removível — usado nos filtros ativos do catálogo. */
export function Chip({ className, children, onRemove, active, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'group inline-flex h-8 items-center gap-2 rounded-sm border px-3 text-xs font-medium transition-all duration-200',
        active
          ? 'border-brand-400/45 bg-brand-500/15 text-brand-100'
          : 'border-line bg-ink/4 text-ink-muted hover:border-line-strong hover:text-ink',
        className,
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1 grid size-4 place-items-center rounded-xs text-ink-faint transition-colors hover:bg-ink/10 hover:text-ink"
          aria-label="Remover filtro"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

interface ToggleChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  count?: number;
}

/** Chip clicável de seleção (facetas rápidas, tamanhos, plataformas). */
export function ToggleChip({ className, children, selected, count, ...props }: ToggleChipProps) {
  return (
    <button
      type="button"
      data-selected={selected}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-sm border px-3.5 text-xs font-semibold transition-all duration-300 ease-out-expo',
        selected
          ? 'border-brand-400/60 bg-brand-500/18 text-brand-100 shadow-glow-sm'
          : 'border-line bg-ink/3 text-ink-muted hover:border-brand-400/35 hover:bg-brand-500/8 hover:text-ink',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span className="font-tech text-[0.625rem] text-ink-faint">{count}</span>
      ) : null}
    </button>
  );
}
