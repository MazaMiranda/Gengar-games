import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Apenas o símbolo, sem wordmark. */
  compact?: boolean;
  /** Esconde o wordmark em telas estreitas — usado no header da loja. */
  markOnlyOnMobile?: boolean;
  href?: string;
}

/** Marca da casa: coroa espectral + wordmark. */
export function Logo({ className, compact, markOnlyOnMobile, href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Gengar Games — página inicial"
      className={cn('group inline-flex items-center gap-3', className)}
    >
      <span className="relative grid size-10 shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-md bg-linear-to-br from-brand-400/80 to-brand-700 opacity-90 transition-all duration-500 ease-out-expo group-hover:opacity-100 group-hover:shadow-glow" />
        <svg viewBox="0 0 32 32" fill="none" className="relative size-6 text-white" aria-hidden>
          <path
            d="M4 13.5 7.2 6l3.4 5.2L16 3.5l5.4 7.7L24.8 6 28 13.5v9.2c0 3.2-2.4 5.8-5.4 5.8-1.6 0-2.6-.8-3.4-1.6-.6-.6-1.4-1-2.2-1s-1.6.4-2.2 1c-.8.8-1.8 1.6-3.4 1.6-3 0-5.4-2.6-5.4-5.8V13.5Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <ellipse cx="12" cy="17" rx="2.1" ry="2.6" fill="#3f1178" />
          <ellipse cx="20" cy="17" rx="2.1" ry="2.6" fill="#3f1178" />
        </svg>
      </span>

      {!compact ? (
        <span className={cn('flex flex-col leading-none', markOnlyOnMobile && 'hidden sm:flex')}>
          <span className="whitespace-nowrap font-display text-base font-extrabold tracking-tight text-ink">
            GENGAR
            <span className="text-gradient-brand"> GAMES</span>
          </span>
          <span className="mt-0.5 hidden whitespace-nowrap font-tech text-[0.5625rem] uppercase tracking-[0.34em] text-ink-faint sm:block">
            TCG · Consoles
          </span>
        </span>
      ) : null}
    </Link>
  );
}
