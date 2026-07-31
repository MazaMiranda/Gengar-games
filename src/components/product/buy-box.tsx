'use client';

import * as React from 'react';
import { Check, CreditCard, MapPin, PackageCheck, Share2, ShieldCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/core/domain/entities';
import { CONDITIONS } from '@/core/domain/taxonomy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/ui/price';
import { Rating } from '@/components/ui/rating';
import { QuantityStepper, Separator } from '@/components/ui/controls';
import { Input } from '@/components/ui/input';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { WishlistButton } from '@/components/shop/wishlist-button';
import { useCartStore } from '@/stores/cart-store';
import { cn, formatPrice, installmentsFor } from '@/lib/utils';

const PAYMENT_ROWS = [
  { icon: CreditCard, label: 'Cartão em até 12x sem juros' },
  { icon: PackageCheck, label: 'PIX com 5% de desconto adicional' },
  { icon: ShieldCheck, label: 'Compra 100% protegida e nota fiscal' },
];

export function BuyBox({ product }: { product: Product }) {
  const [quantity, setQuantity] = React.useState(1);
  const [zip, setZip] = React.useState('');
  const [quote, setQuote] = React.useState<{ eta: string; price: number } | null>(null);
  const openCart = useCartStore((state) => state.open);

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const plan = installmentsFor(product.price * quantity);
  const pixPrice = Math.round(product.price * 0.95);

  /** Estimativa local enquanto a integração com a transportadora não está ativa. */
  const estimate = (event: React.FormEvent) => {
    event.preventDefault();
    const digits = zip.replace(/\D/g, '');
    if (digits.length !== 8) {
      toast.error('CEP inválido', { description: 'Digite os 8 dígitos do CEP.' });
      return;
    }
    const region = Number(digits[0]);
    const days = 2 + Math.round(region * 0.9);
    setQuote({
      eta: `${days} a ${days + 3} dias úteis`,
      price: product.price >= 29900 ? 0 : 1990 + region * 320,
    });
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copiado', { description: 'Cole onde quiser compartilhar.' });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={product.condition === 'usado' ? 'neutral' : 'brand'}>
            {CONDITIONS[product.condition].name}
          </Badge>
          {product.compareAtPrice ? <Badge variant="danger">Oferta</Badge> : null}
          {product.preOrder ? <Badge variant="info">Pré-venda</Badge> : null}
          <span className="font-tech text-2xs uppercase tracking-[0.2em] text-ink-ghost">
            SKU {product.sku}
          </span>
        </div>

        <h1 className="text-title font-bold text-ink">{product.name}</h1>
        <p className="text-sm text-ink-muted">{product.subtitle}</p>

        <div className="flex flex-wrap items-center gap-4">
          <Rating value={product.rating} count={product.reviewCount} size="md" />
          <span className="text-2xs text-ink-faint">{product.soldCount} vendidos</span>
        </div>
      </div>

      <Separator />

      {/* Preço */}
      <div className="flex flex-col gap-3">
        <Price value={product.price} compareAt={product.compareAtPrice} size="xl" />
        <div className="flex flex-col gap-1.5 text-sm">
          <p className="text-ink-muted">
            <strong className="font-semibold text-ink">
              {plan.count}x de {formatPrice(plan.value)}
            </strong>{' '}
            sem juros no cartão
          </p>
          <p className="text-success">
            <strong className="font-semibold">{formatPrice(pixPrice)}</strong> no PIX (5% de desconto)
          </p>
        </div>
      </div>

      {/* Estoque */}
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-md border px-4 py-3 text-xs',
          soldOut
            ? 'border-danger/30 bg-danger/8 text-danger'
            : lowStock
              ? 'border-warning/30 bg-warning/8 text-warning'
              : 'border-success/25 bg-success/8 text-success',
        )}
      >
        <span
          className={cn(
            'size-2 rounded-full',
            soldOut ? 'bg-danger' : lowStock ? 'bg-warning animate-pulse-glow' : 'bg-success',
          )}
        />
        {soldOut
          ? 'Produto esgotado — avise-me quando chegar'
          : lowStock
            ? `Últimas ${product.stock} unidades em estoque`
            : `${product.stock} unidades disponíveis · pronta entrega`}
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={quantity}
            max={Math.max(1, product.stock)}
            onChange={setQuantity}
          />
          <span className="text-xs text-ink-faint">
            Total: <strong className="text-ink">{formatPrice(product.price * quantity)}</strong>
          </span>
        </div>

        <AddToCartButton product={product} quantity={quantity} size="lg" block />

        <Button
          variant="secondary"
          size="lg"
          block
          disabled={soldOut}
          onClick={() => {
            useCartStore.getState().add(
              {
                slug: product.slug,
                name: product.name,
                subtitle: product.subtitle,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                quantity,
                accent: product.accent,
                type: product.type,
                stock: product.stock,
              },
              quantity,
            );
            openCart();
          }}
        >
          Comprar agora
        </Button>

        <div className="flex gap-3">
          <WishlistButton slug={product.slug} name={product.name} variant="inline" className="flex-1" />
          <Button variant="outline" size="lg" onClick={share} aria-label="Compartilhar">
            <Share2 className="size-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Frete */}
      <div className="plate flex flex-col gap-4 rounded-lg p-5">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <Truck className="size-4 text-brand-300" />
          Calcular frete e prazo
        </h3>
        <form onSubmit={estimate} className="flex gap-2">
          <Input
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            placeholder="00000-000"
            inputMode="numeric"
            maxLength={9}
            aria-label="Seu CEP"
            className="h-11 flex-1"
            icon={<MapPin className="size-4" />}
          />
          <Button type="submit" variant="secondary" size="sm">
            Calcular
          </Button>
        </form>

        {quote ? (
          <div className="flex items-center justify-between rounded-md border border-line bg-ink/2 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-success" />
              <div>
                <p className="text-xs font-semibold text-ink">Entrega estimada</p>
                <p className="text-2xs text-ink-faint">{quote.eta}</p>
              </div>
            </div>
            <span className={cn('font-tech text-sm font-bold', quote.price === 0 ? 'text-success' : 'text-ink')}>
              {quote.price === 0 ? 'Grátis' : formatPrice(quote.price)}
            </span>
          </div>
        ) : (
          <p className="text-2xs leading-relaxed text-ink-faint">
            Frete grátis para todo o Brasil em compras acima de R$ 299. Retirada gratuita na loja de
            Pinheiros, São Paulo.
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {PAYMENT_ROWS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-xs text-ink-muted">
            <Icon className="size-4 shrink-0 text-brand-400" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
