import type { Metadata } from 'next';
import { WishlistGrid } from '@/components/account/wishlist-grid';

export const metadata: Metadata = {
  title: 'Favoritos',
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-xl font-bold text-ink">Favoritos</h1>
        <p className="text-sm text-ink-muted">
          Guardamos suas peças de interesse e avisamos quando o preço cair ou o estoque voltar.
        </p>
      </header>
      <WishlistGrid />
    </div>
  );
}
