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
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0E' },
    { media: '(prefers-color-scheme: light)', color: '#F4F4F6' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Resolve o tema antes da primeira pintura.
 *
 * Precisa ser síncrono e inline: qualquer coisa que rode depois da pintura
 * mostraria o tema errado por um quadro.
 *
 * Na direção Vitrine o claro é o padrão: a loja é sala iluminada, e a arte da
 * carta é o que deve brilhar, não o fundo. O escuro continua completo e é
 * escolha explícita, guardada no localStorage.
 *
 * A chave continua 'gengar-theme'. Trocar o nome apagaria a preferência de
 * quem já visitou a loja e jogaria todo mundo de volta no padrão.
 */
const themeScript = `(function(){try{
var s=localStorage.getItem('gengar-theme');
document.documentElement.dataset.theme=(s==='light'||s==='dark')?s:'light';
}catch(e){document.documentElement.dataset.theme='light';}})();`;

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
DIRECTION CONTRACT
THESIS: O produto e a obra; a interface e a caixa iluminada em volta dele. Vitrine de museu, nao HUD de arcade.
OWN-WORLD: Papel claro por padrao, neutro frio de familia unica, um acento so (violeta da marca, dessaturado a 71%), sombra tingida do fundo, raio documentado por papel (chip/input/botao/card/conteiner), tipografia de uma familia em dois cortes (Geist, Geist Mono para numero).
STORY: Colecionavel conferido merece sala iluminada. O visitante ve a carta antes de ver a interface; nada na tela disputa atencao com a arte do produto.
FIRST VIEWPORT: Hero divide a dobra com a foto do produto, titulo contido em 3.75rem de teto para o botao de compra nunca sair da tela.
RETIRED: banda prismatica de foil, holo arco-iris em color-dodge, canto recortado, selo de cartolina, scanlines, malha tecnica. Eram quatro acentos e tres texturas disputando a mesma tela.
DIALS: DESIGN_VARIANCE 7, MOTION_INTENSITY 5, VISUAL_DENSITY 3.
-->`,
          }}
        />
        {/*
          Grão da página: uma camada fixa, sem captura de ponteiro, aplicada
          uma única vez no documento. A direção anterior pendurava textura em
          cada card e seção — filtro de ruído sobre contêiner que rola força
          repintura de GPU a cada quadro e derruba o FPS no celular.
        */}
        <div className="page-grain" aria-hidden />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
