'use client';

import { ChatCircleDots, CheckCircle, Star, ThumbsUp } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import type { PricePoint, Product, Question, Review } from '@/core/domain/entities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/disclosure';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Separator } from '@/components/ui/controls';
import { formatDate } from '@/lib/utils';
import { PriceHistory } from './price-history';

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
  questions: Question[];
  priceHistory: PricePoint[];
}

export function ProductTabs({ product, reviews, questions, priceHistory }: ProductTabsProps) {
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => review.rating === stars).length,
  }));
  const total = reviews.length || 1;

  return (
    <Tabs defaultValue="descricao" className="w-full">
      <TabsList>
        <TabsTrigger value="descricao">Descrição</TabsTrigger>
        <TabsTrigger value="especificacoes">Especificações</TabsTrigger>
        <TabsTrigger value="avaliacoes">Avaliações ({reviews.length})</TabsTrigger>
        <TabsTrigger value="perguntas">Perguntas ({questions.length})</TabsTrigger>
        <TabsTrigger value="historico">Histórico de preço</TabsTrigger>
      </TabsList>

      <TabsContent value="descricao">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-ink-muted text-base leading-relaxed">{product.description}</p>

            {product.highlights.length ? (
              <ul className="mt-8 flex flex-col gap-3">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="text-ink-muted flex items-start gap-3 text-sm">
                    <CheckCircle className="text-brand-400 mt-0.5 size-4 shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <aside className="plate flex flex-col gap-4 rounded-lg p-6">
            <h3 className="font-display text-ink text-sm font-semibold">Como enviamos</h3>
            <p className="text-ink-muted text-xs leading-relaxed">
              {product.type === 'tcg-card'
                ? 'Cartas seguem em sleeve, toploader lacrado e caixa rígida com preenchimento — o mesmo padrão que usamos para enviar itens de grading.'
                : 'Embalamos na caixa original protegida por plástico bolha, dentro de uma caixa externa com preenchimento e lacre de segurança.'}
            </p>
            <Separator />
            <div className="text-ink-faint flex flex-col gap-2 text-xs">
              <span>Nota fiscal em todo pedido</span>
              <span>Rastreio enviado por e-mail e WhatsApp</span>
              <span>7 dias para arrependimento</span>
            </div>
          </aside>
        </div>
      </TabsContent>

      <TabsContent value="especificacoes">
        <div className="grid gap-x-12 gap-y-0 md:grid-cols-2">
          {product.specs.map((spec, index) => (
            <div
              key={spec.label}
              className={`border-line flex items-start justify-between gap-6 border-b py-4 ${
                index === 0 ? 'md:border-t' : ''
              } ${index === 1 ? 'md:border-t' : ''}`}
            >
              <dt className="font-tech text-2xs text-ink-faint tracking-[0.16em] uppercase">
                {spec.label}
              </dt>
              <dd className="text-ink text-right text-sm font-medium">{spec.value}</dd>
            </div>
          ))}
          <div className="border-line flex items-start justify-between gap-6 border-b py-4">
            <dt className="font-tech text-2xs text-ink-faint tracking-[0.16em] uppercase">SKU</dt>
            <dd className="font-tech text-ink text-right text-sm">{product.sku}</dd>
          </div>
          <div className="border-line flex items-start justify-between gap-6 border-b py-4">
            <dt className="font-tech text-2xs text-ink-faint tracking-[0.16em] uppercase">
              Lançamento
            </dt>
            <dd className="text-ink text-right text-sm">{formatDate(product.releasedAt)}</dd>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="avaliacoes">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
          <aside className="plate flex h-fit flex-col gap-5 rounded-lg p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-display text-ink text-5xl font-bold">
                {product.rating.toFixed(1)}
              </span>
              <Rating value={product.rating} size="lg" showValue={false} />
              <span className="text-ink-faint text-xs">{product.reviewCount} avaliações</span>
            </div>

            <div className="flex flex-col gap-2">
              {distribution.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="font-tech text-2xs text-ink-faint flex w-8 items-center gap-1">
                    {row.stars}
                    <Star className="size-2.5" weight="fill" />
                  </span>
                  <div className="bg-ink/8 h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      className="from-brand-500 to-brand-300 h-full rounded-full bg-linear-to-r"
                      style={{ width: `${(row.count / total) * 100}%` }}
                    />
                  </div>
                  <span className="font-tech text-2xs text-ink-ghost w-6 text-right">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>

            <Button variant="secondary" size="sm" block>
              Avaliar produto
            </Button>
          </aside>

          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <article key={review.id} className="plate flex flex-col gap-3 rounded-lg p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="border-line from-brand-500/35 to-brand-800/35 font-display text-ink grid size-9 place-items-center rounded-full border bg-linear-to-br text-xs font-bold">
                      {review.author.charAt(0)}
                    </span>
                    <div>
                      <p className="text-ink text-sm font-semibold">{review.author}</p>
                      <p className="text-2xs text-ink-faint">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {review.verified ? (
                      <Badge variant="success" size="sm">
                        Compra verificada
                      </Badge>
                    ) : null}
                    <Rating value={review.rating} size="sm" showValue={false} />
                  </div>
                </div>

                <h4 className="font-display text-ink text-sm font-semibold">{review.title}</h4>
                <p className="text-ink-muted text-sm leading-relaxed">{review.body}</p>

                <button
                  type="button"
                  className="text-2xs text-ink-faint hover:text-brand-300 inline-flex w-fit items-center gap-2 font-semibold tracking-wider uppercase transition-colors"
                >
                  <ThumbsUp className="size-3" />
                  Útil ({review.helpful})
                </button>
              </article>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="perguntas">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-col gap-4">
            {questions.map((question) => (
              <article key={question.id} className="plate flex flex-col gap-4 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <ChatCircleDots className="text-brand-300 mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="text-ink text-sm font-semibold">{question.question}</p>
                    <p className="text-2xs text-ink-faint">
                      {question.author} · {formatDate(question.createdAt)}
                    </p>
                  </div>
                </div>

                {question.answer ? (
                  <div className="border-brand-500/40 ml-7 flex flex-col gap-2 border-l-2 pl-4">
                    <span className="font-tech text-2xs text-brand-300 font-bold tracking-wider uppercase">
                      Resposta Gengar Games
                    </span>
                    <p className="text-ink-muted text-sm leading-relaxed">{question.answer}</p>
                  </div>
                ) : (
                  <p className="text-ink-ghost ml-7 text-xs italic">
                    Ainda não respondida — nossa equipe responde em até 1 dia útil.
                  </p>
                )}
              </article>
            ))}
          </div>

          <aside className="plate flex h-fit flex-col gap-4 rounded-lg p-6">
            <h3 className="font-display text-ink text-sm font-semibold">Ficou com dúvida?</h3>
            <Textarea
              placeholder="Escreva sua pergunta sobre este produto…"
              aria-label="Sua pergunta"
            />
            <Button size="sm" block>
              Enviar pergunta
            </Button>
            <p className="text-2xs text-ink-faint leading-relaxed">
              Respondemos em até 1 dia útil. Perguntas e respostas ficam públicas para ajudar outros
              compradores.
            </p>
          </aside>
        </div>
      </TabsContent>

      <TabsContent value="historico">
        <PriceHistory points={priceHistory} current={product.price} />
      </TabsContent>
    </Tabs>
  );
}
