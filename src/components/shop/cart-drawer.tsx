'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkPlus, Check, ShoppingBag, Tag, Ticket, Trash2, Truck, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuantityStepper, Separator } from '@/components/ui/controls';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart-store';
import { useCartTotals } from '@/hooks/use-cart-totals';
import { etaLabel, shippingOptions } from '@/lib/shipping';
import { cn, formatPrice } from '@/lib/utils';

interface Recommendation {
  slug: string;
  name: string;
  price: number;
  accent: number;
  type: string;
}

async function fetchRecommendations(): Promise<Recommendation[]> {
  const response = await fetch('/api/products?ordenar=mais-vendidos&limite=4&estoque=1');
  const data = await response.json();
  return data.items as Recommendation[];
}

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const setOpen = useCartStore((state) => state.setOpen);
  const lines = useCartStore((state) => state.lines);
  const saved = useCartStore((state) => state.saved);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const saveForLater = useCartStore((state) => state.saveForLater);
  const moveToCart = useCartStore((state) => state.moveToCart);
  const removeSaved = useCartStore((state) => state.removeSaved);
  const couponCode = useCartStore((state) => state.couponCode);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const shippingOptionId = useCartStore((state) => state.shippingOptionId);
  const setShippingOption = useCartStore((state) => state.setShippingOption);

  const { totals, coupon, validatingCoupon } = useCartTotals();
  const [code, setCode] = React.useState('');

  const { data: recommendations } = useQuery({
    queryKey: ['cart-recommendations'],
    queryFn: fetchRecommendations,
    enabled: isOpen,
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    if (coupon && !coupon.valid && couponCode) {
      toast.error('Cupom não aplicado', { description: coupon.message });
      setCoupon(null);
    }
  }, [coupon, couponCode, setCoupon]);

  const applyCoupon = (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setCoupon(code.trim().toUpperCase());
    setCode('');
  };

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent side="right" className="max-w-lg">
        <DrawerHeader>
          <div className="flex flex-col gap-1">
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-brand-300" />
              Seu carrinho
            </DrawerTitle>
            <p className="font-tech text-2xs uppercase tracking-[0.2em] text-ink-faint">
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <DrawerCloseButton />
        </DrawerHeader>

        {/* Barra de progresso do frete grátis */}
        <div className="border-b border-line px-6 py-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-ink-muted">
              <Truck className="size-3.5 text-brand-300" />
              {totals.freeShippingRemaining > 0 ? (
                <>
                  Faltam{' '}
                  <strong className="text-ink">{formatPrice(totals.freeShippingRemaining)}</strong> para
                  o frete grátis
                </>
              ) : (
                <strong className="text-success">Frete grátis desbloqueado</strong>
              )}
            </span>
            <span className="font-tech text-2xs text-ink-faint">{totals.freeShippingProgress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/8">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-brand-600 via-brand-400 to-brand-300"
              initial={{ width: 0 }}
              animate={{ width: `${totals.freeShippingProgress}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <DrawerBody className="flex flex-col gap-6">
          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
              <span className="grid size-16 place-items-center rounded-full border border-line bg-ink/3">
                <ShoppingBag className="size-6 text-ink-faint" />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-ink">Carrinho vazio</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Que tal começar pelas cartas mais procuradas da semana?
                </p>
              </div>
              <Button asChild variant="secondary" size="sm" onClick={() => setOpen(false)}>
                <Link href="/catalogo">Explorar catálogo</Link>
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={line.slug}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="plate flex gap-4 rounded-lg p-3"
                  >
                    <Link
                      href={line.type === 'tcg-card' ? `/carta/${line.slug}` : `/produto/${line.slug}`}
                      onClick={() => setOpen(false)}
                      className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md border border-line"
                      style={{
                        background: `linear-gradient(150deg, hsl(${line.accent} 68% 20%), rgba(9,9,12,0.95))`,
                      }}
                    >
                      <span className="font-display text-lg font-bold text-white/80">
                        {line.name.charAt(0)}
                      </span>
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{line.name}</p>
                          <p className="truncate text-xs text-ink-faint">{line.subtitle}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.slug)}
                          aria-label={`Remover ${line.name}`}
                          className="grid size-7 shrink-0 place-items-center rounded-sm text-ink-ghost transition-colors hover:bg-ink/8 hover:text-danger"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <QuantityStepper
                          size="sm"
                          value={line.quantity}
                          max={line.stock}
                          onChange={(value) => setQuantity(line.slug, value)}
                        />
                        <span className="font-display text-sm font-bold tabular-nums text-ink">
                          {formatPrice(line.price * line.quantity)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => saveForLater(line.slug)}
                        className="inline-flex w-fit items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-faint transition-colors hover:text-brand-300"
                      >
                        <BookmarkPlus className="size-3" />
                        Salvar para depois
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {/* Salvos para depois */}
          {saved.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h4 className="eyebrow">Salvos para depois</h4>
              <ul className="flex flex-col gap-2">
                {saved.map((line) => (
                  <li
                    key={line.slug}
                    className="flex items-center gap-3 rounded-md border border-line bg-ink/2 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">{line.name}</p>
                      <p className="font-tech text-2xs text-ink-faint">{formatPrice(line.price)}</p>
                    </div>
                    <Button size="xs" variant="secondary" onClick={() => moveToCart(line.slug)}>
                      Mover
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeSaved(line.slug)}
                      aria-label={`Descartar ${line.name}`}
                      className="grid size-7 place-items-center rounded-sm text-ink-ghost hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Cupom */}
          {lines.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h4 className="eyebrow flex items-center gap-2">
                <Ticket className="size-3" /> Cupom de desconto
              </h4>
              {couponCode && coupon?.valid ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/8 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-success" />
                    <div>
                      <p className="font-tech text-xs font-bold uppercase tracking-wider text-success">
                        {coupon.code}
                      </p>
                      <p className="text-2xs text-ink-muted">{coupon.description ?? coupon.message}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoupon(null)}
                    className="text-2xs font-semibold uppercase tracking-wider text-ink-faint hover:text-danger"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={applyCoupon} className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="GENGAR10"
                    className="h-11 flex-1 font-tech uppercase tracking-wider"
                    aria-label="Código do cupom"
                  />
                  <Button type="submit" variant="secondary" size="sm" loading={validatingCoupon}>
                    Aplicar
                  </Button>
                </form>
              )}
            </section>
          ) : null}

          {/* Frete */}
          {lines.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h4 className="eyebrow">Entrega estimada</h4>
              <div className="grid gap-2">
                {shippingOptions.map((option) => {
                  const active = option.id === shippingOptionId;
                  const free = totals.subtotal >= 29900 || option.price === 0;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setShippingOption(option.id)}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-all duration-300',
                        active
                          ? 'border-brand-400/50 bg-brand-500/10'
                          : 'border-line bg-ink/2 hover:border-line-strong',
                      )}
                    >
                      <div>
                        <p className="text-xs font-semibold text-ink">{option.name}</p>
                        <p className="text-2xs text-ink-faint">
                          {option.carrier} · {etaLabel(option)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'font-tech text-xs font-bold',
                          free ? 'text-success' : 'text-ink-muted',
                        )}
                      >
                        {free ? 'Grátis' : formatPrice(option.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Recomendações */}
          {recommendations?.length ? (
            <section className="flex flex-col gap-3">
              <h4 className="eyebrow flex items-center gap-2">
                <Tag className="size-3" /> Quem levou, levou também
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {recommendations.slice(0, 4).map((item) => (
                  <Link
                    key={item.slug}
                    href={item.type === 'tcg-card' ? `/carta/${item.slug}` : `/produto/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="group flex flex-col gap-2 rounded-md border border-line bg-ink/2 p-3 transition-all hover:border-brand-400/40 hover:bg-brand-500/6"
                  >
                    <span
                      className="grid h-14 place-items-center rounded-sm"
                      style={{
                        background: `linear-gradient(150deg, hsl(${item.accent} 68% 22%), rgba(9,9,12,0.9))`,
                      }}
                    >
                      <span className="font-display text-sm font-bold text-white/70">
                        {item.name.charAt(0)}
                      </span>
                    </span>
                    <span className="line-clamp-2 text-2xs font-semibold leading-snug text-ink-muted group-hover:text-ink">
                      {item.name}
                    </span>
                    <span className="font-tech text-2xs font-bold text-brand-200">
                      {formatPrice(item.price)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </DrawerBody>

        {lines.length > 0 ? (
          <DrawerFooter className="flex flex-col gap-4">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-ink-muted">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 ? (
                <div className="flex justify-between text-success">
                  <dt>Desconto</dt>
                  <dd className="tabular-nums">−{formatPrice(totals.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between text-ink-muted">
                <dt>Frete</dt>
                <dd className="tabular-nums">
                  {totals.shipping === 0 ? (
                    <span className="text-success">Grátis</span>
                  ) : (
                    formatPrice(totals.shipping)
                  )}
                </dd>
              </div>
              <Separator className="my-1" />
              <div className="flex items-end justify-between">
                <dt className="font-display text-sm font-semibold text-ink">Total</dt>
                <dd className="font-display text-2xl font-bold tabular-nums text-ink">
                  {formatPrice(totals.total)}
                </dd>
              </div>
            </dl>

            {totals.savings > 0 ? (
              <Badge variant="success" className="self-start">
                Você economiza {formatPrice(totals.savings)}
              </Badge>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button asChild block size="lg" onClick={() => setOpen(false)}>
                <Link href="/checkout">Finalizar compra</Link>
              </Button>
              <Button variant="ghost" size="sm" block onClick={() => setOpen(false)}>
                Continuar comprando
              </Button>
            </div>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
