'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/*
 * A revelação move, mas nunca apaga.
 *
 * O estado inicial destas animações é renderizado no servidor e vai no HTML.
 * Enquanto ele incluía `opacity: 0`, a página saía do servidor com o conteúdo
 * invisível — 56 blocos só na home — e só aparecia quando o JavaScript
 * assumia. Bastava a rede engasgar, um script falhar, ou o visitante pedir
 * menos movimento, para a loja ficar em branco.
 *
 * Animando só o deslocamento, o pior caso é o texto nascer 16px abaixo do
 * lugar: legível desde o primeiro byte, com ou sem JavaScript.
 */
export const fadeUp: Variants = {
  hidden: { y: 16 },
  visible: (index: number = 0) => ({
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

/**
 * Revelação em scroll — respeita prefers-reduced-motion.
 *
 * Quem pede menos movimento recebe o elemento cru, sem componente de animação
 * nenhum. A versão anterior passava `initial`/`whileInView` como `undefined`
 * nesse caso, e isso escondia a página inteira: useReducedMotion devolve false
 * no servidor e só vira true depois da hidratação, então o HTML já chegava com
 * opacity:0 gravado pelo `initial`; quando o valor virava, sumiam junto o
 * `initial` e o alvo do `whileInView`, e não sobrava nada para trazer o
 * conteúdo de volta. Ficava invisível para sempre — em iOS, onde "reduzir
 * movimento" é comum, a página institucional aparecia em branco.
 *
 * Devolver o elemento simples corta o problema pela raiz: sem observador, sem
 * estado inicial, sem depender de a preferência chegar antes ou depois.
 */
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

  if (reduced) {
    // A tag varia em runtime; o contrato de props é o de uma div (ver acima).
    const Tag = as as 'div';
    // O style explícito não é decoração: o servidor já gravou o deslocamento
    // no atributo, e um elemento sem prop `style` não faz o React limpá-lo.
    return (
      <Tag className={className} {...props} style={{ transform: 'none' }}>
        {children}
      </Tag>
    );
  }

  return (
    <Component
      initial={{ y }}
      whileInView={{ y: 0 }}
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

  // Mesmo motivo do Reveal: com menos movimento, elemento cru. Aqui o risco era
  // maior — é o card do catálogo, ou seja, a loja inteira sumiria.
  if (reduced) return <div className={className} style={{ transform: 'none' }}>{children}</div>;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
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
