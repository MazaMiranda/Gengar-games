'use client';

import * as React from 'react';
import type { PricePoint } from '@/core/domain/entities';
import { formatPrice } from '@/lib/utils';

interface PriceHistoryProps {
  points: PricePoint[];
  current: number;
}

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 16, right: 8, bottom: 26, left: 8 };

/** Histórico de preço dos últimos 12 meses, desenhado em SVG puro. */
export function PriceHistory({ points, current }: PriceHistoryProps) {
  const [hover, setHover] = React.useState<number | null>(null);

  if (points.length < 2) return null;

  const values = points.map((point) => point.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const coords = points.map((point, index) => ({
    x: PADDING.left + (index / (points.length - 1)) * innerWidth,
    y: PADDING.top + innerHeight - ((point.price - min) / span) * innerHeight,
    point,
  }));

  const line = coords.map((coord, index) => `${index === 0 ? 'M' : 'L'}${coord.x},${coord.y}`).join(' ');
  const area = `${line} L${coords.at(-1)!.x},${PADDING.top + innerHeight} L${coords[0]!.x},${PADDING.top + innerHeight} Z`;

  const lowest = points.reduce((best, point) => (point.price < best.price ? point : best));
  const highest = points.reduce((best, point) => (point.price > best.price ? point : best));
  const variation = ((current - points[0]!.price) / points[0]!.price) * 100;
  const activeCoord = hover !== null ? coords[hover] : null;

  const monthLabel = (date: string) =>
    new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '');

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Menor preço (12 meses)', value: formatPrice(lowest.price), tone: 'text-success' },
          { label: 'Maior preço (12 meses)', value: formatPrice(highest.price), tone: 'text-danger' },
          {
            label: 'Variação no período',
            value: `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`,
            tone: variation > 0 ? 'text-warning' : 'text-success',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-line bg-ink/2 p-4">
            <p className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">{stat.label}</p>
            <p className={`mt-1.5 font-display text-lg font-bold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="plate relative overflow-hidden rounded-lg p-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Gráfico do histórico de preço nos últimos 12 meses"
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="price-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => (
            <line
              key={ratio}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={PADDING.top + innerHeight * ratio}
              y2={PADDING.top + innerHeight * ratio}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 5"
            />
          ))}

          <path d={area} fill="url(#price-area)" />
          <path d={line} fill="none" stroke="var(--color-brand-300)" strokeWidth="2" strokeLinejoin="round" />

          {coords.map((coord, index) => (
            <g key={coord.point.date}>
              <rect
                x={coord.x - innerWidth / (points.length * 2)}
                y={0}
                width={innerWidth / points.length}
                height={HEIGHT}
                fill="transparent"
                onPointerEnter={() => setHover(index)}
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={hover === index ? 5 : 3}
                fill={hover === index ? 'var(--color-brand-200)' : 'var(--color-void)'}
                stroke="var(--color-brand-300)"
                strokeWidth="2"
              />
              <text
                x={coord.x}
                y={HEIGHT - 6}
                textAnchor="middle"
                className="fill-[var(--color-ink-ghost)] font-tech"
                fontSize="10"
              >
                {monthLabel(coord.point.date)}
              </text>
            </g>
          ))}

          {activeCoord ? (
            <line
              x1={activeCoord.x}
              x2={activeCoord.x}
              y1={PADDING.top}
              y2={PADDING.top + innerHeight}
              stroke="var(--color-brand-400)"
              strokeOpacity="0.4"
            />
          ) : null}
        </svg>

        {activeCoord ? (
          <div
            className="pointer-events-none absolute top-3 rounded-md border border-line bg-void/90 px-3 py-2 backdrop-blur-md"
            style={{ left: `${(activeCoord.x / WIDTH) * 100}%`, transform: 'translateX(-50%)' }}
          >
            <p className="font-tech text-2xs uppercase tracking-wider text-ink-faint">
              {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
                new Date(`${activeCoord.point.date}T12:00:00`),
              )}
            </p>
            <p className="font-display text-sm font-bold text-ink">{formatPrice(activeCoord.point.price)}</p>
          </div>
        ) : null}
      </div>

      <p className="text-2xs leading-relaxed text-ink-faint">
        Série calculada a partir do preço praticado por esta loja. Não considera cupons promocionais
        nem descontos por PIX.
      </p>
    </div>
  );
}
