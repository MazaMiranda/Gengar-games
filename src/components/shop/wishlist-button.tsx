'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/stores/wishlist-store';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  slug: string;
  name: string;
  className?: string;
  variant?: 'icon' | 'inline';
}

export function WishlistButton({ slug, name, className, variant = 'icon' }: WishlistButtonProps) {
  const slugs = useWishlistStore((state) => state.slugs);
  const toggle = useWishlistStore((state) => state.toggle);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const active = mounted && slugs.includes(slug);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(slug);
    toast[active ? 'message' : 'success'](
      active ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      { description: name },
    );
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        className={cn(
          'inline-flex h-12 items-center gap-2.5 rounded-lg border border-line px-5 text-sm font-semibold transition-all duration-300 ease-out-expo hover:border-brand-400/50 hover:bg-brand-500/10',
          active ? 'border-brand-400/50 bg-brand-500/12 text-brand-100' : 'text-ink-muted',
          className,
        )}
      >
        <Heart className={cn('size-4 transition-all', active && 'fill-brand-400 text-brand-400')} />
        {active ? 'Nos favoritos' : 'Favoritar'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
      aria-pressed={active}
      className={cn(
        'grid size-9 place-items-center rounded-md border backdrop-blur-md transition-all duration-300 ease-out-expo',
        active
          ? 'border-brand-400/60 bg-brand-500/25 text-brand-200 shadow-glow-sm'
          : 'border-line bg-void/50 text-ink-muted hover:border-brand-400/40 hover:text-brand-200',
        className,
      )}
    >
      <Heart className={cn('size-4 transition-transform duration-300', active && 'scale-110 fill-current')} />
    </button>
  );
}
