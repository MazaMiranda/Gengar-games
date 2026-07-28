'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/core/application/cart';
import type { Product } from '@/core/domain/entities';

export function toCartLine(product: Product, quantity = 1): CartLine {
  return {
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    quantity,
    accent: product.accent,
    type: product.type,
    stock: product.stock,
  };
}

interface CartState {
  lines: CartLine[];
  saved: CartLine[];
  couponCode: string | null;
  shippingOptionId: string;
  isOpen: boolean;
  lastAdded: string | null;

  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  add: (line: CartLine, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  saveForLater: (slug: string) => void;
  moveToCart: (slug: string) => void;
  removeSaved: (slug: string) => void;
  setCoupon: (code: string | null) => void;
  setShippingOption: (id: string) => void;
  quantityOf: (slug: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      saved: [],
      couponCode: null,
      shippingOptionId: 'sedex',
      isOpen: false,
      lastAdded: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),

      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((item) => item.slug === line.slug);
          const lines = existing
            ? state.lines.map((item) =>
                item.slug === line.slug
                  ? { ...item, quantity: Math.min(item.stock, item.quantity + quantity) }
                  : item,
              )
            : [...state.lines, { ...line, quantity: Math.min(line.stock, quantity) }];

          return { lines, lastAdded: line.slug, isOpen: true };
        }),

      remove: (slug) => set((state) => ({ lines: state.lines.filter((item) => item.slug !== slug) })),

      setQuantity: (slug, quantity) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.slug === slug
              ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) }
              : item,
          ),
        })),

      clear: () => set({ lines: [], couponCode: null }),

      saveForLater: (slug) =>
        set((state) => {
          const line = state.lines.find((item) => item.slug === slug);
          if (!line) return state;
          return {
            lines: state.lines.filter((item) => item.slug !== slug),
            saved: state.saved.some((item) => item.slug === slug) ? state.saved : [...state.saved, line],
          };
        }),

      moveToCart: (slug) =>
        set((state) => {
          const line = state.saved.find((item) => item.slug === slug);
          if (!line) return state;
          const existing = state.lines.find((item) => item.slug === slug);
          return {
            saved: state.saved.filter((item) => item.slug !== slug),
            lines: existing
              ? state.lines.map((item) =>
                  item.slug === slug ? { ...item, quantity: item.quantity + line.quantity } : item,
                )
              : [...state.lines, line],
          };
        }),

      removeSaved: (slug) => set((state) => ({ saved: state.saved.filter((item) => item.slug !== slug) })),

      setCoupon: (couponCode) => set({ couponCode }),
      setShippingOption: (shippingOptionId) => set({ shippingOptionId }),

      quantityOf: (slug) => get().lines.find((item) => item.slug === slug)?.quantity ?? 0,
    }),
    {
      name: 'gengar-cart',
      partialize: ({ lines, saved, couponCode, shippingOptionId }) => ({
        lines,
        saved,
        couponCode,
        shippingOptionId,
      }),
    },
  ),
);
