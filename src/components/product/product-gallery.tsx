'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Play, ZoomIn } from 'lucide-react';
import type { Product } from '@/core/domain/entities';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ProductVisual } from '@/components/shop/product-visual';
import { cn } from '@/lib/utils';

/** Galeria com miniaturas, zoom por ponteiro e ampliação em diálogo. */
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = React.useState(0);
  const [zooming, setZooming] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });
  const [expanded, setExpanded] = React.useState(false);

  const media = product.media.length ? product.media : [{ id: 'default', kind: 'art' as const, label: 'Frente' }];
  const current = media[active]!;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
    event.currentTarget.style.setProperty('--mx', `${x}%`);
    event.currentTarget.style.setProperty('--my', `${y}%`);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:gap-5">
      {/* Palco */}
      <div className="relative flex-1">
        <div
          onPointerMove={handleMove}
          onPointerEnter={() => setZooming(true)}
          onPointerLeave={() => setZooming(false)}
          className="holo plate group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
              style={{
                transform: zooming ? 'scale(1.55)' : 'scale(1)',
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <ProductVisual product={product} variant="detail" frame={active} priority />
            </motion.div>
          </AnimatePresence>

          {current.kind === 'video' ? (
            <span className="absolute inset-0 z-3 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full border border-ink/25 bg-void/60 backdrop-blur-md">
                <Play className="size-5 translate-x-0.5 fill-white text-white" />
              </span>
            </span>
          ) : null}

          <span className="pointer-events-none absolute bottom-4 left-4 z-3 flex items-center gap-1.5 rounded-sm border border-line bg-void/70 px-2.5 py-1.5 font-tech text-2xs uppercase tracking-wider text-ink-muted opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
            <ZoomIn className="size-3" />
            Passe o mouse para ampliar
          </span>

          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Ampliar imagem"
            className="absolute right-4 top-4 z-3 grid size-9 place-items-center rounded-md border border-line bg-void/60 text-ink-muted backdrop-blur-md transition-all hover:border-brand-400/50 hover:text-ink"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Miniaturas */}
      <div className="flex gap-3 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0">
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Ver ${item.label}`}
            aria-current={index === active}
            className={cn(
              'relative aspect-square w-20 shrink-0 overflow-hidden rounded-md border transition-all duration-300 ease-out-expo',
              index === active
                ? 'border-brand-400/70 shadow-glow-sm'
                : 'border-line opacity-60 hover:opacity-100',
            )}
          >
            <ProductVisual product={product} variant="thumb" frame={index} />
            {item.kind === 'video' ? (
              <span className="absolute inset-0 z-3 grid place-items-center bg-void/40">
                <Play className="size-4 fill-white text-white" />
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-4xl p-3">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <ProductVisual product={product} variant="detail" frame={active} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
