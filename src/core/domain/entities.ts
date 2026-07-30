/**
 * Camada de domínio — sem dependência de framework, banco ou UI.
 * Valores monetários são sempre inteiros em centavos.
 */

export type Money = number;

export type ProductType = 'tcg-card' | 'tcg-sealed' | 'console' | 'game' | 'accessory' | 'collectible';

// A loja vende só Pokémon TCG — é também o único jogo coberto pela TCGdex
// (https://tcgdex.dev/pt-br), fonte da arte das cartas cadastradas.
export type TcgGame = 'pokemon';

export type GamingPlatform = 'playstation' | 'xbox' | 'nintendo' | 'pc' | 'retro';

export type ProductCondition = 'lacrado' | 'novo' | 'seminovo' | 'usado';

export type CardRarity = 'comum' | 'incomum' | 'rara' | 'ultra-rara' | 'secreta';

/** Escala de conservação da carta, na sigla que o mercado de TCG usa. */
export type CardGrade = 'NM' | 'SP' | 'MP' | 'D';

export type CardLanguage = 'português' | 'inglês' | 'japonês';

export type CategoryKind = 'tcg' | 'gaming' | 'collectible' | 'accessory';

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  kind: CategoryKind;
  accent: number;
  glyph: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  origin: string;
}

export interface MediaItem {
  id: string;
  kind: 'art' | 'image' | 'video';
  label: string;
  src?: string;
  poster?: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface CardAttributes {
  game: TcgGame;
  set: string;
  setCode: string;
  number: string;
  rarity: CardRarity;
  language: CardLanguage;
  cardType: string;
  hp?: number;
  illustrator: string;
  foil: boolean;
  grade: CardGrade;
}

export interface ConsoleAttributes {
  platform: GamingPlatform;
  generation: string;
  storage: string;
  edition: string;
  includes: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  type: ProductType;
  categorySlug: string;
  brandSlug: string;
  price: Money;
  compareAtPrice: Money | null;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  condition: ProductCondition;
  platform?: GamingPlatform;
  tcg?: TcgGame;
  accent: number;
  description: string;
  highlights: string[];
  specs: SpecItem[];
  media: MediaItem[];
  tags: string[];
  releasedAt: string;
  featured: boolean;
  preOrder: boolean;
  card?: CardAttributes;
  console?: ConsoleAttributes;
  relatedSlugs: string[];
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
}

export interface Question {
  id: string;
  productSlug: string;
  author: string;
  question: string;
  answer: string | null;
  createdAt: string;
}

export interface PricePoint {
  date: string;
  price: Money;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export type CouponType = 'percent' | 'fixed' | 'shipping';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minSubtotal: Money;
  description: string;
  expiresAt: string;
  active: boolean;
  usageCount: number;
  usageLimit: number;
}

export type OrderStatus =
  | 'aguardando-pagamento'
  | 'pago'
  | 'separando'
  | 'enviado'
  | 'entregue'
  | 'cancelado';

export interface OrderItem {
  productSlug: string;
  name: string;
  unitPrice: Money;
  quantity: number;
  accent: number;
  type: ProductType;
}

export interface Order {
  id: string;
  number: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: Money;
  discount: Money;
  shipping: Money;
  total: Money;
  couponCode: string | null;
  paymentMethod: string;
  installments: number;
  address: Address;
  createdAt: string;
  trackingCode: string | null;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
  document?: string;
  addresses: Address[];
  wishlist: string[];
  coupons: string[];
  loyaltyPoints: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  price: Money;
  etaDays: [number, number];
}

export interface Testimonial {
  id: string;
  author: string;
  handle: string;
  city: string;
  rating: number;
  quote: string;
  purchase: string;
}
