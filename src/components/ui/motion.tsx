'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    // Curto de propósito: isto roda a cada troca de filtro, e resultado de
    // busca precisa parecer imediato, não coreografado.
    transition: { duration: 0.42, delay: index * 0.035, ease: EASE_OUT_EXPO },
  }),
};

type MotionSafeProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>;

interface RevealProps extends MotionSafeProps {
  delay?: number;
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
  once?: boolean;
}

/** Revelação em scroll — respeita prefers-reduced-motion automaticamente. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = 'div',
  once = true,
  ...props
}: RevealProps) {
  const reduced = useReducedMotion();
  // A tag varia, mas o contrato de props permanece o de uma div.
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      initial={reduced ? undefined : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: EASE_OUT_EXPO }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Contêiner da lista. Não orquestra a animação de propósito.
 *
 * Quando o pai orquestrava (variants + whileInView + once), ele disparava uma
 * vez e parava de observar; numa lista que muda — o catálogo ao trocar filtro —
 * os itens montados depois nunca recebiam a ordem de aparecer e ficavam presos
 * em opacity 0. Cada item agora se anima sozinho (ver StaggerItem).
 */
export function StaggerList({ children, className, ...props }: MotionSafeProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

/** Item que revela a si mesmo ao entrar na viewport, independente do pai. */
export function StaggerItem({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? undefined : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      custom={index}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Faixa infinita de texto — usada no ticker do topo e nas marcas. */
export function Marquee({
  children,
  className,
  speed = 42,
  reverse,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
}) {
  return (
    <div className={cn('mask-fade-x group relative flex overflow-hidden', className)}>
      <div
        className="flex shrink-0 items-center gap-12 pr-12 group-hover:[animation-play-state:paused]"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
