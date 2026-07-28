'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: index * 0.06, ease: EASE_OUT_EXPO },
  }),
};

export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
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

/** Lista com entrada escalonada dos filhos. */
export function StaggerList({ children, className, ...props }: MotionSafeProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? undefined : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerParent}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div variants={fadeUp} custom={index} className={className}>
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
