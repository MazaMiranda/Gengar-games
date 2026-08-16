# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Duas audiências com peso igual, sem prioridade declarada entre elas:

- **Colecionadores/investidores**: compram cartas avulsas de alto valor, buscam autenticidade e estado de conservação confiável.
- **Gamers**: compram selados jogáveis, consoles (5 plataformas), jogos e acessórios.

Job comum: comprar produto real e com preço/estoque confiáveis, com opção de retirar pessoalmente na loja em Belo Horizonte ou receber por frete rastreado.

## Product Purpose

E-commerce premium de Pokémon TCG, consoles, jogos, acessórios e colecionáveis. Sucesso é a transação de ticket alto concluída com confiança: item chega como anunciado, cobrança bate com o catálogo, prazo é cumprido.

## Positioning

Três frentes que uma loja de bairro ou marketplace genérico não replicam:

- **Loja física em Belo Horizonte**: endereço real, retirada no mesmo dia (até 4h úteis), atendimento humano por WhatsApp com resposta em até 15 min no horário comercial.
- **Identidade visual premium**: preto absoluto + roxo neon + vidro/iluminação, experiência editorial — não catálogo genérico.
- **Segurança do checkout**: servidor sempre revalida preço (pelo slug, não pelo valor enviado), estoque e cupom antes de criar pedido; dado de cartão nunca é armazenado.

## Operating Context

- Navegação: home com hero/bento/trilhos, catálogo com facetas disjuntivas e busca instantânea (`⌘K`/`Ctrl+K`), página de produto com zoom/frete/abas, página de carta com ficha completa (coleção, número, raridade, HP, ilustrador, estado).
- Carrinho em drawer (cupom, frete, "salvar para depois") → checkout em 4 etapas.
- Conta: pedidos com linha do tempo, favoritos, endereços, cupons, configurações.
- Admin: faturamento, pedidos (status), estoque, produtos, categorias, TCGs, consoles, usuários, cupons, promoções, relatórios.
- Atendimento: seg–sex 9h–19h, sáb 10h–16h. Envio via Correios ou transportadora própria (Gengar Express/Loggi) na região metropolitana de BH; frete grátis acima de R$ 299.

## Capabilities and Constraints

- Roda sem banco: repositórios em memória servem os 79 produtos seed. Com `DATABASE_URL`, o mesmo contrato passa a resolver via Prisma/Postgres — a UI não muda (`core/application/catalog-query.ts` é a fonte única de filtro/ordenação/paginação/facetas).
- Stripe opcional: sem `STRIPE_SECRET_KEY`, checkout roda em modo simulação e ainda cria pedido normalmente.
- Auth.js (credenciais + bcrypt, sessão JWT), papéis `admin` e `customer`.
- Checkout nunca confia no carrinho do cliente: servidor recarrega produto pelo slug, revalida estoque, reavalia cupom, só então cria pedido/PaymentIntent.
- Terminologia de estado de carta (curadoria própria, não é grading de terceiro): M (Mint), NM (Near Mint), SP (Slightly Played), MP (Moderately Played) — inspeção sob luz branca e UV.
- Restrição durável: trabalho futuro não deve inventar estoque, preço, depoimento, case ou benchmark além do que já existe no catálogo seed/dados institucionais.

## Brand Commitments

- Razão social Gengar Games LTDA, CNPJ 48.221.905/0001-32.
- Identidade visual já incumbente (fora do escopo de `init`, documentada em `src/app/globals.css`): preto absoluto, roxo neon, vidro, iluminação; tipografia Sora (display) / Manrope (interface) / Chakra Petch (rótulos técnicos); efeito `holo` como assinatura da casa.
- Ativos: `public/logo.png`, `src/app/icon.png`, `apple-icon.png`, `opengraph-image.png`.

## Evidence on Hand

- Catálogo seed: 79 produtos reais (cartas TCG, selados, consoles, jogos, acessórios, colecionáveis) em `src/infrastructure/data`.
- Contas de demonstração com histórico real de pedidos: admin (Marcos Zaya) e cliente (Ana Beatriz Lopes) — `src/infrastructure/data/accounts.ts`.
- Loja física: Avenida Senador Levindo Coelho, 1990, BOX 15 — Vale do Jatobá, Belo Horizonte/MG (`src/lib/loja.ts`, fonte única do endereço).
- Contato: WhatsApp `+55 31 8514-4153`, `contato@gengargames.com.br`, `trocas@gengargames.com.br`, `privacidade@gengargames.com.br`.
- Integração TCGdex (tcgdex.dev/pt-br): busca arte real da carta por nome/número no cadastro; sem correspondência, arte procedural determinística por slug assume — nunca retângulo cinza.
- Ausência a preservar: nenhum depoimento, case, imprensa ou benchmark além do que está no seed/páginas institucionais — não fabricar.

## Product Principles

1. Carrinho do cliente nunca é fonte de verdade — servidor sempre re-deriva preço/estoque/cupom do catálogo no checkout.
2. Fotografia real vence quando existe; arte procedural é fallback determinístico, nunca placeholder cinza.
3. Loja física (BH) e loja digital são uma verdade só — mesmo endereço, mesma linguagem de estoque, sem divergência.
4. Alegação de estado/autenticidade de carta segue o padrão de inspeção declarado (luz UV, escala M/NM/SP/MP) — nunca afirmada sem ele.
5. Troca de persistência (memória ↔ Postgres) nunca muda UI ou comportamento — domínio é agnóstico a framework e banco.

## Accessibility & Inclusion

Piso de higiene padrão WCAG AA. Nenhuma exigência formal adicional registrada.
