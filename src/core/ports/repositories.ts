import type {
  Brand,
  CardGrade,
  CardLanguage,
  CardRarity,
  Category,
  Coupon,
  GamingPlatform,
  Order,
  OrderStatus,
  PricePoint,
  Product,
  ProductCondition,
  ProductType,
  Question,
  Review,
  TcgGame,
  User,
} from '../domain/entities';

export type CatalogSort =
  | 'relevancia'
  | 'menor-preco'
  | 'maior-preco'
  | 'lancamentos'
  | 'mais-vendidos'
  | 'avaliacao';

export interface CatalogQuery {
  search?: string;
  categories?: string[];
  brands?: string[];
  platforms?: GamingPlatform[];
  tcgs?: TcgGame[];
  sets?: string[];
  rarities?: CardRarity[];
  languages?: CardLanguage[];
  grades?: CardGrade[];
  conditions?: ProductCondition[];
  types?: ProductType[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  sort?: CatalogSort;
  page?: number;
  perPage?: number;
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
}

export interface CatalogFacets {
  categories: FacetBucket[];
  brands: FacetBucket[];
  platforms: FacetBucket[];
  tcgs: FacetBucket[];
  sets: FacetBucket[];
  rarities: FacetBucket[];
  languages: FacetBucket[];
  grades: FacetBucket[];
  conditions: FacetBucket[];
  types: FacetBucket[];
  priceRange: { min: number; max: number };
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  facets: CatalogFacets;
}

export interface ProductRepository {
  search(query: CatalogQuery): Promise<CatalogResult>;
  findBySlug(slug: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  findManyBySlugs(slugs: string[]): Promise<Product[]>;
  listCategories(): Promise<Category[]>;
  listBrands(): Promise<Brand[]>;
  reviewsFor(slug: string): Promise<Review[]>;
  questionsFor(slug: string): Promise<Question[]>;
  priceHistoryFor(slug: string): Promise<PricePoint[]>;
  countAll(): Promise<number>;
}

export interface OrderRepository {
  listByUser(userId: string): Promise<Order[]>;
  findByNumber(numberOrId: string): Promise<Order | null>;
  listAll(): Promise<Order[]>;
  create(order: Order): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  listAll(): Promise<User[]>;
}

export interface CouponRepository {
  findByCode(code: string): Promise<Coupon | null>;
  listAll(): Promise<Coupon[]>;
}

export interface Repositories {
  products: ProductRepository;
  orders: OrderRepository;
  users: UserRepository;
  coupons: CouponRepository;
}

export type { ProductType };
