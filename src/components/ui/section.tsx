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
        {eyebrow ? (
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-linear-to-r from-brand-500 to-transparent" aria-hidden />
            <span className="eyebrow">{eyebrow}</span>
          </div>
        ) : null}
        <h2 className="text-title font-bold text-ink">{title}</h2>
        {description ? <p className="text-sm leading-relaxed text-ink-muted">{description}</p> : null}
      </div>

      {actions}

      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-200"
        >
          {linkLabel}
          <span className="grid size-8 place-items-center rounded-full border border-line transition-all duration-400 ease-out-expo group-hover:border-brand-400/50 group-hover:bg-brand-500/12 group-hover:shadow-glow-sm">
            <ArrowUpRight className="size-3.5 transition-transform duration-400 ease-out-expo group-hover:-translate-y-px group-hover:translate-x-px" />
          </span>
        </Link>
      ) : null}
    </Reveal>
  );
}

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('container-page py-16 md:py-24', className)} {...props}>
      {children}
    </section>
  );
}
