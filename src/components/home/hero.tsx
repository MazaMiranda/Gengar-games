'use client';

import { ArrowRight, Pause, Play, ShieldCheck, Truck } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Product } from '@/core/domain/entities';
import { Button } from '@/components/ui/button';
import { Aurora } from '@/components/layout/aurora';
import { ProductVisual } from '@/components/shop/product-visual';
import { EASE_OUT_EXPO } from '@/components/ui/motion';
import { cn, formatCompact, formatPrice } from '@/lib/utils';

export interface HeroSlide {
  id: string;
  /** Etiqueta impressa presa na vitrine. Informação real, nunca kicker solto. */
  label: string;
  lead: string;
  href: string;
  cta: string;
  products: Product[];
}

interface HeroProps {
  slides: HeroSlide[];
  totalProdutos: number;
}

const stats = [
  { label: 'Produtos no catálogo', suffix: '+' },
  { label: 'Pedidos entregues', value: 18400, suffix: '+' },
  { label: 'Nota média dos clientes', value: 4.9, suffix: '/5' },
];

/*
 * 5s por área.
 *
 * Eram 7s. Com quatro áreas isso dava 28s para a loja mostrar tudo que tem, e
 * ninguém fica meio minuto parado numa home. 5s ainda passa dos ~3s que se leva
 * para ler a frase e bater o olho nos três produtos, e fecha a volta completa
 * em 20s. Quem quiser mais tempo tem o botão de pausa e os pontos.
 */
const INTERVALO = 5000;

/**
 * Entrada dos blocos da coluna de texto.
 *
 * Só deslocamento, nunca opacidade. O estado inicial é renderizado no servidor
 * e vai no HTML: com `opacity: 0` a dobra sairia invisível e só apareceria
 * quando o JavaScript assumisse — bastava a rede engasgar para a loja abrir em
 * branco. Movendo apenas o eixo Y, o pior caso é o texto nascer 22px abaixo do
 * lugar, legível desde o primeiro byte.
 */
