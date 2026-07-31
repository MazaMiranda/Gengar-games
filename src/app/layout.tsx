import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Gengar Games — TCG, Consoles e Cultura Gamer',
    template: '%s · Gengar Games',
  },
  description:
    'Loja premium de Pokémon TCG, consoles, jogos, acessórios e colecionáveis.',
  keywords: [
    'TCG',
    'Pokémon TCG',
    'cartas Pokémon',
    'consoles',
    'jogos',
    'colecionáveis',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Gengar Games',
    title: 'Gengar Games — TCG, Consoles e Cultura Gamer',
    description: 'Cartas, consoles e colecionáveis com curadoria. Envio para todo o Brasil.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
    { media: '(prefers-color-scheme: light)', color: '#F4F3F7' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Resolve o tema antes da primeira pintura.
 *
 * Precisa ser síncrono e inline: qualquer coisa que rode depois da pintura
 * mostraria o tema errado por um quadro.
 *
 * O escuro é o padrão porque é a identidade da loja — o claro é uma escolha
 * explícita, guardada no localStorage. (Para seguir a preferência do sistema
 * na primeira visita, bastaria consultar prefers-color-scheme aqui.)
 */
const themeScript = `(function(){try{
var s=localStorage.getItem('gengar-theme');
document.documentElement.dataset.theme=(s==='light'||s==='dark')?s:'dark';
}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-void text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
