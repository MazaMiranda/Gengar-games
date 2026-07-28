'use client';

import * as React from 'react';
import { useWishlistStore } from '@/stores/wishlist-store';

/** Registra a visita para alimentar "vistos recentemente" na conta do cliente. */
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  const registerView = useWishlistStore((state) => state.registerView);

  React.useEffect(() => {
    registerView(slug);
  }, [slug, registerView]);

  return null;
}
