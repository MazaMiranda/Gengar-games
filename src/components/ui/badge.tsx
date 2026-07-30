import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-tech font-semibold uppercase tracking-[0.16em] transition-colors',
  {
    variants: {
      variant: {
        brand: 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/30',
        solid: 'bg-brand-500 text-white shadow-glow-sm',
        neutral: 'bg-ink/6 text-ink-muted ring-1 ring-line',
        success: 'bg-success/12 text-success ring-1 ring-success/25',
        warning: 'bg-warning/12 text-warning ring-1 ring-warning/25',
        danger: 'bg-danger/14 text-danger ring-1 ring-danger/30',
        info: 'bg-info/12 text-info ring-1 ring-info/25',
        outline: 'text-ink-muted ring-1 ring-line-strong',
      },
      size: {
        sm: 'h-5 rounded-xs px-1.5 text-[0.5625rem]',
        md: 'h-6 rounded-sm px-2 text-2xs',
        lg: 'h-7 rounded-sm px-2.5 text-2xs',
      },
    },
    defaultVariants: { variant: 'brand', size: 'md' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
