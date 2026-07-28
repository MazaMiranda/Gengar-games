'use client';

import * as React from 'react';
import { Check, Copy, Ticket } from 'lucide-react';
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
      <div className="relative flex w-28 shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed border-line bg-brand-500/8 p-4">
        <Ticket className="size-4 text-brand-300" />
        <span className="text-center font-display text-sm font-bold leading-tight text-brand-100">
          {valueLabel(coupon)}
        </span>
        <span className="absolute -right-2 top-0 size-4 -translate-y-1/2 rounded-full bg-void" />
        <span className="absolute -right-2 bottom-0 size-4 translate-y-1/2 rounded-full bg-void" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={copy}
            className="group/code inline-flex items-center gap-2 rounded-sm border border-dashed border-line-strong px-3 py-1.5 font-tech text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-brand-400/50 hover:text-brand-200"
          >
            {coupon.code}
            {copied ? (
              <Check className="size-3 text-success" />
            ) : (
              <Copy className="size-3 text-ink-faint transition-colors group-hover/code:text-brand-300" />
            )}
          </button>
          {!coupon.active ? <Badge variant="neutral" size="sm">Expirado</Badge> : null}
        </div>

        <p className="text-xs leading-relaxed text-ink-muted">{coupon.description}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-ink-faint">
          <span>Válido até {formatDate(coupon.expiresAt)}</span>
          {coupon.minSubtotal > 0 ? <span>Mínimo {formatPrice(coupon.minSubtotal)}</span> : null}
        </div>
      </div>
    </article>
  );
}
