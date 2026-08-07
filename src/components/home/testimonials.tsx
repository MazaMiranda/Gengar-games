'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Testimonial } from '@/core/domain/entities';
import { Rating } from '@/components/ui/rating';
import { cn } from '@/lib/utils';

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setActive((value) => (value + 1) % testimonials.length), 6500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const current = testimonials[active]!;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="plate grain relative min-h-[19rem] overflow-hidden rounded-2xl p-8 md:p-12">
          <Quote className="absolute right-8 top-8 size-20 text-brand-500/12" strokeWidth={1} aria-hidden />
          <div
            className="absolute -left-20 -top-20 size-64 rounded-full opacity-50 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.45), transparent 70%)' }}
            aria-hidden
          />

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={current.id}
              // Sem opacity no estado inicial: este bloco é renderizado no
              // servidor, e a citação sumiria até o JavaScript assumir.
              initial={{ y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full flex-col justify-between gap-8"
            >
              <div className="flex flex-col gap-5">
                <Rating value={current.rating} size="lg" showValue={false} />
                <p className="font-display text-xl leading-relaxed text-ink md:text-2xl">
                  “{current.quote}”
                </p>
              </div>

              <footer className="flex flex-wrap items-center gap-4">
                <span className="grid size-11 place-items-center rounded-full border border-line bg-linear-to-br from-brand-500/40 to-brand-800/40 font-display text-sm font-bold text-ink">
                  {current.author.charAt(0)}
                </span>
                <div className="flex flex-col">
                  <cite className="not-italic font-semibold text-ink">{current.author}</cite>
                  <span className="font-tech text-2xs uppercase tracking-wider text-ink-faint">
                    {current.handle} · {current.city}
                  </span>
                </div>
                <span className="ml-auto rounded-sm border border-line bg-ink/3 px-3 py-1.5 text-2xs text-ink-muted">
                  Comprou: {current.purchase}
                </span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex gap-2" role="tablist" aria-label="Depoimentos">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Depoimento de ${testimonial.author}`}
              onClick={() => setActive(index)}
              className={cn(
                'h-1 rounded-full transition-all duration-500 ease-out-expo',
                index === active ? 'w-10 bg-brand-400 shadow-glow-sm' : 'w-5 bg-ink/12 hover:bg-ink/25',
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:col-span-5">
        {testimonials
          .filter((_, index) => index !== active)
          .slice(0, 3)
          .map((testimonial) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => setActive(testimonials.indexOf(testimonial))}
              className="group flex flex-col gap-3 rounded-lg border border-line bg-surface/50 p-5 text-left transition-all duration-400 ease-out-expo hover:border-line-brand hover:bg-surface"
            >
              <Rating value={testimonial.rating} size="sm" showValue={false} />
              <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted transition-colors group-hover:text-ink">
                {testimonial.quote}
              </p>
              <span className="font-tech text-2xs uppercase tracking-wider text-ink-ghost">
                {testimonial.author} · {testimonial.city}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
