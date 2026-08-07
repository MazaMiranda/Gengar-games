import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Aurora } from './aurora';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  accent?: number;
  className?: string;
  compact?: boolean;
}

/** Trilha de navegação. Isolada para poder existir sem o cabeçalho inteiro. */
export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  if (!crumbs.length) return null;

  return (
    <nav aria-label="Você está aqui" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-2xs text-ink-faint">
        {crumbs.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="size-3 shrink-0 text-ink-ghost" /> : null}
            {crumb.href ? (
              // py-2.5 -my-2.5: alvo de toque de ~36px sem empurrar o layout —
              // o texto continua do tamanho visual de sempre.
              <Link
                href={crumb.href}
                className="tap-44 -my-2.5 py-2.5 transition-colors hover:text-brand-300"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ink-muted">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Faixa fina só com a trilha — para páginas cujo título já é o h1 de outro
 * bloco, como o da buy box. Evita repetir o nome do produto em display.
 */
export function BreadcrumbBar({ crumbs, accent }: { crumbs: Crumb[]; accent?: number }) {
  return (
    <div className="relative overflow-hidden border-b border-line">
      {accent !== undefined ? (
        <div
          className="absolute -right-24 -top-28 size-72 rounded-full opacity-35 blur-[100px]"
          style={{ background: `radial-gradient(circle, hsl(${accent} 85% 55% / 0.5), transparent 70%)` }}
          aria-hidden
        />
      ) : null}
      <div className="container-page relative py-4">
        <Breadcrumbs crumbs={crumbs} />
      </div>
    </div>
  );
}

/** Cabeçalho de página interna: breadcrumb, título e atmosfera de marca. */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  accent,
  className,
  compact,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'grain relative overflow-hidden border-b border-line',
        compact ? 'py-10' : 'py-14 md:py-20',
        className,
      )}
    >
      <Aurora intensity={0.55} />
      <div className="grid-tech absolute inset-0 opacity-30 mask-fade-b" aria-hidden />
      {accent !== undefined ? (
        <div
          className="absolute -right-20 -top-20 size-96 rounded-full opacity-40 blur-[110px]"
          style={{ background: `radial-gradient(circle, hsl(${accent} 85% 55% / 0.55), transparent 70%)` }}
          aria-hidden
        />
      ) : null}

      <div className="container-page relative flex flex-col gap-6">
        {crumbs?.length ? <Breadcrumbs crumbs={crumbs} /> : null}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <h1 className={cn('font-bold text-ink', compact ? 'text-title' : 'text-display')}>{title}</h1>
            {description ? (
              <p className="text-sm leading-relaxed text-ink-muted md:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
