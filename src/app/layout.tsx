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
  description: 'Loja premium de Pokémon TCG, consoles, jogos, acessórios e colecionáveis.',
  keywords: ['TCG', 'Pokémon TCG', 'cartas Pokémon', 'consoles', 'jogos', 'colecionáveis'],
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
      <body className="bg-void text-ink min-h-dvh antialiased">
        {/*
          A literal HTML comment (never JSX-only) so the seed key survives the
          production build and `grep` can audit it. React has no bare-comment
          node, so a zero-footprint `display:contents` host carries it as the
          first real thing under <body>.
        */}
        <div
          aria-hidden
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{
            __html: `<!--
IMPECCABLE DIRECTION CONTRACT
THESIS: Cada produto reage à luz como a carta que você acabou de puxar do booster — foil, não neon; recusa o HUD de arcade que todo concorrente do nicho já usa.
OWN-WORLD: Preto fosco de sleeve; violeta, magenta, ciano e dourado como banda de difração prismática que varre a superfície, nunca glow estático; plate/glass herdados do sistema; label de cartolina para selos, eyebrows e faixas de drop.
STORY: O visitante entende, em segundos, que cada item foi conferido como uma carta avaliada na hora — autenticidade é o clímax visual da loja, não decoração de fundo.
FIRST VIEWPORT: Hero inclina o produto em destaque sob varredura de luz que segue o ponteiro; o eyebrow vira faixa de cert-label impressa no lugar de badge genérica de promoção.
FORM: Foil sob a Luz — candidata 3 de 7 da lista própria, atribuída pelo sorteio contra 2 concorrentes competitivos e 4 recusados; seed key 025e12ca.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
