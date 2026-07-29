import type {
  CardGrade,
  CardRarity,
  GamingPlatform,
  ProductCondition,
  ProductType,
  TcgGame,
} from './entities';

/** Metadados de apresentação das taxonomias — fonte única para filtros, chips e páginas. */

export const TCG_GAMES: Record<
  TcgGame,
  { name: string; short: string; accent: number; publisher: string; tagline: string }
> = {
  pokemon: {
    name: 'Pokémon TCG',
    short: 'Pokémon',
    accent: 48,
    publisher: 'The Pokémon Company',
    tagline: 'Do Base Set às coleções Scarlet & Violet.',
  },
  'one-piece': {
    name: 'One Piece Card Game',
    short: 'One Piece',
    accent: 8,
    publisher: 'Bandai',
    tagline: 'Líderes, don!! e as artes alternativas mais disputadas.',
  },
  magic: {
    name: 'Magic: The Gathering',
    short: 'Magic',
    accent: 265,
    publisher: 'Wizards of the Coast',
    tagline: 'Do Commander ao Modern, singles e boosters selados.',
  },
  yugioh: {
    name: 'Yu-Gi-Oh!',
    short: 'Yu-Gi-Oh!',
    accent: 28,
    publisher: 'Konami',
    tagline: 'Structure decks, tins e as staples do meta atual.',
  },
  lorcana: {
    name: 'Disney Lorcana',
    short: 'Lorcana',
    accent: 190,
    publisher: 'Ravensburger',
    tagline: 'Enchanted, foils e capítulos completos.',
  },
  'flesh-and-blood': {
    name: 'Flesh and Blood',
    short: 'Flesh & Blood',
    accent: 350,
    publisher: 'Legend Story Studios',
    tagline: 'Heróis, armas lendárias e blitz decks.',
  },
  digimon: {
    name: 'Digimon Card Game',
    short: 'Digimon',
    accent: 205,
    publisher: 'Bandai',
    tagline: 'Evoluções, secret rares e starter decks.',
  },
};

export const PLATFORMS: Record<
  GamingPlatform,
  { name: string; short: string; accent: number; tagline: string }
> = {
  playstation: {
    name: 'PlayStation',
    short: 'PS',
    accent: 214,
    tagline: 'PS5, PS5 Pro, DualSense e exclusivos.',
  },
  xbox: { name: 'Xbox', short: 'Xbox', accent: 140, tagline: 'Series X|S, controles e Game Pass.' },
  nintendo: {
    name: 'Nintendo',
    short: 'Nintendo',
    accent: 355,
    tagline: 'Switch, OLED, amiibo e first-party.',
  },
  pc: { name: 'PC Gamer', short: 'PC', accent: 275, tagline: 'Periféricos, headsets e setup.' },
  retro: {
    name: 'Retro',
    short: 'Retro',
    accent: 32,
    tagline: 'Clássicos, cartuchos e consoles restaurados.',
  },
};

export const CONDITIONS: Record<ProductCondition, { name: string; description: string }> = {
  lacrado: { name: 'Lacrado', description: 'Produto novo, lacre de fábrica intacto.' },
  novo: { name: 'Novo', description: 'Sem uso, embalagem aberta apenas para conferência.' },
  seminovo: { name: 'Seminovo', description: 'Pouco uso, revisado e higienizado pela Gengar.' },
  usado: { name: 'Usado', description: 'Funcionamento testado, marcas de uso descritas no anúncio.' },
};

/**
 * Conservação da carta. A sigla é o rótulo curto que o colecionador reconhece;
 * o nome por extenso e a descrição existem para quem não conhece a escala.
 */
export const CARD_GRADES: Record<CardGrade, { name: string; description: string }> = {
  NM: { name: 'Near Mint', description: 'Praticamente perfeita, sem marcas visíveis.' },
  SP: { name: 'Slightly Played', description: 'Marcas mínimas de manuseio nas bordas.' },
  MP: { name: 'Moderately Played', description: 'Desgaste visível em bordas ou superfície.' },
  D: { name: 'Damaged', description: 'Dano estrutural: vinco, rasgo ou perda de camada.' },
};

/** Ordem da escala — do melhor estado ao pior, para listas e seletores. */
export const cardGradeList = (Object.keys(CARD_GRADES) as CardGrade[]).map((code) => ({
  code,
  ...CARD_GRADES[code],
}));

export const RARITIES: Record<CardRarity, { name: string; token: string }> = {
  comum: { name: 'Comum', token: 'rarity-common' },
  incomum: { name: 'Incomum', token: 'rarity-uncommon' },
  rara: { name: 'Rara', token: 'rarity-rare' },
  'ultra-rara': { name: 'Ultra Rara', token: 'rarity-ultra' },
  secreta: { name: 'Secreta', token: 'rarity-secret' },
};

export const PRODUCT_TYPES: Record<ProductType, string> = {
  'tcg-card': 'Carta avulsa',
  'tcg-sealed': 'Produto selado',
  console: 'Console',
  game: 'Jogo',
  accessory: 'Acessório',
  collectible: 'Colecionável',
};

export const tcgGameList = Object.entries(TCG_GAMES).map(([slug, meta]) => ({
  slug: slug as TcgGame,
  ...meta,
}));

export const platformList = Object.entries(PLATFORMS).map(([slug, meta]) => ({
  slug: slug as GamingPlatform,
  ...meta,
}));
