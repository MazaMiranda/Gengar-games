'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 ease-out-expo disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'sweep bg-linear-to-b from-brand-400 to-brand-600 text-white shadow-[0_0_0_1px_rgba(168,85,247,0.5),var(--shadow-glow-sm),var(--shadow-inset-top)] hover:from-brand-300 hover:to-brand-500 hover:shadow-[0_0_0_1px_rgba(192,132,252,0.7),var(--shadow-glow),var(--shadow-inset-top)] active:scale-[0.98]',
        secondary:
          'glass text-ink hover:border-line-brand hover:bg-ink/8 hover:shadow-glow-sm active:scale-[0.98]',
        outline:
          'border border-line-strong bg-transparent text-ink hover:border-brand-400/60 hover:bg-brand-500/10 hover:text-brand-200',
        ghost: 'text-ink-muted hover:bg-ink/6 hover:text-ink',
        danger:
          'bg-linear-to-b from-danger/90 to-danger/70 text-white shadow-[0_0_0_1px_rgba(251,113,133,0.4)] hover:brightness-110',
        link: 'text-brand-300 underline-offset-4 hover:text-brand-200 hover:underline',
      },
      size: {
        xs: 'h-8 rounded-sm px-3 text-2xs',
        sm: 'h-10 rounded-md px-4 text-sm',
        md: 'h-12 rounded-lg px-6 text-sm',
        lg: 'h-14 rounded-lg px-8 text-base',
        icon: 'size-11 rounded-lg',
        'icon-sm': 'size-9 rounded-md',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span className="sr-only">Carregando</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
