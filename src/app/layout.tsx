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
    'Loja premium de Trading Card Games, consoles, jogos, acessórios e colecionáveis. Pokémon, One Piece, Magic, Yu-Gi-Oh!, Lorcana, Flesh and Blood e Digimon.',
  keywords: [
    'TCG',
    'Pokémon TCG',
    'One Piece Card Game',
    'Magic The Gathering',
    'Yu-Gi-Oh',
    'Lorcana',
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
  themeColor: '#09090B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh bg-void text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
