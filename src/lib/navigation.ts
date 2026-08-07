import { platformList, tcgGameList } from '@/core/domain/taxonomy';
import { BAIRRO_CIDADE } from '@/lib/loja';

export interface NavColumn {
  title: string;
  links: { label: string; href: string; hint?: string }[];
}

export interface NavEntry {
  id: string;
  label: string;
  href: string;
  columns?: NavColumn[];
  highlight?: { title: string; description: string; href: string; cta: string };
}

export const primaryNav: NavEntry[] = [
  {
    id: 'tcg',
    label: 'TCG',
    href: '/tcg',
    columns: [
      {
        title: 'Jogos',
        links: tcgGameList.map((game) => ({
          label: game.name,
          href: `/tcg/${game.slug}`,
          hint: game.publisher,
        })),
      },
      {
        title: 'Formatos',
        links: [
          { label: 'Cartas avulsas', href: '/catalogo?tipo=tcg-card' },
          { label: 'Booster boxes', href: '/catalogo?tipo=tcg-sealed&tag=booster+box' },
          { label: 'Elite Trainer Box', href: '/catalogo?busca=elite+trainer' },
          { label: 'Starter decks', href: '/catalogo?tag=iniciante' },
          { label: 'Produtos selados', href: '/catalogo?tipo=tcg-sealed' },
        ],
      },
      {
        title: 'Proteção',
        links: [
          { label: 'Sleeves', href: '/catalogo?categoria=protecao-tcg&busca=sleeves' },
          { label: 'Toploaders', href: '/catalogo?categoria=protecao-tcg&busca=toploader' },
          { label: 'Binders', href: '/catalogo?categoria=protecao-tcg&busca=binder' },
          { label: 'Deck boxes', href: '/catalogo?categoria=protecao-tcg&busca=deck+box' },
        ],
      },
    ],
    highlight: {
      title: 'Singles conferidos carta a carta',
      description: 'Todo single passa por curadoria, é fotografado e enviado em toploader.',
      href: '/tcg',
      cta: 'Explorar a área TCG',
    },
  },
  {
    id: 'games',
    label: 'Games',
    href: '/gamer',
    columns: [
      {
        title: 'Plataformas',
        links: platformList.map((platform) => ({
          label: platform.name,
          href: `/gamer/${platform.slug}`,
          hint: platform.tagline,
        })),
      },
      {
        title: 'Consoles',
        links: [
          { label: 'Todos os consoles', href: '/catalogo?categoria=consoles' },
          { label: 'Edição limitada', href: '/catalogo?categoria=consoles-limitados' },
          { label: 'Portáteis', href: '/catalogo?busca=portatil' },
          { label: 'Retro restaurado', href: '/catalogo?plataforma=retro' },
        ],
      },
      {
        title: 'Jogos',
        links: [
          { label: 'Lançamentos', href: '/catalogo?categoria=jogos&ordenar=lancamentos' },
          { label: 'Mais vendidos', href: '/catalogo?categoria=jogos&ordenar=mais-vendidos' },
          { label: 'Usados garantidos', href: '/catalogo?categoria=jogos-usados' },
          { label: 'Edições de colecionador', href: '/catalogo?categoria=edicoes-colecionador' },
        ],
      },
    ],
    highlight: {
      title: 'Usados com 90 dias de garantia',
      description: 'Cada console e jogo usado passa por bancada, teste e higienização.',
      href: '/catalogo?categoria=jogos-usados',
      cta: 'Ver seminovos',
    },
  },
  {
    id: 'acessorios',
    label: 'Acessórios',
    href: '/catalogo?categoria=controles&categoria=headsets&categoria=acessorios',
    columns: [
      {
        title: 'Periféricos',
        links: [
          { label: 'Controles', href: '/catalogo?categoria=controles' },
          { label: 'Headsets', href: '/catalogo?categoria=headsets' },
          { label: 'Acessórios gamers', href: '/catalogo?categoria=acessorios' },
        ],
      },
      {
        title: 'Setup',
        links: [
          { label: 'Armazenamento', href: '/catalogo?busca=ssd' },
          { label: 'Streaming', href: '/catalogo?tag=streaming' },
          { label: 'Mousepads', href: '/catalogo?busca=mousepad' },
        ],
      },
    ],
  },
  {
    id: 'colecionaveis',
    label: 'Colecionáveis',
    href: '/catalogo?categoria=colecionaveis&categoria=edicoes-colecionador&categoria=geek',
    columns: [
      {
        title: 'Vitrine',
        links: [
          { label: 'Estátuas e figures', href: '/catalogo?categoria=colecionaveis' },
          { label: 'Edições de colecionador', href: '/catalogo?categoria=edicoes-colecionador' },
          { label: 'Consoles limitados', href: '/catalogo?categoria=consoles-limitados' },
          { label: 'Produtos geek', href: '/catalogo?categoria=geek' },
        ],
      },
    ],
  },
  { id: 'ofertas', label: 'Ofertas', href: '/catalogo?promocao=1' },
];

export const footerNav: NavColumn[] = [
  {
    title: 'Loja',
    links: [
      { label: 'Catálogo completo', href: '/catalogo' },
      { label: 'Área TCG', href: '/tcg' },
      { label: 'Área Gamer', href: '/gamer' },
      { label: 'Ofertas', href: '/catalogo?promocao=1' },
      { label: 'Lançamentos', href: '/catalogo?ordenar=lancamentos' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Meus pedidos', href: '/conta/pedidos' },
      { label: 'Favoritos', href: '/conta/favoritos' },
      { label: 'Endereços', href: '/conta/enderecos' },
      { label: 'Cupons', href: '/conta/cupons' },
      { label: 'Configurações', href: '/conta/configuracoes' },
    ],
  },
  {
    title: 'Ajuda',
    links: [
      { label: 'Prazos e frete', href: '/institucional/entrega' },
      { label: 'Trocas e devoluções', href: '/institucional/trocas' },
      { label: 'Formas de pagamento', href: '/institucional/pagamento' },
      { label: 'Como avaliamos cartas', href: '/institucional/curadoria' },
      { label: 'Fale com a gente', href: '/institucional/contato' },
    ],
  },
];

export const announcements = [
  'Frete grátis acima de R$ 299 para todo o Brasil',
  'Singles conferidos carta a carta antes do envio',
  'Até 12x sem juros nos consoles',
  `Retirada gratuita na loja do ${BAIRRO_CIDADE}`,
  'Usados com 90 dias de garantia Gengar',
];
