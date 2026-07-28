import type { PricePoint, Product, Question, Review } from '@/core/domain/entities';
import { hashString } from '@/lib/utils';

const AUTHORS = [
  'Rafael N.', 'Marina D.', 'Diego S.', 'Carol P.', 'Thiago B.', 'Juliana R.',
  'Bruno A.', 'Letícia M.', 'Gustavo F.', 'Priscila C.', 'André L.', 'Camila V.',
  'Vinícius T.', 'Fernanda O.', 'Rodrigo K.', 'Bianca S.',
];

const POSITIVE_BODIES = [
  'Chegou antes do prazo e embalado com muito cuidado. Exatamente como descrito no anúncio.',
  'Segunda compra na loja e o padrão se mantém: produto impecável e comunicação rápida.',
  'Preço melhor que o das grandes lojas e o atendimento respondeu minhas dúvidas no mesmo dia.',
  'Embalagem reforçada, nota fiscal na caixa e rastreio atualizado desde a postagem.',
  'Produto original, sem nenhuma surpresa. Recomendo para quem tem receio de comprar online.',
  'Vale cada centavo. A conferência antes do envio faz diferença de verdade.',
  'Comprei na pré-venda e recebi no dia do lançamento. Nada a reclamar.',
];

const NEUTRAL_BODIES = [
  'Produto ótimo, mas o frete para o Nordeste demorou dois dias a mais que o previsto.',
  'Excelente qualidade. Só senti falta de mais opções de parcelamento sem juros.',
  'Atendeu o que prometia. A embalagem poderia ter um pouco mais de proteção interna.',
];

const TITLES = [
  'Chegou perfeito', 'Superou a expectativa', 'Loja confiável', 'Vale o investimento',
  'Exatamente como anunciado', 'Melhor custo-benefício', 'Voltarei a comprar',
];

const QUESTIONS_POOL: { q: string; a: string }[] = [
  {
    q: 'Vocês emitem nota fiscal?',
    a: 'Sim. Toda compra sai com NF-e emitida em nome do titular do pedido, enviada por e-mail e impressa na caixa.',
  },
  {
    q: 'Como é feita a embalagem para envio?',
    a: 'Cartas vão em sleeve + toploader + caixa rígida. Consoles e acessórios são enviados na caixa original protegida por plástico bolha e caixa externa.',
  },
  {
    q: 'Tem previsão de reposição se o estoque acabar?',
    a: 'Depende do item. Produtos selados e periféricos costumam ser repostos em até 15 dias; singles e edições limitadas dependem de disponibilidade no mercado.',
  },
  {
    q: 'Consigo retirar na loja física?',
    a: 'Sim, a retirada em Pinheiros (São Paulo) é gratuita e fica disponível em até 4 horas úteis após a confirmação do pagamento.',
  },
  {
    q: 'Qual é a política de troca?',
    a: 'Você tem 7 dias corridos para arrependimento e 30 dias para defeito de fabricação, conforme o Código de Defesa do Consumidor.',
  },
];

function pick<T>(list: T[], seed: number, offset = 0): T {
  return list[(seed + offset * 7) % list.length]!;
}

/** Avaliações determinísticas: mesma entrada, mesma saída em qualquer build. */
export function reviewsForProduct(product: Product): Review[] {
  const seed = hashString(product.slug);
  const count = 2 + (seed % 4);
  const reviews: Review[] = [];

  for (let i = 0; i < count; i++) {
    const localSeed = seed + i * 31;
    const isCritical = i === count - 1 && seed % 3 === 0;
    const daysAgo = 3 + ((localSeed % 160) + i * 11);
    reviews.push({
      id: `${product.slug}-rev-${i}`,
      productSlug: product.slug,
      author: pick(AUTHORS, localSeed, i),
      rating: isCritical ? 4 : 5,
      title: pick(TITLES, localSeed, i + 2),
      body: isCritical ? pick(NEUTRAL_BODIES, localSeed, i) : pick(POSITIVE_BODIES, localSeed, i),
      createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      verified: localSeed % 5 !== 0,
      helpful: localSeed % 24,
    });
  }

  return reviews;
}

export function questionsForProduct(product: Product): Question[] {
  const seed = hashString(product.slug);
  const count = 2 + (seed % 3);

  return Array.from({ length: count }, (_, i) => {
    const entry = pick(QUESTIONS_POOL, seed, i);
    const answered = !(i === count - 1 && seed % 4 === 0);
    return {
      id: `${product.slug}-q-${i}`,
      productSlug: product.slug,
      author: pick(AUTHORS, seed, i + 5),
      question: entry.q,
      answer: answered ? entry.a : null,
      createdAt: new Date(Date.now() - (7 + ((seed + i * 17) % 90)) * 86_400_000).toISOString(),
    };
  });
}

/**
 * Histórico de preço dos últimos 12 meses. Converge para o preço atual e
 * respeita o preço de comparação como teto quando existir.
 */
export function priceHistoryForProduct(product: Product): PricePoint[] {
  const seed = hashString(product.slug);
  const ceiling = product.compareAtPrice ?? Math.round(product.price * 1.18);
  const points: PricePoint[] = [];
  const now = new Date();

  for (let month = 11; month >= 0; month--) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 1);
    if (month === 0) {
      points.push({ date: date.toISOString().slice(0, 10), price: product.price });
      continue;
    }
    const wave = Math.sin((seed % 100) / 12 + month) * 0.06;
    const drift = (month / 11) * 0.12;
    const value = Math.round(product.price * (1 + drift + wave));
    points.push({
      date: date.toISOString().slice(0, 10),
      price: Math.min(ceiling, Math.max(Math.round(product.price * 0.88), value)),
    });
  }

  return points;
}
