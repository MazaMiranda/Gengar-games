/**
 * Cliente da TCGdex (https://tcgdex.dev/pt-br) — API pública, sem chave, focada
 * em Pokémon TCG. Usado só no cadastro administrativo: quando o operador informa
 * nome e número da carta, buscamos aqui a arte real e alguns metadados para
 * conferência. Nunca é chamada a partir da loja — a busca do cliente continua
 * restrita ao catálogo já cadastrado (ver core/application/catalog-query.ts).
 */

/*
 * Locale "pt-br" da TCGdex só indexa o Pokémon TCG Pocket (mobile) — o TCG
 * físico (Evolving Skies, Obsidian Flames, os sets que a loja vende) só
 * existe no locale "en". Confirmado direto na API: /v2/pt-br/cards?name=Umbreon
 * VMAX devolve vazio; /v2/en/cards?name=Umbreon VMAX acha as 4 impressões
 * certas. Nome/rótulos continuam em português — só a busca troca de idioma.
 */
const BASE_URL = 'https://api.tcgdex.net/v2/en';
const REQUEST_TIMEOUT_MS = 8000;

interface TcgdexCardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

interface TcgdexCardFull {
  id: string;
  name: string;
  localId: string;
  image?: string;
  rarity?: string;
  hp?: number;
  illustrator?: string;
  category?: string;
  types?: string[];
  set?: { id: string; name: string };
}

export interface TcgdexMatch {
  id: string;
  name: string;
  localId: string;
  setName: string | null;
  setCode: string | null;
  rarity: string | null;
  hp: number | null;
  illustrator: string | null;
  /** Categoria + tipos ("Pokémon · Fogo"), pronto para o campo "tipo da carta". */
  cardType: string | null;
  /** Já resolvida para alta resolução — pronta para remotePatterns do next/image. */
  imageUrl: string | null;
}

/** O suficiente para desenhar a grade de escolha: arte, nome e número. */
export interface TcgdexSuggestion {
  id: string;
  name: string;
  localId: string;
  imageUrl: string | null;
}

/** O card object da TCGdex devolve a imagem sem sufixo; qualidade/formato são anexados aqui. */
function resolveImageUrl(base?: string): string | null {
  return base ? `${base}/high.webp` : null;
}

function toMatch(card: TcgdexCardFull): TcgdexMatch {
  const cardType = [card.category, card.types?.join(' / ')].filter(Boolean).join(' · ');

  return {
    id: card.id,
    name: card.name,
    localId: card.localId,
    setName: card.set?.name ?? null,
    setCode: card.set?.id?.toUpperCase() ?? null,
    rarity: card.rarity ?? null,
    hp: card.hp ?? null,
    illustrator: card.illustrator ?? null,
    cardType: cardType || null,
    imageUrl: resolveImageUrl(card.image),
  };
}

/** O campo "número" do cadastro é exibido como "223/197"; a API só quer o "223". */
export function parseLocalId(cardNumber: string): string {
  return cardNumber.split('/')[0]?.trim() ?? cardNumber.trim();
}

async function getJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.warn('[tcgdex] requisição falhou', path, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Busca uma carta por nome + número local, desambiguando por nome da coleção
 * quando o nome sozinho aparece em mais de um set. Retorna o melhor palpite;
 * quem chama decide se a confiança é suficiente (ex.: exibir para conferência
 * antes do cadastro, nunca cadastrar "no escuro").
 */
export async function lookupTcgdexCard(params: {
  name: string;
  localId: string;
  setName?: string;
}): Promise<TcgdexMatch | null> {
  const query = new URLSearchParams({ name: params.name, localId: params.localId });
  const briefs = await getJson<TcgdexCardBrief[]>(`/cards?${query.toString()}`);
  if (!briefs?.length) return null;

  // Resultado único: não há o que desambiguar.
  if (briefs.length === 1) {
    const full = await getJson<TcgdexCardFull>(`/cards/${briefs[0]!.id}`);
    return full ? toMatch(full) : null;
  }

  // Mais de um: busca o detalhe de cada candidato (lista já é pequena, filtrada
  // por nome + número) e escolhe pelo nome da coleção informado no cadastro.
  const candidates = (
    await Promise.all(
      briefs.slice(0, 8).map((brief) => getJson<TcgdexCardFull>(`/cards/${brief.id}`)),
    )
  ).filter((card): card is TcgdexCardFull => Boolean(card));

  if (!candidates.length) return null;
  if (!params.setName) return toMatch(candidates[0]!);

  const target = normalize(params.setName);
  const bySet = candidates.find(
    (card) => card.set?.name && normalize(card.set.name).includes(target),
  );
  return toMatch(bySet ?? candidates[0]!);
}

/**
 * Lista cartas por nome para o operador escolher visualmente no cadastro.
 *
 * Devolve só o resumo (arte, nome, número) de propósito: a grade mostra
 * dezenas de cartas e buscar o detalhe de cada uma seriam dezenas de
 * requisições para dados que só interessam depois da escolha. O detalhe
 * completo vem em `getTcgdexCard`, uma requisição só, ao selecionar.
 */
export async function searchTcgdexCards(name: string, limit = 36): Promise<TcgdexSuggestion[]> {
  const query = new URLSearchParams({ name });
  const briefs = await getJson<TcgdexCardBrief[]>(`/cards?${query.toString()}`);
  if (!briefs?.length) return [];

  return briefs.slice(0, limit).map((brief) => ({
    id: brief.id,
    name: brief.name,
    localId: brief.localId,
    imageUrl: resolveImageUrl(brief.image),
  }));
}

/** Detalhe completo da carta escolhida na grade. */
export async function getTcgdexCard(id: string): Promise<TcgdexMatch | null> {
  const full = await getJson<TcgdexCardFull>(`/cards/${encodeURIComponent(id)}`);
  return full ? toMatch(full) : null;
}
