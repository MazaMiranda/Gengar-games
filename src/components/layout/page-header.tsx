import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
      <ol className="text-2xs text-ink-faint flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="text-ink-ghost size-3 shrink-0" /> : null}
            {crumb.href ? (
              // py-2.5 -my-2.5: alvo de toque de ~36px sem empurrar o layout —
              // o texto continua do tamanho visual de sempre.
              <Link
                href={crumb.href}
                className="tap-44 hover:text-brand-300 -my-2.5 py-2.5 transition-colors"
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
    <div className="border-line relative overflow-hidden border-b">
      {accent !== undefined ? (
        <div
          className="absolute -top-28 -right-24 size-72 rounded-full opacity-35 blur-[100px]"
          style={{
            background: `radial-gradient(circle, hsl(${accent} 85% 55% / 0.5), transparent 70%)`,
          }}
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
        'border-line relative overflow-hidden border-b',
        compact ? 'py-10' : 'py-14 md:py-20',
        className,
      )}
    >
      {/*
        Sem Aurora/grid-tech aqui: página interna (catálogo, conta,
        institucional) é modo Operate — atmosfera decorativa recua, o
        produto e a tarefa carregam o peso. O glow de categoria continua,
        mais discreto: é sinal funcional (cor por categoria), não decoração.
      */}
      {accent !== undefined ? (
        <div
          className="absolute -top-20 -right-20 size-80 rounded-full opacity-25 blur-[100px]"
          style={{
            background: `radial-gradient(circle, hsl(${accent} 75% 50% / 0.5), transparent 70%)`,
          }}
          aria-hidden
        />
      ) : null}

      <div className="container-page relative flex flex-col gap-6">
        {crumbs?.length ? <Breadcrumbs crumbs={crumbs} /> : null}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            {/* Sem kicker acima do h1 — banido pelo craft floor. O eyebrow,
                quando existe, vira anotação de cert-label ao lado do título. */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={cn('text-ink font-bold', compact ? 'text-title' : 'text-display')}>
                {title}
              </h1>
              {eyebrow ? <span className="cert-label">{eyebrow}</span> : null}
            </div>
            {description ? (
              <p className="text-ink-muted text-sm leading-relaxed md:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
