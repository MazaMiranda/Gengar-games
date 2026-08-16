'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MoveDown, ShieldCheck, Truck } from 'lucide-react';
import type { Product } from '@/core/domain/entities';
import { Button } from '@/components/ui/button';
import { Aurora } from '@/components/layout/aurora';
import { ProductVisual } from '@/components/shop/product-visual';
import { EASE_OUT_EXPO } from '@/components/ui/motion';
import { formatCompact, formatPrice } from '@/lib/utils';

interface HeroProps {
  featured: Product[];
  totalProdutos: number;
}

const stats = [
  { label: 'Produtos no catálogo', suffix: '+' },
  { label: 'Pedidos entregues', value: 18400, suffix: '+' },
  { label: 'Nota média dos clientes', value: 4.9, suffix: '/5' },
];

export function Hero({ featured, totalProdutos }: HeroProps) {
  const reduced = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const artY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [primary, secondary, tertiary] = featured;

  return (
    <section
      ref={containerRef}
      className="grain border-line relative flex min-h-[92svh] items-center overflow-hidden border-b pt-10 pb-16 md:min-h-[94svh]"
    >
      <Aurora />
      <div className="grid-tech mask-fade-b absolute inset-0 opacity-40" aria-hidden />

      <div className="container-page relative grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <motion.div
          style={{ y: copyY, opacity: fade }}
          className="flex flex-col gap-8 lg:col-span-6"
        >
          <motion.h1
            initial={reduced ? false : { y: 28 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.06, ease: EASE_OUT_EXPO }}
            className="text-hero max-w-xl font-extrabold text-balance"
          >
            <span className="text-ink">Sua coleção merece uma </span>
            {/* Peso e o sweep de foil embaixo carregam a ênfase — texto em
                degradê é decoração sem função, banida pelo craft floor. */}
            <span className="text-ink relative">
              loja à altura
              <span
                className="absolute -bottom-1 left-0 h-[3px] w-full bg-[image:var(--gradient-foil-sweep)]"
                aria-hidden
              />
            </span>
          </motion.h1>

          <motion.p
            initial={reduced ? false : { y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.14, ease: EASE_OUT_EXPO }}
            className="text-ink-muted max-w-lg text-base leading-relaxed"
          >
            Cartas conferidas uma a uma, consoles testados na bancada e colecionáveis com
            procedência. Do single de Pokémon ao PS5 Pro, tudo com o mesmo cuidado obsessivo.
          </motion.p>

          <motion.div
            initial={reduced ? false : { y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/catalogo">
                Explorar catálogo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/tcg">Área TCG</Link>
            </Button>
          </motion.div>

          <motion.dl
            initial={reduced ? false : { y: 14 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="border-line grid max-w-lg grid-cols-3 gap-6 border-t pt-7"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dd className="font-display text-ink text-2xl font-bold">
                  {index === 0 ? formatCompact(totalProdutos) : formatCompact(stat.value ?? 0)}
                  <span className="text-brand-300">{stat.suffix}</span>
                </dd>
                <dt className="text-2xs text-ink-faint leading-snug">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>

          <div className="text-2xs text-ink-faint flex flex-wrap gap-5">
            <span className="flex items-center gap-2">
              <Truck className="text-brand-400 size-3.5" /> Frete grátis acima de R$ 299
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="text-brand-400 size-3.5" /> Garantia Gengar de 90 dias
            </span>
          </div>
        </motion.div>

        {/* Vitrine flutuante */}
        <motion.div
          style={{ y: artY }}
          className="relative hidden h-[38rem] lg:col-span-6 lg:block"
          aria-hidden={!primary}
        >
          {/*
            Faixa de cert-label presa na vitrine — carrega o número do drop e
            o status de envio como um selo real, não um kicker decorativo
            solto acima do título (banido pelo craft floor).
          */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE_OUT_EXPO }}
            className="cert-label absolute top-6 left-0 z-3 -rotate-2"
          >
            Drop nº 001 · Pré-vendas abertas
          </motion.div>

          {/* z-2: o card terciário cruza o rodapé deste e cobriria o preço. */}
          {primary ? (
            <FloatingCard product={primary} index={0} className="top-16 left-0 z-2 w-52 xl:w-56" />
          ) : null}
          {secondary ? (
            <FloatingCard
              product={secondary}
              index={1}
              className="top-[20%] right-0 w-56 xl:w-60"
              tone="muted"
            />
          ) : null}
          {tertiary ? (
            <FloatingCard
              product={tertiary}
              index={2}
              className="bottom-0 left-[28%] w-44 xl:w-48"
              tone="muted"
            />
          ) : null}

          <div
            className="absolute inset-0 -z-1 rounded-full opacity-60 blur-[100px]"
            style={{
              background:
                'radial-gradient(circle at 40% 40%, rgba(147,51,234,0.32), transparent 45%), radial-gradient(circle at 65% 60%, rgba(232,57,156,0.22), transparent 50%), radial-gradient(circle at 55% 25%, rgba(232,178,63,0.14), transparent 55%)',
            }}
          />
        </motion.div>
      </div>

      {/* Indicador de rolagem */}
      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-6 hidden justify-center md:flex"
      >
        <span className="font-tech text-2xs text-ink-ghost flex items-center gap-2 tracking-[0.3em] uppercase">
          {/* animate-pulse, não bounce: objeto real não quica — só um pulso
              de opacidade discreto convida a rolar. */}
          <MoveDown className="size-3 animate-pulse" />
          Role para descobrir
        </span>
      </motion.div>
    </section>
  );
}

function FloatingCard({
  product,
  index,
  className,
  tone = 'primary',
}: {
  product: Product;
  index: number;
  className?: string;
  tone?: 'primary' | 'muted';
}) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      initial={reduced ? false : { y: 40, rotate: index % 2 ? 4 : -4 }}
      animate={{ y: 0, rotate: index % 2 ? 3 : -3 }}
      transition={{ duration: 1, delay: 0.2 + index * 0.12, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -12, rotate: 0, scale: 1.03 }}
      className={`absolute ${className}`}
    >
      <Link
        href={product.type === 'tcg-card' ? `/carta/${product.slug}` : `/produto/${product.slug}`}
        className="plate group shadow-lift block overflow-hidden rounded-xl"
      >
        <div className="holo relative aspect-4/5 overflow-hidden">
          <ProductVisual product={product} priority={index === 0} />
        </div>
        {/* O nome ocupa a linha inteira; dividir a linha com o preço o cortava
            no meio da palavra em cards estreitos. */}
        <div className="flex flex-col gap-1.5 p-4">
          <p className="font-display text-ink line-clamp-2 text-xs leading-snug font-semibold">
            {product.name}
          </p>
          <div className="flex items-baseline justify-between gap-2">
            {/* min-w-0: sem isso o nowrap do truncate impede o encolhimento e o
                texto passa por baixo do preço. */}
            <p className="font-tech text-2xs text-ink-faint min-w-0 truncate tracking-wider uppercase">
              {product.card?.set ?? product.subtitle}
            </p>
            <span
              className={`font-display shrink-0 text-sm font-bold ${
                tone === 'primary' ? 'text-brand-200' : 'text-ink-muted'
              }`}
            >
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
