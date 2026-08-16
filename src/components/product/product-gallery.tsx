'use client';

import { ArrowsOut, MagnifyingGlassPlus, Play } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

  const media = product.media.length
    ? product.media
    : [{ id: 'default', kind: 'art' as const, label: 'Frente' }];
  const current = media[active]!;
  const isCard = product.type === 'tcg-card';

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
          className={cn(
            // Sem holo aqui: a foto real da carta já carrega o próprio
            // brilho de foil impresso — sobrepor o glow sintético por cima
            // duplicava o efeito e lia como uma fita estranha, parada.
            'plate group relative cursor-zoom-in overflow-hidden rounded-xl',
            // Carta é retrato (~5:7), não quadrada — encaixar num quadrado
            // grande cortava topo e rodapé. Aqui ela mostra inteira, num
            // tamanho contido, não esticada pro tamanho de foto de produto.
            isCard ? 'mx-auto aspect-5/7 w-full max-w-sm' : 'aspect-square w-full',
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              // Sem opacity no inicial: a foto do produto é servida pelo
              // servidor e ficaria invisível até o JavaScript assumir.
              initial={{ scale: 1.02 }}
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
              <span className="border-ink/25 bg-void/60 grid size-16 place-items-center rounded-full border backdrop-blur-md">
                <Play className="size-5 translate-x-0.5 fill-white text-white" />
              </span>
            </span>
          ) : null}

          <span className="border-line bg-void/70 font-tech text-2xs text-ink-muted pointer-events-none absolute bottom-4 left-4 z-3 flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 tracking-wider uppercase opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
            <MagnifyingGlassPlus className="size-3" />
            Passe o mouse para ampliar
          </span>

          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Ampliar imagem"
            className="border-line bg-void/60 text-ink-muted hover:border-brand-400/50 hover:text-ink absolute top-4 right-4 z-3 grid size-11 place-items-center rounded-md border backdrop-blur-md transition-all"
          >
            <ArrowsOut className="size-4" />
          </button>
        </div>
      </div>

      {/* Miniaturas — só quando há mais de uma mídia de verdade; uma
          miniatura sozinha só repetiria o palco principal. */}
      {media.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0">
          {media.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver ${item.label}`}
              aria-current={index === active}
              className={cn(
                'ease-out-expo relative aspect-square w-20 shrink-0 overflow-hidden rounded-md border transition-all duration-300',
                index === active
                  ? 'border-brand-400/70 shadow-glow-sm'
                  : 'border-line opacity-60 hover:opacity-100',
              )}
            >
              <ProductVisual product={product} variant="thumb" frame={index} />
              {item.kind === 'video' ? (
                <span className="bg-void/40 absolute inset-0 z-3 grid place-items-center">
                  <Play className="size-4 fill-white text-white" />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className={cn(isCard ? 'max-w-md' : 'max-w-4xl', 'p-3')}>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-lg',
              isCard ? 'aspect-5/7' : 'aspect-square',
            )}
          >
            <ProductVisual product={product} variant="detail" frame={active} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
