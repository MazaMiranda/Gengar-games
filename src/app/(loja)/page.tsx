import type { Metadata } from 'next';
import { getHomeData } from '@/core/application/catalog-service';
import { Hero, type HeroSlide } from '@/components/home/hero';

export const metadata: Metadata = {
  title: 'TCG, Consoles e Cultura Gamer',
  description:
    'Cartas Pokémon conferidas uma a uma, consoles testados na bancada e colecionáveis com procedência. Envio protegido para todo o Brasil.',
};

/**
 * Home.
 *
 * É uma tela só. Antes eram treze seções e mais de nove mil pixels de rolagem
 * — bento de categorias, novidades, ofertas, faixa de promoção, TCG, consoles,
 * jogos, acessórios, colecionáveis, mais vendidos, marcas, depoimentos e uma
 * chamada final. Seis delas eram o mesmo trilho de produto com o título
 * trocado, o que fazia a página ler como esteira de catálogo.
 *
 * Agora a própria primeira tela se reveza entre as áreas. Nenhum destino se
 * perdeu: catálogo, TCG, área gamer, acessórios e colecionáveis seguem no menu,
 * na busca e no rodapé. O que saiu foi a repetição, não o caminho.
 */
export default async function HomePage() {
  const data = await getHomeData();

  const areas: HeroSlide[] = [
    {
      id: 'tcg',
      label: 'Pokémon TCG · conferido carta a carta',
      lead: 'Cada single passa por luz UV, é classificado por estado e sai em toploader. Do comum ao secret rare, com foto do item que você recebe.',
      href: '/tcg',
      cta: 'Área TCG',
      /*
       * data.hero, não data.destaquesTcg.
       *
       * `hero` é a seleção curada de cartas que têm imagem da TCGdex; os
       * destaques de TCG trazem também Elite Trainer Box e Booster Box, que
       * não têm foto. Como esta é a primeira coisa que a loja mostra, o slide
       * de abertura precisa das três cartas de verdade — com os boxes, dois de
       * cada três quadros da vitrine viravam ícone.
       */
      products: data.hero,
    },
    {
      id: 'consoles',
      label: 'Consoles · testados na bancada',
      lead: 'PlayStation, Xbox e Nintendo. Todo usado passa por bancada, teste e higienização, e sai com 90 dias de garantia da loja.',
      href: '/gamer',
      cta: 'Área gamer',
      products: data.consoles,
    },
    {
      id: 'colecionaveis',
      label: 'Colecionáveis · edições que não voltam',
      lead: 'Estátuas, edições de colecionador e itens fora de linha. Quando o estoque acaba, acabou — não há reposição.',
      href: '/catalogo?categoria=colecionaveis&categoria=edicoes-colecionador&categoria=geek',
      cta: 'Ver colecionáveis',
      products: data.colecionaveis,
    },
    {
      id: 'acessorios',
      label: 'Acessórios · setup completo',
      lead: 'Controles, headsets e upgrades de setup. O que muda a forma como você joga, não só o que enfeita a mesa.',
      href: '/catalogo?categoria=controles&categoria=headsets&categoria=acessorios',
      cta: 'Ver acessórios',
      products: data.acessorios,
    },
  ].filter((area) => area.products.length >= 3);

  return <Hero slides={areas} totalProdutos={data.totalProdutos} />;
}