const SUBIR = {
  oculto: { y: 22 },
  visivel: { y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

/**
 * A home inteira.
 *
 * Antes o herói era uma tela fixa sobre TCG e, abaixo dela, treze seções
 * repetiam o mesmo trilho de produto com títulos diferentes — nove mil pixels
 * de rolagem para dizer o que cabe numa tela. Agora a própria tela se reveza
 * entre as áreas da loja: TCG, consoles, colecionáveis e acessórios.
 *
 * O que fica parado é a âncora da marca: o título, os números e os selos. O que
 * troca é a etiqueta, a frase, o botão da área e os três produtos em exposição.
 * Piscar o título a cada sete segundos faria a loja parecer instável; trocar só
 * a vitrine faz ela parecer viva.
 *
 * O avanço pausa no ponteiro e no foco do teclado, porque um painel que troca
 * enquanto a pessoa lê o preço é hostil. Sob prefers-reduced-motion não há
 * avanço automático nem deslizamento, só os controles.
 */
export function Hero({ slides, totalProdutos }: HeroProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  /** Pausa temporária: ponteiro sobre a vitrine, ou foco de teclado na seção. */
  const [pausado, setPausado] = React.useState(false);
  /** Pausa deliberada, pelo botão. Sobrepõe tudo e não volta sozinha. */
  const [parado, setParado] = React.useState(false);

  const total = slides.length;

  /*
   * O rodízio não depende mais de prefers-reduced-motion.
   *
   * Antes a preferência desligava o avanço inteiro, e quem a mantém ligada
   * (comum no iOS e em quem tem sensibilidade vestibular) simplesmente nunca
   * via as outras três áreas da loja, porque a home é só esta tela. O que a
   * preferência precisa remover é o *movimento*, não o conteúdo: abaixo, o
   * deslizamento vira troca seca, e a informação continua chegando.
   *
   * O botão de pausar existe porque a WCAG 2.2.2 exige mecanismo de parar
   * qualquer conteúdo que se mova sozinho por mais de cinco segundos. Os
   * pontos permitiam navegar, mas não parar.
   */
  React.useEffect(() => {
    if (pausado || parado || total < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), INTERVALO);
    return () => clearInterval(t);
  }, [pausado, parado, total]);

  const slide = slides[index];
  const [primary, secondary, tertiary] = slide?.products ?? [];

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Áreas da loja"
      /*
       * A pausa por foco fica na seção inteira (quem navega por teclado pode
       * estar em qualquer controle daqui), mas a pausa por ponteiro NÃO pode
       * ficar aqui: esta seção ocupa 92svh, então o mouse parado em qualquer
       * lugar da dobra a congelava para sempre e o revezamento nunca
       * acontecia. O hover só pausa sobre a vitrine e sobre os controles, que
       * é onde a pessoa está de fato lendo ou mirando.
       */
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      className="border-line relative flex min-h-[92svh] items-center overflow-hidden border-b pt-10 pb-16 md:min-h-[94svh]"
    >
      <Aurora />

      <div className="container-page relative grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-8">
        {/*
          Coluna fixa: título, números e selos não piscam.

          A entrada é escalonada de cima para baixo — título, frase, botões,
          números, selos — porque é a ordem em que a página quer ser lida.
          Montar tudo no mesmo quadro entrega um bloco chapado e desperdiça o
          único momento em que dá para dirigir o olho de graça.
        */}
        <motion.div
          initial={reduced ? false : 'oculto'}
          animate="visivel"
          variants={{ visivel: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } }}
          className="flex flex-col gap-8 lg:col-span-6"
        >
          {/* text-4xl no celular: o clamp de --text-hero parava em 2.25rem e o
              título ainda comia três linhas e metade da tela de 375px, antes de
              qualquer produto aparecer. */}
          <motion.h1
            variants={SUBIR}
            className="lg:text-hero max-w-xl text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl"
          >
            <span className="text-ink">Sua coleção merece uma </span>
            <span className="text-ink relative">
              loja à altura
              <span className="bg-brand-500 absolute -bottom-1 left-0 h-[3px] w-full" aria-hidden />
            </span>
          </motion.h1>

          {/* Frase e botão da área acompanham a vitrine. min-h reserva o espaço
              das três linhas para o bloco abaixo não pular a cada troca. */}
          {/* min-h reserva o espaço da frase para o bloco abaixo não pular a
              cada troca. No celular a mesma frase ocupa quatro linhas em vez de
              duas, então a reserva precisa ser maior lá, não menor. */}
          <motion.div
            variants={SUBIR}
            className="flex min-h-[13rem] flex-col gap-6 sm:min-h-[9.5rem] sm:gap-8"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={slide?.id}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: reduced ? 0 : 0.4, ease: EASE_OUT_EXPO }}
                className="text-ink-muted max-w-lg text-base leading-relaxed"
                aria-live="polite"
              >
                {slide?.lead}
              </motion.p>
            </AnimatePresence>

            {/* Grade de duas colunas no celular em vez de flex-wrap: com wrap os
                dois botões empilhavam com larguras diferentes, e o secundário
                ficava metade do primário. Aqui dividem a linha por igual. */}
            <div className="grid grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap">
              {/* Ação principal fica fora do revezamento: piscar o CTA de maior
                  intenção a cada sete segundos custa clique. */}
              <Button asChild size="lg">
                <Link href="/catalogo">
                  Explorar catálogo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              {/*
                O botão da área troca junto com a frase, na mesma chave e na
                mesma duração. Antes a frase saía em 0,4s pelo AnimatePresence
                e o botão trocava no mesmo quadro do estado: durante essa fração
                a pessoa lia a descrição de uma área com o botão de outra.
              */}
              <AnimatePresence mode="wait">
                {slide ? (
                  <motion.div
                    key={slide.id}
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: reduced ? 0 : 0.4, ease: EASE_OUT_EXPO }}
                  >
                    <Button asChild variant="secondary" size="lg">
                      <Link href={slide.href}>{slide.cta}</Link>
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>

          {/*
            Vitrine do celular.

            O arranjo de cartas sobrepostas exige 38rem de altura e posição
            absoluta: em 375px isso não cabe, e por isso a vitrine inteira
            estava em `hidden lg:block`. O resultado era o pior caso numa loja —
            a primeira tela do celular não mostrava produto nenhum, e os pontos
            do revezamento giravam sem nada mudando.

            Aqui as mesmas três peças viram uma fileira, em fluxo normal, e
            ficam logo abaixo dos botões: produto antes de estatística. A troca
            usa mode="wait" de propósito — em grade, deixar a área que sai
            conviver com a que entra empurraria o layout. No desktop as cartas
            são absolutas e podem se sobrepor; aqui não.
          */}
          <motion.div variants={SUBIR} className="lg:hidden">
            <AnimatePresence mode="wait">
              {/* Desloca no eixo Y, não no X.
                  Com `x: 28` a grade ocupa a largura toda menos as margens, e
                  durante a transição a borda direita ia a 379px numa viewport
                  de 375: só não virava barra de rolagem porque o body usa
                  overflow-x: clip. Vertical não tem esse risco. */}
              <motion.div
                key={slide?.id}
                initial={reduced ? false : { y: 16 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduced ? undefined : { y: -16, opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.38, ease: EASE_OUT_EXPO }}
                className="grid grid-cols-3 gap-2.5"
              >
                {(slide?.products ?? []).slice(0, 3).map((product, i) => (
                  <Link
                    key={product.slug}
                    href={
                      product.type === 'tcg-card'
                        ? `/carta/${product.slug}`
                        : `/produto/${product.slug}`
                    }
                    className="plate block overflow-hidden rounded-lg"
                  >
                    {/* As três são a dobra no celular, então as três carregam
                        com prioridade. Só o primeiro tinha, e os outros dois
                        apareciam vazios até o lazy-load chegar. */}
                    <div className="relative aspect-4/5 overflow-hidden">
                      <ProductVisual product={product} priority={i < 3} />
                    </div>
                    <div className="flex flex-col gap-0.5 p-2">
                      {/* min-h de duas linhas: sem isso o nome de uma linha
                          sobe o preço e os três cards ficam com o valor em
                          alturas diferentes, lado a lado. */}
                      <p className="text-ink line-clamp-2 min-h-[1.8rem] text-[0.6875rem] leading-tight font-semibold">
                        {product.name}
                      </p>
                      <span className="text-brand-200 text-xs font-bold">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.dl
            variants={SUBIR}
            className="border-line grid max-w-lg grid-cols-3 gap-6 border-t pt-7"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dd className="font-display text-ink text-2xl font-bold">
                  {i === 0 ? formatCompact(totalProdutos) : formatCompact(stat.value ?? 0)}
                  <span className="text-brand-300">{stat.suffix}</span>
                </dd>
                <dt className="text-2xs text-ink-faint leading-snug">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>

          <motion.div variants={SUBIR} className="flex flex-wrap items-center gap-5">
            <span className="text-2xs text-ink-faint flex items-center gap-2">
              <Truck className="text-brand-400 size-3.5" /> Frete grátis acima de R$ 299
            </span>
            <span className="text-2xs text-ink-faint flex items-center gap-2">
              <ShieldCheck className="text-brand-400 size-3.5" /> Garantia Gengar de 90 dias
            </span>

            {/* Controles junto dos selos, não flutuando sobre a arte: aqui eles
                ficam na ordem natural de tabulação e não cobrem produto. */}
            {total > 1 ? (
              /* Linha própria no celular. Com ml-auto numa única linha, os
                 pontos encostavam em "Garantia Gengar de 90 dias" e o alvo de
                 toque do botão de pausa cobria o fim do texto. */
              <div
                className="flex w-full items-center justify-end gap-3 sm:ml-auto sm:w-auto"
                onMouseEnter={() => setPausado(true)}
                onMouseLeave={() => setPausado(false)}
              >
                <div className="flex items-center gap-1.5">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Ver ${s.label}`}
                      aria-current={i === index}
                      className={cn(
                        'ease-out-expo bg-ink/15 h-1.5 overflow-hidden rounded-full transition-all duration-400',
                        i === index ? 'w-8' : 'hover:bg-ink/30 w-3.5',
                      )}
                    >
                      {/*
                        O ponto ativo é também o relógio do revezamento: a barra
                        preenche em sete segundos e congela quando pausa. Sem
                        isso a troca chega sem aviso no meio da leitura, e a
                        pessoa não tem como saber que ia acontecer.

                        scaleX com origem à esquerda, não width: largura força
                        cálculo de layout a cada quadro.
                      */}
                      {i === index ? (
                        <span
                          key={`${index}-${parado}`}
                          className="bg-brand-500 block h-full w-full origin-left"
                          style={{
                            animation: `progresso ${INTERVALO}ms linear forwards`,
                            animationPlayState: pausado || parado ? 'paused' : 'running',
                          }}
                        />
                      ) : null}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setParado((p) => !p)}
                  aria-pressed={parado}
                  aria-label={parado ? 'Retomar o revezamento' : 'Pausar o revezamento'}
                  className="border-line text-ink-faint hover:border-line-strong hover:text-ink tap-44 grid size-7 place-items-center rounded-md border transition-colors"
                >
                  {parado ? <Play className="size-3" /> : <Pause className="size-3" />}
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>

        {/* Vitrine do desktop: cartas sobrepostas, em posição absoluta. */}
        <div
          className="relative hidden h-[38rem] lg:col-span-6 lg:block"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          {/*
            Sem `mode="wait"` e sem embrulho comum.

            Antes as três cartas viviam dentro de um único motion.div com
            mode="wait": o bloco inteiro saía, o bloco inteiro entrava, e a
            leitura era de corte seco — um slide substituindo o outro. Agora
            cada carta é um filho direto do AnimatePresence com chave própria
            (área + posição), então a saída da área anterior e a entrada da
            nova acontecem ao mesmo tempo, escalonadas: as peças se trocam em
            cascata, como uma vitrine sendo remontada.

            Sem opacidade no `initial`: esse estado é renderizado no servidor e
            iria no HTML. Aqui as cartas nascem deslocadas e em escala menor,
            porém visíveis. A opacidade entra só no `animate` e no `exit`, que
            nunca chegam a existir sem JavaScript.
          */}
          <AnimatePresence>
            <motion.div
              key={`${slide?.id}-etiqueta`}
              initial={reduced ? false : { y: -12, scale: 0.96 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={reduced ? undefined : { y: -12, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE_OUT_EXPO }}
              className="cert-label absolute top-6 left-0 z-3 -rotate-2"
            >
              {slide?.label}
            </motion.div>

            {/* z-2: o card terciário cruza o rodapé deste e cobriria o preço. */}
            {primary ? (
              <FloatingCard
                key={`${slide?.id}-0`}
                product={primary}
                index={0}
                className="top-16 left-0 z-2 w-52 xl:w-56"
              />
            ) : null}
            {secondary ? (
              <FloatingCard
                key={`${slide?.id}-1`}
                product={secondary}
                index={1}
                className="top-[20%] right-0 w-56 xl:w-60"
                tone="muted"
              />
            ) : null}
            {tertiary ? (
              <FloatingCard
                key={`${slide?.id}-2`}
                product={tertiary}
                index={2}
                className="bottom-0 left-[28%] w-44 xl:w-48"
                tone="muted"
              />
            ) : null}
          </AnimatePresence>

          <div
            className="absolute inset-0 -z-1 rounded-full opacity-60 blur-[100px]"
            style={{
              background:
                'radial-gradient(circle at 45% 42%, color-mix(in srgb, var(--color-brand-500) 24%, transparent), transparent 52%)',
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  product,
  index,
  className,
  tone = 'primary',
}: {
  product: Product;
  index: number;
  className?: string;
  tone?: 'primary' | 'muted';
}) {
  const reduced = useReducedMotion();
  const inclinacao = index % 2 ? 3 : -3;

  /*
   * Duas camadas de movimento, com papéis diferentes.
   *
   * A externa é a entrada: as três cartas chegam escalonadas a cada troca de
   * área, de trás para frente, para o olho seguir a ordem em que elas se
   * empilham. Antes trocavam no mesmo quadro e a vitrine inteira piscava.
   *
   * A interna é a flutuação contínua, com fase e amplitude diferentes por
   * carta. É o que impede a vitrine de parecer um print: peça exposta em
   * suporte tem uma respiração mínima. Amplitude de 6 a 8px — o suficiente
   * para o olho registrar vida, pouco o bastante para não distrair de quem
   * está lendo o preço ao lado.
   *
   * A flutuação fica num wrapper próprio porque o hover anima a article: se
   * as duas disputassem a mesma propriedade, o card cairia de volta ao meio do
   * gesto.
   */
  return (
    <motion.article
      /* Sem opacidade no initial: este estado vai no HTML do servidor. A carta
         nasce deslocada e menor, mas visível. */
      initial={reduced ? false : { y: 56, scale: 0.9, rotate: index % 2 ? 9 : -9 }}
      animate={{ y: 0, scale: 1, rotate: inclinacao, opacity: 1 }}
      exit={reduced ? undefined : { y: -36, scale: 0.94, rotate: index % 2 ? -6 : 6, opacity: 0 }}
      transition={{
        /* Mola na entrada: a carta chega com peso e assenta, em vez de deslizar
           num tempo fixo. É o que separa "elemento animado" de "objeto sendo
           posto na vitrine". Amortecimento alto o bastante para não quicar. */
        type: 'spring',
        stiffness: 88,
        damping: 17,
        mass: 0.9,
        delay: index * 0.1,
        /* A saída não usa mola: precisa ser curta e previsível para não
           atropelar a entrada da área seguinte. */
        opacity: { duration: 0.3, ease: EASE_OUT_EXPO },
      }}
      whileHover={{ y: -12, rotate: 0, scale: 1.03 }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, index % 2 ? -8 : -6, 0] }}
        transition={{
          duration: 5.5 + index * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.6,
        }}
      >
        <Link
          href={product.type === 'tcg-card' ? `/carta/${product.slug}` : `/produto/${product.slug}`}
          className="plate group shadow-lift block overflow-hidden rounded-xl"
        >
          <div className="holo relative aspect-4/5 overflow-hidden">
            <ProductVisual product={product} priority={index === 0} />
          </div>
          {/* O nome ocupa a linha inteira; dividir a linha com o preço o cortava
              no meio da palavra em cards estreitos. */}
          <div className="flex flex-col gap-1.5 p-4">
            <p className="font-display text-ink line-clamp-2 text-xs leading-snug font-semibold">
              {product.name}
            </p>
            <div className="flex items-baseline justify-between gap-2">
              {/* min-w-0: sem isso o nowrap do truncate impede o encolhimento e
                  o texto passa por baixo do preço. */}
              <p className="text-ink-faint min-w-0 truncate text-xs">
                {product.card?.set ?? product.subtitle}
              </p>
              <span
                className={`font-display shrink-0 text-sm font-bold ${
                  tone === 'primary' ? 'text-brand-200' : 'text-ink-muted'
                }`}
              >
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.article>
  );
}
