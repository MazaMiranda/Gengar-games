'use client';

import { Check, Copy, Ticket } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import { toast } from 'sonner';
import type { Coupon } from '@/core/domain/entities';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, formatPrice } from '@/lib/utils';

function valueLabel(coupon: Coupon) {
  if (coupon.type === 'percent') return `${coupon.value}% OFF`;
  if (coupon.type === 'shipping') return 'FRETE GRÁTIS';
  return `${formatPrice(coupon.value)} OFF`;
}

export function CouponCard({ coupon, owned }: { coupon: Coupon; owned?: boolean }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success('Cupom copiado', { description: `Use ${coupon.code} no carrinho.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={cn(
        'plate group relative flex items-stretch overflow-hidden rounded-xl transition-all duration-400',
        owned ? 'border-brand-400/30 hover:border-line-brand' : 'hover:border-line-strong',
      )}
    >
      {/* Talão perfurado */}
      <div className="border-line bg-brand-500/8 relative flex w-28 shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed p-4">
        <Ticket className="text-brand-300 size-4" />
        <span className="font-display text-brand-100 text-center text-sm leading-tight font-bold">
          {valueLabel(coupon)}
        </span>
        <span className="bg-void absolute top-0 -right-2 size-4 -translate-y-1/2 rounded-full" />
        <span className="bg-void absolute -right-2 bottom-0 size-4 translate-y-1/2 rounded-full" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={copy}
            className="group/code border-line-strong font-tech text-ink hover:border-brand-400/50 hover:text-brand-200 inline-flex items-center gap-2 rounded-sm border border-dashed px-3 py-1.5 text-xs font-bold tracking-[0.14em] uppercase transition-colors"
          >
            {coupon.code}
            {copied ? (
              <Check className="text-success size-3" />
            ) : (
              <Copy className="text-ink-faint group-hover/code:text-brand-300 size-3 transition-colors" />
            )}
          </button>
          {!coupon.active ? (
            <Badge variant="neutral" size="sm">
              Expirado
            </Badge>
          ) : null}
        </div>

        <p className="text-ink-muted text-xs leading-relaxed">{coupon.description}</p>

        <div className="text-2xs text-ink-faint mt-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Válido até {formatDate(coupon.expiresAt)}</span>
          {coupon.minSubtotal > 0 ? <span>Mínimo {formatPrice(coupon.minSubtotal)}</span> : null}
        </div>
      </div>
    </article>
  );
}
