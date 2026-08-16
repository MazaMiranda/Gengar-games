import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from './motion';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  className?: string;
  actions?: React.ReactNode;
}

/** Cabeçalho padrão de seção: eyebrow técnico, título display e ação à direita. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'Ver tudo',
  align = 'left',
  className,
  actions,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('flex max-w-2xl flex-col gap-3', align === 'center' && 'items-center')}>
        {/*
          Sem kicker acima do título — banido pelo craft floor, sem exceção
          de brief. O título carrega o peso; quando existe, o eyebrow vira
          anotação de cert-label ao lado, não uma linha decorativa antes.
        */}
        <div
          className={cn(
            'flex flex-wrap items-center gap-3',
            align === 'center' && 'justify-center',
          )}
        >
          <h2 className="text-title text-ink font-bold">{title}</h2>
          {eyebrow ? <span className="cert-label">{eyebrow}</span> : null}
        </div>
        {description ? (
          <p className="text-ink-muted text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>

      {actions}

      {href ? (
        <Link
          href={href}
          className="group text-ink-muted hover:text-brand-200 inline-flex shrink-0 items-center gap-2 py-1 text-sm font-semibold transition-colors"
        >
          {linkLabel}
          <span className="border-line ease-out-expo group-hover:border-brand-400/50 group-hover:bg-brand-500/12 group-hover:shadow-glow-sm grid size-9 place-items-center rounded-full border transition-all duration-400">
            <ArrowUpRight className="ease-out-expo size-3.5 transition-transform duration-400 group-hover:translate-x-px group-hover:-translate-y-px" />
          </span>
        </Link>
      ) : null}
    </Reveal>
  );
}

export function Section({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('container-page py-16 md:py-24', className)} {...props}>
      {children}
    </section>
  );
}
