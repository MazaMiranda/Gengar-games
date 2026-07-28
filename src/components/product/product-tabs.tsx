'use client';

import * as React from 'react';
import { CheckCircle2, MessageCircleQuestion, Star, ThumbsUp } from 'lucide-react';
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
            <p className="text-base leading-relaxed text-ink-muted">{product.description}</p>

            {product.highlights.length ? (
              <ul className="mt-8 flex flex-col gap-3">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm text-ink-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-400" />
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <aside className="plate flex flex-col gap-4 rounded-lg p-6">
            <h3 className="font-display text-sm font-semibold text-ink">Como enviamos</h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              {product.type === 'tcg-card'
                ? 'Cartas seguem em sleeve, toploader lacrado e caixa rígida com preenchimento — o mesmo padrão que usamos para enviar itens de grading.'
                : 'Embalamos na caixa original protegida por plástico bolha, dentro de uma caixa externa com preenchimento e lacre de segurança.'}
            </p>
            <Separator />
            <div className="flex flex-col gap-2 text-xs text-ink-faint">
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
              className={`flex items-start justify-between gap-6 border-b border-line py-4 ${
                index === 0 ? 'md:border-t' : ''
              } ${index === 1 ? 'md:border-t' : ''}`}
            >
              <dt className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">
                {spec.label}
              </dt>
              <dd className="text-right text-sm font-medium text-ink">{spec.value}</dd>
            </div>
          ))}
          <div className="flex items-start justify-between gap-6 border-b border-line py-4">
            <dt className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">SKU</dt>
            <dd className="text-right font-tech text-sm text-ink">{product.sku}</dd>
          </div>
          <div className="flex items-start justify-between gap-6 border-b border-line py-4">
            <dt className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">Lançamento</dt>
            <dd className="text-right text-sm text-ink">{formatDate(product.releasedAt)}</dd>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="avaliacoes">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
          <aside className="plate flex h-fit flex-col gap-5 rounded-lg p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-display text-5xl font-bold text-ink">
                {product.rating.toFixed(1)}
              </span>
              <Rating value={product.rating} size="lg" showValue={false} />
              <span className="text-xs text-ink-faint">{product.reviewCount} avaliações</span>
            </div>

            <div className="flex flex-col gap-2">
              {distribution.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="flex w-8 items-center gap-1 font-tech text-2xs text-ink-faint">
                    {row.stars}
                    <Star className="size-2.5 fill-current" />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-300"
                      style={{ width: `${(row.count / total) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-tech text-2xs text-ink-ghost">{row.count}</span>
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
                    <span className="grid size-9 place-items-center rounded-full border border-line bg-linear-to-br from-brand-500/35 to-brand-800/35 font-display text-xs font-bold text-ink">
                      {review.author.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{review.author}</p>
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

                <h4 className="font-display text-sm font-semibold text-ink">{review.title}</h4>
                <p className="text-sm leading-relaxed text-ink-muted">{review.body}</p>

                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-ink-faint transition-colors hover:text-brand-300"
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
                  <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-brand-300" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-ink">{question.question}</p>
                    <p className="text-2xs text-ink-faint">
                      {question.author} · {formatDate(question.createdAt)}
                    </p>
                  </div>
                </div>

                {question.answer ? (
                  <div className="ml-7 flex flex-col gap-2 border-l-2 border-brand-500/40 pl-4">
                    <span className="font-tech text-2xs font-bold uppercase tracking-wider text-brand-300">
                      Resposta Gengar Games
                    </span>
                    <p className="text-sm leading-relaxed text-ink-muted">{question.answer}</p>
                  </div>
                ) : (
                  <p className="ml-7 text-xs italic text-ink-ghost">
                    Ainda não respondida — nossa equipe responde em até 1 dia útil.
                  </p>
                )}
              </article>
            ))}
          </div>

          <aside className="plate flex h-fit flex-col gap-4 rounded-lg p-6">
            <h3 className="font-display text-sm font-semibold text-ink">Ficou com dúvida?</h3>
            <Textarea placeholder="Escreva sua pergunta sobre este produto…" aria-label="Sua pergunta" />
            <Button size="sm" block>
              Enviar pergunta
            </Button>
            <p className="text-2xs leading-relaxed text-ink-faint">
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
