'use client';

import * as React from 'react';
import type { RevenuePoint } from '@/core/application/admin-service';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

/** Colunas de faturamento — SVG puro, sem dependência de biblioteca de gráficos. */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(...data.map((point) => point.revenue), 1);

  return (
    <div className="flex flex-col gap-3">
      {/* h-44: as colunas continuam legíveis e a linha inteira encurta ~50px,
          o que também reduz o vazio do card de status ao lado, que estica
          para acompanhar a altura da linha do grid. */}
      <div className="flex h-44 items-stretch gap-2 sm:gap-3">
        {data.map((point, index) => {
          const height = Math.max(2, (point.revenue / max) * 100);
          const active = hover === index;

          return (
            <div
              key={point.label}
              className="group relative flex h-full flex-1 flex-col items-center gap-2"
              onPointerEnter={() => setHover(index)}
              onPointerLeave={() => setHover(null)}
            >
              {active ? (
                <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-md border border-line bg-void/95 px-3 py-2 backdrop-blur-md">
                  <p className="font-display text-xs font-bold text-ink">{formatPrice(point.revenue)}</p>
                  <p className="font-tech text-2xs text-ink-faint">
                    {point.orders} {point.orders === 1 ? 'pedido' : 'pedidos'}
                  </p>
                </div>
              ) : null}

              {/* A barra é posicionada em relação a esta caixa, que tem altura
                  definida — porcentagem em item flex não resolveria. */}
              <div className="relative w-full flex-1">
                <div
                  className={cn(
                    'absolute inset-x-0 bottom-0 rounded-t-sm transition-all duration-500 ease-out-expo',
                    active
                      ? 'bg-linear-to-t from-brand-600 to-brand-300 shadow-glow-sm'
                      : 'bg-linear-to-t from-brand-700/70 to-brand-500/70',
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>

              <span className="font-tech text-2xs uppercase text-ink-ghost">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Barra de proporção usada nos relatórios e no detalhamento por status. */
export function ProportionBar({
  segments,
}: {
  segments: { label: string; value: number; hue: number }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-ink/6">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="h-full transition-all duration-700 ease-out-expo"
            style={{
              width: `${(segment.value / total) * 100}%`,
              background: `linear-gradient(90deg, hsl(${segment.hue} 80% 55%), hsl(${segment.hue + 20} 75% 45%))`,
            }}
            title={`${segment.label}: ${segment.value}`}
          />
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-ink-muted">
              <span
                className="size-2 rounded-full"
                style={{ background: `hsl(${segment.hue} 80% 58%)` }}
              />
              {segment.label}
            </span>
            <span className="font-tech font-semibold text-ink">
              {segment.value}
              <span className="ml-1.5 text-ink-ghost">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
