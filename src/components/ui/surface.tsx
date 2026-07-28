import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const surfaceVariants = cva('relative', {
  variants: {
    tone: {
      plate: 'plate',
      glass: 'glass',
      solid: 'glass-solid',
      flat: 'border border-line bg-surface',
      bare: '',
    },
    radius: {
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      none: '',
    },
    interactive: {
      true: 'transition-all duration-500 ease-out-expo hover:border-line-brand hover:shadow-lift',
      false: '',
    },
  },
  defaultVariants: { tone: 'plate', radius: 'lg', interactive: false },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  as?: React.ElementType;
}

/** Superfície base de todo painel, card e módulo da loja. */
export function Surface({ className, tone, radius, interactive, as: Tag = 'div', ...props }: SurfaceProps) {
  return <Tag className={cn(surfaceVariants({ tone, radius, interactive }), className)} {...props} />;
}

export function SurfaceHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 border-b border-line px-6 py-5', className)}
      {...props}
    />
  );
}

export function SurfaceTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-display text-base font-semibold text-ink', className)} {...props} />;
}

export function SurfaceBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}
