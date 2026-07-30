'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MoveDown, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import type { Product } from '@/core/domain/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      className="grain relative flex min-h-[92svh] items-center overflow-hidden border-b border-line pb-16 pt-10 md:min-h-[94svh]"
    >
      <Aurora />
      <div className="grid-tech absolute inset-0 opacity-40 mask-fade-b" aria-hidden />

      <div className="container-page relative grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <motion.div style={{ y: copyY, opacity: fade }} className="flex flex-col gap-8 lg:col-span-6">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="flex flex-wrap items-center gap-3"
          >
            <Badge variant="brand" size="lg" className="gap-2">
              <Sparkles className="size-3" />
              Drop da semana
            </Badge>
            <span className="font-tech text-2xs uppercase tracking-[0.24em] text-ink-faint">
              Pré-vendas abertas · envio imediato
            </span>
          </motion.div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.06, ease: EASE_OUT_EXPO }}
            className="max-w-xl text-hero font-extrabold text-balance"
          >
            <span className="text-ink">Sua coleção merece uma </span>
            <span className="relative text-gradient-brand">
              loja à altura
              <span
                className="absolute -bottom-1 left-0 h-[3px] w-full bg-linear-to-r from-brand-400 to-transparent"
                aria-hidden
              />
            </span>
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.14, ease: EASE_OUT_EXPO }}
            className="max-w-lg text-base leading-relaxed text-ink-muted"
          >
            Cartas conferidas uma a uma, consoles testados na bancada e colecionáveis com procedência.
            Do single de Pokémon ao PS5 Pro, tudo com o mesmo cuidado obsessivo.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-7"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dd className="font-display text-2xl font-bold text-ink">
                  {index === 0 ? formatCompact(totalProdutos) : formatCompact(stat.value ?? 0)}
                  <span className="text-brand-300">{stat.suffix}</span>
                </dd>
                <dt className="text-2xs leading-snug text-ink-faint">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>

          <div className="flex flex-wrap gap-5 text-2xs text-ink-faint">
            <span className="flex items-center gap-2">
              <Truck className="size-3.5 text-brand-400" /> Frete grátis acima de R$ 299
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-brand-400" /> Garantia Gengar de 90 dias
            </span>
          </div>
        </motion.div>

        {/* Vitrine flutuante */}
        <motion.div
          style={{ y: artY }}
          className="relative hidden h-[38rem] lg:col-span-6 lg:block"
          aria-hidden={!primary}
        >
          {/* z-2: o card terciário cruza o rodapé deste e cobriria o preço. */}
          {primary ? (
            <FloatingCard product={primary} index={0} className="left-0 top-0 z-2 w-52 xl:w-56" />
          ) : null}
          {secondary ? (
            <FloatingCard
              product={secondary}
              index={1}
              className="right-0 top-[20%] w-56 xl:w-60"
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
            style={{ background: 'radial-gradient(circle at 50% 45%, rgba(147,51,234,0.35), transparent 65%)' }}
          />
        </motion.div>
      </div>

      {/* Indicador de rolagem */}
      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-6 hidden justify-center md:flex"
      >
        <span className="flex items-center gap-2 font-tech text-2xs uppercase tracking-[0.3em] text-ink-ghost">
          <MoveDown className="size-3 animate-bounce" />
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
      initial={reduced ? false : { opacity: 0, y: 40, rotate: index % 2 ? 4 : -4 }}
      animate={{ opacity: 1, y: 0, rotate: index % 2 ? 3 : -3 }}
      transition={{ duration: 1, delay: 0.2 + index * 0.12, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -12, rotate: 0, scale: 1.03 }}
      className={`absolute ${className}`}
    >
      <Link
        href={product.type === 'tcg-card' ? `/carta/${product.slug}` : `/produto/${product.slug}`}
        className="plate group block overflow-hidden rounded-xl shadow-lift"
      >
        <div className="holo relative aspect-4/5 overflow-hidden">
          <ProductVisual product={product} priority={index === 0} />
        </div>
        {/* O nome ocupa a linha inteira; dividir a linha com o preço o cortava
            no meio da palavra em cards estreitos. */}
        <div className="flex flex-col gap-1.5 p-4">
          <p className="line-clamp-2 font-display text-xs font-semibold leading-snug text-ink">
            {product.name}
          </p>
          <div className="flex items-baseline justify-between gap-2">
            {/* min-w-0: sem isso o nowrap do truncate impede o encolhimento e o
                texto passa por baixo do preço. */}
            <p className="min-w-0 truncate font-tech text-2xs uppercase tracking-wider text-ink-faint">
              {product.card?.set ?? product.subtitle}
            </p>
            <span
              className={`shrink-0 font-display text-sm font-bold ${
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
