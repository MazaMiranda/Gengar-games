# Gengar Games

E-commerce premium de **Pokémon TCG**, consoles, jogos, acessórios e colecionáveis.
Identidade visual própria — preto absoluto, roxo neon, vidro e iluminação — construída sobre
Next.js 15, React 19 e TypeScript.

```bash
npm install
cp .env.example .env.local
npm run dev
```

A loja sobe em `http://localhost:3000` **sem precisar de banco de dados**: sem `DATABASE_URL`, o
catálogo seed (79 produtos reais) é servido pelos repositórios em memória.

### Contas de demonstração

| Perfil        | E-mail                        | Senha        |
| ------------- | ----------------------------- | ------------ |
| Cliente       | `cliente@gengargames.com.br`  | `gengar123`  |
| Administrador | `admin@gengargames.com.br`    | `gengar123`  |

---

## Stack

| Camada        | Tecnologia                                                        |
| ------------- | ----------------------------------------------------------------- |
| Framework     | Next.js 15 (App Router, Server Components), React 19, TypeScript 5 |
| Estilo        | TailwindCSS v4 (`@theme`), design system próprio                   |
| Componentes   | Radix UI + CVA no padrão shadcn/ui                                 |
| Movimento     | Framer Motion                                                      |
| Ícones        | Lucide                                                             |
| Estado        | Zustand (carrinho, wishlist) · TanStack Query (dados remotos)      |
| Formulários   | React Hook Form + Zod                                              |
| Dados         | Prisma + PostgreSQL (com fallback em memória)                      |
| Autenticação  | Auth.js v5 (credenciais + bcrypt, sessão JWT)                      |
| Pagamentos    | Stripe PaymentIntents (modo simulação sem chave)                   |
| Qualidade     | ESLint 9 (flat config) + Prettier                                  |

---

## Arquitetura

Clean Architecture: o domínio não conhece framework, banco nem UI.

```
src/
├─ core/
│  ├─ domain/          entidades, taxonomias — TypeScript puro, zero dependências
│  ├─ ports/           contratos de repositório (interfaces)
│  └─ application/     casos de uso: catálogo, carrinho, pedidos, admin
├─ infrastructure/
│  ├─ data/            catálogo seed (fonte única, usada em memória e no seed do Prisma)
│  ├─ repositories/    implementações in-memory e Prisma do mesmo contrato
│  ├─ payments/        adaptador Stripe
│  ├─ db/              cliente Prisma singleton
│  └─ container.ts     resolução de dependências (Prisma quando há DATABASE_URL)
├─ app/                rotas (App Router)
├─ components/         design system + blocos de UI por contexto
├─ hooks/ stores/ lib/ estado de cliente e utilitários
```

**Regra que sustenta a troca de persistência:** o motor de consulta do catálogo
(`core/application/catalog-query.ts`) opera sobre entidades de domínio, então filtro, ordenação,
paginação e facetas são idênticos com ou sem banco.

---

## Design System

Tudo vive em `src/app/globals.css`, na camada `@theme`. Nenhum valor cromático é escrito à mão
fora dela.

**Paleta**

| Token             | Valor     | Uso                        |
| ----------------- | --------- | -------------------------- |
| `--color-void`    | `#09090B` | fundo da aplicação         |
| `--color-surface` | `#111114` | cards e superfícies        |
| `--color-elevated`| `#18181B` | camadas acima do card      |
| `--color-brand-600` | `#6D28D9` | roxo primário            |
| `--color-brand-500` | `#9333EA` | glow                     |
| `--color-brand-400` | `#A855F7` | hover                    |
| `--color-brand-300` | `#C084FC` | destaques                |
| `--color-ink`     | `#FFFFFF` | texto principal            |
| `--color-ink-muted` | `#A1A1AA` | texto secundário         |

**Tipografia** — três famílias com papéis distintos:
`Sora` (display), `Manrope` (interface) e `Chakra Petch` (rótulos técnicos, preços e HUD).

**Utilitários de marca** (`@utility`): `glass`, `plate`, `notch`, `grain`, `holo`, `sweep`,
`grid-tech`, `scanlines`, `eyebrow`, `mask-fade-x`, `text-gradient-brand`.

