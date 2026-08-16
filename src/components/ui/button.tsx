'use client';

import { CircleNotch } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 ease-out-expo disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /*
         * A rampa desceu um degrau: repouso 500→700, hover 400→600.
         *
         * O hover antigo abria em brand-300, que no tema escuro é #c084fc —
         * branco por cima dava 3,4:1 no ponto onde a letra realmente cai.
         * Ficava mais claro quanto mais o usuário interagia, o que é o
         * contrário do que se espera do estado de foco da ação principal.
         * Medido atrás da glifo: 6,4–7,5:1 em repouso, 4,9–5,8:1 no hover.
         */
        /*
         * Chapa sólida de um acento só.
         *
         * Antes a ação primária carregava a banda prismática inteira e dois
         * anéis de hex cravado (violeta em repouso, magenta no hover) — a
         * assinatura da direção velha, e a única cor da página que ninguém
         * conseguia mudar pelo token. Agora é brand-600 sólido: 7,7:1 com o
         * rótulo branco, e o hover escurece em vez de clarear, que é o que
         * se espera do estado ativo da ação principal.
         */
        primary:
          'sweep bg-brand-600 text-white shadow-glow-sm hover:bg-brand-700 hover:shadow-glow active:scale-[0.98]',
        secondary:
          'glass text-ink hover:border-line-brand hover:bg-ink/8 hover:shadow-glow-sm active:scale-[0.98]',
        outline:
          'border border-line-strong bg-transparent text-ink hover:border-brand-400/60 hover:bg-brand-500/10 hover:text-brand-200',
        ghost: 'text-ink-muted hover:bg-ink/6 hover:text-ink',
        danger:
          'bg-linear-to-b from-danger-surface to-danger-surface-deep text-white hover:brightness-110',
        link: 'text-brand-300 underline-offset-4 hover:text-brand-200 hover:underline',
      },
      size: {
        xs: 'tap-44 h-8 rounded-sm px-3 text-2xs',
        // 44px em vez de 40: é o tamanho usado em "Filtros", "Ver relatórios"
        // e no topo do admin — ações de verdade, não enfeite.
        sm: 'h-11 rounded-md px-4 text-sm',
        md: 'h-12 rounded-lg px-6 text-sm',
        lg: 'h-14 rounded-lg px-8 text-base',
        icon: 'size-11 rounded-lg',
        // Fica com 36px de desenho, mas o alvo do dedo vai a 44 pelo tap-44.
        'icon-sm': 'tap-44 size-9 rounded-md',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, block, asChild = false, loading, children, disabled, ...props },
    ref,
  ) => {
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
            <CircleNotch className="size-4 animate-spin" aria-hidden />
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
