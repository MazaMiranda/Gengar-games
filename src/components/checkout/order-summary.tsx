'use client';

import { Tag } from 'lucide-react';
import type { CartTotals } from '@/core/application/cart';
import type { CartLine } from '@/core/application/cart';
import { Separator } from '@/components/ui/controls';
import { Badge } from '@/components/ui/badge';
import { LineThumb } from '@/components/shop/line-thumb';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  lines: CartLine[];
  totals: CartTotals;
  couponCode?: string | null;
  shippingLabel?: string;
}

export function OrderSummary({ lines, totals, couponCode, shippingLabel }: OrderSummaryProps) {
  return (
    <aside className="plate flex flex-col gap-5 rounded-xl p-6">
      <h2 className="font-display text-ink text-sm font-bold">Resumo do pedido</h2>

      <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
        {lines.map((line) => (
          <li key={line.slug} className="flex gap-3">
            <LineThumb
              slug={line.slug}
              name={line.name}
              type={line.type}
              accent={line.accent}
              className="border-line size-14 shrink-0 rounded-md border"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <p className="text-ink truncate text-xs font-semibold">{line.name}</p>
              <p className="font-tech text-2xs text-ink-faint">
                {line.quantity}x {formatPrice(line.price)}
              </p>
            </div>
            <span className="font-tech text-ink self-center text-xs font-semibold tabular-nums">
              {formatPrice(line.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <dl className="flex flex-col gap-2.5 text-sm">
        <div className="text-ink-muted flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>

        {totals.discount > 0 ? (
          <div className="text-success flex justify-between">
            <dt className="flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Desconto {couponCode ? `(${couponCode})` : null}
            </dt>
            <dd className="tabular-nums">−{formatPrice(totals.discount)}</dd>
          </div>
        ) : null}

        <div className="text-ink-muted flex justify-between">
          <dt>
            Frete {shippingLabel ? <span className="text-ink-ghost">· {shippingLabel}</span> : null}
          </dt>
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
          <dt className="font-display text-ink text-sm font-semibold">Total</dt>
          <dd className="font-display text-ink text-2xl font-bold tabular-nums">
            {formatPrice(totals.total)}
          </dd>
        </div>
      </dl>

      {totals.savings > 0 ? (
        <Badge variant="success" className="self-start">
          Economia de {formatPrice(totals.savings)}
        </Badge>
      ) : null}

      <p className="text-2xs text-ink-faint leading-relaxed">
        Ao finalizar você concorda com os termos de compra. Nota fiscal enviada por e-mail em até
        24h.
      </p>
    </aside>
  );
}