O `holo` é a assinatura da casa: um brilho holográfico que segue o ponteiro através das variáveis
`--mx`/`--my`, aplicado a cartas e galerias — a mesma física de uma carta foil real.

**Componentes** — `src/components/ui`: Button, Badge, Chip/ToggleChip, Surface, Input/Field,
Textarea, Label, Select, Checkbox, RadioGroup, Switch, Slider, Separator, QuantityStepper, Dialog,
Drawer, Accordion, Tabs, Tooltip, Skeleton, Rating, Price, Section, Reveal/Stagger/Marquee, Toast
(Sonner).

---

## Funcionalidades

**Loja**
- Home com hero em parallax, bento de categorias, trilhos, banner promocional, depoimentos e newsletter
- Catálogo com facetas disjuntivas (contadores respeitam os demais filtros), faixa de preço, ordenação, densidade e paginação — tudo na URL
- Busca instantânea com atalho `⌘K` / `Ctrl+K`
- Página de produto: galeria com zoom, buy box, cálculo de frete, abas de descrição/especificações/avaliações/perguntas e histórico de preço em SVG
- Página de carta com ficha completa: coleção, número, raridade, idioma, tipo, HP, ilustrador e estado
- Áreas dedicadas de TCG (Pokémon) e Gamer (5 plataformas)
- Cadastro de cartas busca a arte real na [TCGdex](https://tcgdex.dev/pt-br) por nome e número — sem correspondência, a arte procedural da loja assume
- Carrinho em drawer com cupom, frete, recomendações e "salvar para depois"
- Checkout em 4 etapas com máscaras, validação Zod e revisão

**Conta** — visão geral, pedidos com linha do tempo, favoritos, endereços, cupons e configurações.

**Painel administrativo** — dashboard com faturamento, pedidos (com troca de status), estoque,
produtos, categorias, TCGs, consoles, usuários, cupons, promoções e relatórios.

---

## Segurança do checkout

O carrinho do cliente nunca é fonte de verdade. Ao finalizar, o servidor:

1. Recarrega cada produto pelo slug e usa o **preço do catálogo**, não o enviado;
2. Revalida o **estoque** disponível de cada item;
3. Reavalia o **cupom** (validade, limite de uso, subtotal mínimo) e recalcula o desconto;
4. Só então cria o pedido e a intenção de pagamento.

---

## Banco de dados (opcional)

```bash
# .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gengar_games?schema=public"

npm run db:push    # cria o schema
npm run db:seed    # popula com o mesmo catálogo do modo em memória
```

Com a variável presente, o container passa a resolver os repositórios Prisma automaticamente —
nenhuma linha de UI muda.

## Stripe (opcional)

Sem `STRIPE_SECRET_KEY`, o checkout roda em modo simulação e cria o pedido normalmente. Com a
chave, `infrastructure/payments/stripe.ts` cria um PaymentIntent real e devolve o `client_secret`
para o front confirmar.

---

## Scripts

| Comando              | Descrição                                |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | ambiente de desenvolvimento              |
| `npm run build`      | build de produção                        |
| `npm start`          | servidor de produção                     |
| `npm run typecheck`  | TypeScript sem emissão                   |
| `npm run lint`       | ESLint                                   |
| `npm run format`     | Prettier                                 |
| `npm run db:push`    | aplica o schema no PostgreSQL            |
| `npm run db:seed`    | popula o banco                           |
| `npm run db:studio`  | Prisma Studio                            |

---

## Imagens de produto

O catálogo carrega `media[].src` para fotografia real e o componente `ProductVisual` renderiza
automaticamente `next/image` quando ela existe. Enquanto não há fotos, a arte é gerada por
composição (gradiente derivado do matiz do produto + glifo da categoria + moldura de carta),
determinística por slug — nunca um retângulo cinza. Basta preencher `src` no catálogo ou no banco
para as fotos entrarem no lugar.

`next.config.ts` já traz `remotePatterns`, AVIF/WebP e `deviceSizes` configurados.
