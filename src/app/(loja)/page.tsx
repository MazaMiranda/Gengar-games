import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Flame, PackageCheck, Sparkles } from 'lucide-react';
import { getHomeData } from '@/core/application/catalog-service';
import { testimonials } from '@/infrastructure/data';
import { Hero } from '@/components/home/hero';
import {
  BrandStrip,
  CategoryBento,
  PlatformStrip,
  PromoBanner,
} from '@/components/home/sections';
import { Testimonials } from '@/components/home/testimonials';
import { ProductRail } from '@/components/shop/product-rail';
import { ProductCard } from '@/components/shop/product-card';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Gengar Games — TCG, Consoles e Cultura Gamer',
  description:
    'Loja premium de Trading Card Games, consoles, jogos, acessórios e colecionáveis. Singles conferidos carta a carta e consoles testados na bancada.',
};

export const revalidate = 300;

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <Hero featured={data.hero} totalProdutos={data.totalProdutos} />

      <Section aria-labelledby="categorias">
        <SectionHeading
          eyebrow="Navegue por"
          title={<span id="categorias">Categorias em destaque</span>}
          description="Do single mais disputado ao console de edição limitada — tudo organizado do jeito que colecionador procura."
          href="/catalogo"
          linkLabel="Todas as categorias"
          className="mb-10"
        />
        <CategoryBento categories={data.categories} />
      </Section>

      <Section className="perf-contain py-0" aria-labelledby="novidades">
        <SectionHeading
          eyebrow="Acabou de chegar"
          title={<span id="novidades">Novidades na loja</span>}
          description="Lançamentos e restocks das últimas semanas, com estoque conferido agora."
          href="/catalogo?ordenar=lancamentos"
          className="mb-10"
        />
        <ProductRail products={data.novidades} />
      </Section>

      <Section className="perf-contain" aria-labelledby="ofertas">
        <SectionHeading
          eyebrow="Preço abaixo do mercado"
          title={
            <span id="ofertas" className="flex items-center gap-3">
              Ofertas da semana
              <Flame className="size-6 text-brand-400" />
            </span>
          }
          description="Descontos reais em itens selecionados. Enquanto durar o estoque."
          href="/catalogo?promocao=1"
          className="mb-10"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {data.ofertas.slice(0, 8).map((product) => (
            <Reveal key={product.slug} delay={0.03} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Section>

      <PromoBanner />

      <Section className="perf-contain" aria-labelledby="tcg">
        <SectionHeading
          eyebrow="Área TCG"
          title={<span id="tcg">Pokémon TCG, uma curadoria só</span>}
          description="Cada single é avaliado sob luz UV, classificado por estado e enviado protegido."
          href="/tcg"
          linkLabel="Entrar na área TCG"
          className="mb-10"
        />
        <ProductRail products={data.destaquesTcg} />
      </Section>

      <Section className="perf-contain" aria-labelledby="consoles">
        <SectionHeading
          eyebrow="Área gamer"
          title={<span id="consoles">Consoles e plataformas</span>}
          description="PlayStation, Xbox, Nintendo, PC e retrô — com garantia e revisão da nossa bancada."
          href="/gamer"
          linkLabel="Explorar área gamer"
          className="mb-10"
        />
        <PlatformStrip />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {data.consoles.slice(0, 3).map((product, index) => (
            <Reveal key={product.slug} delay={index * 0.06} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="perf-contain" aria-labelledby="jogos">
        <SectionHeading
          eyebrow="Mídia física"
          title={<span id="jogos">Jogos novos e usados</span>}
          description="Usados testados, higienizados e com 90 dias de garantia da loja."
          href="/catalogo?categoria=jogos&categoria=jogos-usados"
          className="mb-10"
        />
        <ProductRail products={data.jogos} />
      </Section>

      <Section className="perf-contain" aria-labelledby="acessorios">
        <SectionHeading
          eyebrow="Setup completo"
          title={<span id="acessorios">Acessórios e periféricos</span>}
          description="Controles, headsets e upgrades que mudam a forma como você joga."
          href="/catalogo?categoria=controles&categoria=headsets&categoria=acessorios"
          className="mb-10"
        />
        <ProductRail products={data.acessorios} />
      </Section>

      <Section className="perf-contain" aria-labelledby="colecionaveis">
        <SectionHeading
          eyebrow="Vitrine"
          title={<span id="colecionaveis">Colecionáveis e edições especiais</span>}
          description="Estátuas, caixas de colecionador e itens que saem de linha e não voltam."
          href="/catalogo?categoria=colecionaveis&categoria=edicoes-colecionador&categoria=geek"
          className="mb-10"
        />
        <ProductRail products={data.colecionaveis} />
      </Section>

      <Section className="perf-contain" aria-labelledby="mais-vendidos">
        <SectionHeading
          eyebrow="Campeões de venda"
          title={<span id="mais-vendidos">Mais vendidos do mês</span>}
          description="O que a comunidade Gengar mais levou nos últimos 30 dias."
          href="/catalogo?ordenar=mais-vendidos"
          className="mb-10"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {data.maisVendidos.slice(0, 8).map((product) => (
            <Reveal key={product.slug} delay={0.03} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="container-page">
        <BrandStrip brands={data.brands} />
      </div>

      <Section className="perf-contain" aria-labelledby="depoimentos">
        <SectionHeading
          eyebrow="Quem já comprou"
          title={<span id="depoimentos">A comunidade aprova</span>}
          description="Mais de 18 mil pedidos entregues e nota 4,9 nas avaliações públicas."
          className="mb-10"
        />
        <Testimonials testimonials={testimonials} />
      </Section>

      {/* Chamada final */}
      <Section>
        <Reveal className="plate grain relative overflow-hidden rounded-2xl p-10 text-center md:p-16">
          <div
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-400 to-transparent"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[110px]"
            style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.6), transparent 68%)' }}
            aria-hidden
          />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <span className="eyebrow flex items-center gap-2">
              <Sparkles className="size-3" /> Comece sua coleção
            </span>
            <h2 className="text-display font-extrabold text-ink">
              Falta pouco para o seu próximo <span className="text-gradient-brand">chase</span>
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
              Mais de {data.totalProdutos} produtos com curadoria, envio protegido e parcelamento em
              até 12x sem juros. Frete grátis a partir de R$ 299.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/catalogo">
                  Ver catálogo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/cadastro">
                  <PackageCheck className="size-4" />
                  Criar conta
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
