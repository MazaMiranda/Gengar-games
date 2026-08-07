import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import logoArt from '../../../public/logo.png';

interface LogoProps {
  className?: string;
  /** Caixa quadrada e menor — para barras estreitas, como a do admin no celular. */
  compact?: boolean;
  href?: string;
}

/**
 * Marca da casa.
 *
 * A arte já traz o nome escrito, então ela substitui o conjunto selo+texto
 * antigo — repetir "GENGAR GAMES" ao lado seria dizer a mesma coisa duas vezes.
 *
 * A placa fica escura nos dois temas de propósito, e não acompanha --t-void:
 * o "GAMES" da arte é branco puro (medido: 6 mil pixels), então sobre o fundo
 * claro do site ele simplesmente sumiria. A placa é o que garante que a marca
 * se leia igual no claro e no escuro.
 */
export function Logo({ className, compact, href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Gengar Games — página inicial"
      className={cn('group inline-flex items-center', className)}
    >
      <span
        className={cn(
          'relative grid place-items-center overflow-hidden rounded-lg bg-[#12101a]',
          'ring-1 ring-inset ring-white/8 transition-all duration-500 ease-out-expo',
          'group-hover:ring-brand-400/40 group-hover:shadow-glow',
          compact ? 'size-11' : 'px-2.5 py-1.5',
        )}
      >
        <Image
          src={logoArt}
          alt=""
          priority
          sizes="180px"
          className={cn('w-auto object-contain', compact ? 'h-8' : 'h-9 sm:h-10')}
        />
      </span>
    </Link>
  );
}
