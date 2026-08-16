'use client';

import { Check, ShoppingBag } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Product } from '@/core/domain/entities';
import { Button, type ButtonProps } from '@/components/ui/button';
import { toCartLine, useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  product: Product;
  quantity?: number;
  label?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  product,
  quantity = 1,
  label = 'Adicionar ao carrinho',
  children,
  ...props
}: AddToCartButtonProps) {
  const add = useCartStore((state) => state.add);
  const [done, setDone] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const soldOut = product.stock <= 0;

  const handleClick = () => {
    if (soldOut) return;
    add(toCartLine(product), quantity);
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
    toast.success('Adicionado ao carrinho', {
      description: `${quantity}x ${product.name} · ${formatPrice(product.price * quantity)}`,
    });
  };

  return (
    <Button onClick={handleClick} disabled={soldOut} {...props}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="inline-flex items-center gap-2"
          >
            <Check className="size-4" />
            No carrinho
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="inline-flex items-center gap-2"
          >
            <ShoppingBag className="size-4" />
            {children ?? (soldOut ? 'Produto esgotado' : label)}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
