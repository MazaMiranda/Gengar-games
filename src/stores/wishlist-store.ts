'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  slugs: string[];
  recentlyViewed: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  remove: (slug: string) => void;
  registerView: (slug: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      recentlyViewed: [],

      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((item) => item !== slug)
            : [slug, ...state.slugs],
        })),

      has: (slug) => get().slugs.includes(slug),

      remove: (slug) => set((state) => ({ slugs: state.slugs.filter((item) => item !== slug) })),

      registerView: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((item) => item !== slug)].slice(0, 12),
        })),

      clear: () => set({ slugs: [] }),
    }),
    { name: 'gengar-wishlist' },
  ),
);
