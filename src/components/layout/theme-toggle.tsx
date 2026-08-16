'use client';

import { Moon, Sun } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type Theme = 'dark' | 'light';

/** Chave única, compartilhada com o script anti-piscada do layout. */
export const THEME_STORAGE_KEY = 'gengar-theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Alterna claro/escuro.
 *
 * O tema real já foi aplicado no <html> antes da primeira pintura pelo script
 * inline do layout; aqui só lemos o que ficou lá, para o botão nascer
 * coerente e não piscar o ícone errado na hidratação.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) ?? 'dark');
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Modo privado pode bloquear storage — a troca continua valendo na sessão.
    }
  };

  const goingTo = theme === 'dark' ? 'claro' : 'escuro';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Mudar para o tema ${goingTo}`}
      title={`Tema ${goingTo}`}
      className={cn(
        // Sem overflow-hidden: ele recortaria a área de toque do tap-44. Os
        // ícones giram dentro de 16px numa caixa de 40, não vazam.
        'tap-44 text-ink-muted hover:bg-ink/6 hover:text-ink grid size-10 place-items-center rounded-md transition-colors',
        className,
      )}
    >
      {/* Sem tema resolvido ainda, nenhum ícone aparece — evita trocar o
          desenho na frente do usuário logo após a hidratação. */}
      <Sun
        className={cn(
          'ease-out-expo absolute size-4 transition-all duration-500',
          mounted && theme === 'light'
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-50 rotate-90 opacity-0',
        )}
      />
      <Moon
        className={cn(
          'ease-out-expo absolute size-4 transition-all duration-500',
          mounted && theme === 'dark'
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-50 -rotate-90 opacity-0',
        )}
      />
    </button>
  );
}
