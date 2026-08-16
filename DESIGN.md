---
name: Gengar Games
description: Loja premium de Pokémon TCG, consoles e colecionáveis — a carta reagindo à luz como um foil puxado do booster.
colors:
  circuit-black: "#09090B"
  panel-black: "#111114"
  deck-black: "#18181B"
  hud-overlay: "#202024"
  brand-violet: "#6D28D9"
  brand-violet-glow: "#9333EA"
  brand-violet-hover: "#A855F7"
  brand-violet-bright: "#C084FC"
  brand-violet-deep: "#5B21B6"
  foil-magenta: "#E8399C"
  foil-gold: "#E8B23F"
  foil-cyan: "#4DD8F0"
  label: "#F0EBE2"
  label-ink: "#18181B"
  ink: "#FFFFFF"
  ink-muted: "#B1B1B9"
  ink-faint: "#9A9AA1"
  ink-ghost: "#888894"
  signal-green: "#34D399"
  signal-amber: "#FBBF24"
  signal-red: "#FB7185"
  signal-cyan: "#38BDF8"
  danger-solid: "#E11D48"
  danger-solid-deep: "#9F1239"
  rarity-common: "#A1A1AA"
  rarity-uncommon: "#34D399"
  rarity-rare: "#38BDF8"
  rarity-ultra: "#C084FC"
  rarity-secret: "#FBBF24"
typography:
  display:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Chakra Petch, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.16em"
rounded:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  2xl: "1.75rem"
  3xl: "2.25rem"
spacing:
  gutter: "1.25rem"
components:
  button-primary:
    backgroundColor: "linear-gradient(100deg, {colors.brand-violet-hover}, {colors.foil-magenta}, {colors.foil-gold}, {colors.foil-cyan})"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 1.5rem"
    height: "3rem"
  button-secondary:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 1.5rem"
    height: "3rem"
  cert-label:
    backgroundColor: "{colors.label}"
    textColor: "{colors.label-ink}"
    rounded: "{rounded.xs}"
    padding: "0.375rem 0.875rem"
    height: "auto"
  badge-brand:
    backgroundColor: "rgba(147,51,234,0.15)"
    textColor: "{colors.brand-violet-bright}"
    rounded: "{rounded.sm}"
    padding: "0 0.5rem"
    height: "1.5rem"
  chip-selected:
    backgroundColor: "rgba(168,85,247,0.18)"
    textColor: "{colors.brand-violet-bright}"
    rounded: "{rounded.sm}"
    padding: "0 0.875rem"
    height: "2.75rem"
  input-default:
    backgroundColor: "rgba(255,255,255,0.03)"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "3rem"
---

# Design System: Gengar Games

<!-- IMPECCABLE DIRECTION CONTRACT (ver src/app/layout.tsx para o registro auditável) — Foil sob a Luz, seed key 025e12ca, escolhida na página de decisão em vez de sorteio silencioso. -->

## Overview

**Creative North Star: "Foil sob a Luz"**

O momento de puxar uma secret rare e inclinar a carta sob a luz — a superfície reage, não brilha parada. Substitui o mundo anterior ("Neon Arcade Noir"): o preto absoluto e o roxo de marca são fatos preservados (compromisso de marca confirmado em PRODUCT.md), mas a leitura deixou de ser HUD de arcade gamer e passou a ser a física de difração de um foil real — violeta, magenta, dourado e ciano varrendo a superfície quando algo é tocado, nunca um glow estático.

O `holo` — já a assinatura da casa antes, restrito às cartas — agora é o mecanismo de toque do site inteiro: botão primário, sublinhado do hero, atmosfera de fundo. Onde a página precisava de peso técnico acima de um título, isso virou `cert-label`, uma faixa impressa (estilo tarja de slab de grading) com informação real, anexada ao conteúdo — nunca mais um kicker decorativo solto acima de heading, que o craft floor bane sem exceção.

**Key Characteristics:**
- Preto absoluto como chão; a banda de foil (violeta→magenta→dourado→ciano) varre superfícies no toque, nunca um glow parado.
- `holo` é o mecanismo de toque do site — não só um easter egg de card.
- Nenhum kicker/eyebrow decorativo acima de heading — informação real vira `cert-label` anexado ao conteúdo, nunca uma linha antes do título.
- Vidro só em camadas flutuantes (herdado, ainda vale); superfícies de repouso continuam `plate`.
- Escada de raridade fixa (herdada do mundo anterior, disciplina que sobrevive à troca).
- Tema claro e escuro tokenizados via `--t-*`; `cert-label` é a única superfície fixa nos dois temas (um selo impresso não inverte).

## Colors

Quase monocromática — preto e a rampa de texto carregam a superfície inteira. A violeta permanece o acento de marca (compromisso preservado); magenta/dourado/ciano são companheiras de difração, nunca substitutas, e só aparecem juntas na banda de foil, nunca soltas.

### Primary
- **Brand Violet** (`#6D28D9`): base do botão secundário, foco forte, links — o acento de marca em repouso.
- **Brand Violet Glow** (`#9333EA`): primeira parada da banda de foil, `::selection`.
- **Brand Violet Hover / Bright** (`#A855F7` / `#C084FC`): destaques, badge/chip selecionado, raridade Ultra.
- **Brand Violet Deep** (`#5B21B6`): ponto mais escuro da rampa viva.

### Secondary — Foil (difração)
- **Foil Magenta** (`#E8399C`), **Foil Gold** (`#E8B23F`), **Foil Cyan** (`#4DD8F0`): banda prismática de `--gradient-foil-sweep`, usada em `holo`, botão primário e atmosfera (`Aurora`). Nunca cor sólida de fundo — só varredura.

### Tertiary — Escada de Raridade
- **Common** (`#A1A1AA`), **Uncommon** (`#34D399`), **Rare** (`#38BDF8`), **Ultra** (`#C084FC`), **Secret** (`#FBBF24`): herdada do mundo anterior — continua fixa e sem ambiguidade.

### Neutral
- **Circuit/Panel/Deck Black + HUD Overlay**: `#09090B` / `#111114` / `#18181B` / `#202024` — fundo, card, camada acima do card, overlay/hover.
- **Ink / Ink Muted / Ink Faint / Ink Ghost**: rampa de texto, 15,3:1 → 4,6:1 sobre HUD Overlay.
- **Label / Label Ink** (`#F0EBE2` / `#18181B`): cartolina de cert-label — fixa nos dois temas, como um selo impresso de verdade.

### Named Rules
**The Sweep, Not Glow Rule.** Foil é varredura em resposta a toque/hover, nunca uma superfície ou glow em repouso. Se algo brilha parado, não é foil — é o mundo antigo vazando.

**The Fixed Rarity Ladder Rule.** As cinco cores de raridade nunca mudam de papel entre temas ou contextos.

## Typography

**Display Font:** Sora. **Body Font:** Manrope. **Label/Mono Font:** Chakra Petch — sem mudança de família (compromisso de marca preservado); o que muda é o papel do rótulo técnico, agora carregado por `cert-label` em vez de `eyebrow` solto.

### Hierarchy
- **Display / Headline / Title**: Sora 700, ver frontmatter para clamp/lh/tracking exatos.
- **Body**: Manrope 500, 1rem, lh 1.6.
- **Label**: Chakra Petch 600, 0.6875rem, tracking 0.16em, uppercase — vive dentro do `cert-label`, nunca mais solto acima de heading.

### Named Rules
**The No Kicker Rule.** Nenhum rótulo decorativo acima de título — banido pelo craft floor sem exceção de brief. Quando há informação real (número do drop, status), ela vira `cert-label` anexado ao conteúdo (ao lado do título, preso na vitrine, etc.), nunca uma linha antes do heading.

**The No-Mixing Rule.** Chakra Petch nunca carrega frase corrida.

## Layout

Sem mudança: `container-page` (88rem, gutter responsivo 1.25→2→3rem), densidade alta em catálogo/admin/conta. `Aurora` deixou de ser nebulosa violeta parada e passou a ser duas faixas diagonais de luz prismática varrendo lento (`linear-gradient` + `animate-drift`, ainda sem `filter: blur()` por custo de composição).

## Elevation & Depth

Sem mudança de filosofia: `plate` em repouso, `glass`/`glass-solid` só em camadas flutuantes (Overlay-Only Glass Rule, herdada e ainda válida), `lift` no hover interativo.

### Named Rules
**The Overlay-Only Glass Rule.** (herdada) Vidro só em dialog/drawer/select/disclosure/header ao rolar.

## Shapes

Sem mudança: escala de raio de sete degraus, `notch`/`notch-sm` como corte de canto assinatura.

## Components

### Buttons
- **Primary:** `--gradient-foil-sweep` (violeta→magenta→dourado→ciano) deslizando de 0% a 100% no hover, em vez do degradê só-violeta anterior; `sweep` (feixe branco) continua por cima; `active:scale-[0.98]` mantido.
- **Secondary / Outline / Ghost / Link / Danger:** sem mudança de mecânica, só herdam a paleta atualizada.

### Cert-Label (novo, assinatura)
Faixa impressa — cartolina fixa nos dois temas, régua fina no topo/base, tique técnico nos cantos, tipografia Chakra Petch. Carrega informação real (número de drop, "acessar conta", nome de categoria) anexada ao conteúdo que descreve. Substitui todo uso de `eyebrow` como kicker acima de heading em `SectionHeading`, `PageHeader` e os cabeçalhos de autenticação; `eyebrow` (a classe CSS) continua existindo só para rótulo de dado inline (ex.: "Total a pagar" num resumo de checkout), que não é o padrão banido.

### Holo (assinatura, promovida)
Antes restrito a card de carta; a banda de difração agora tem 5 paradas (branco→magenta→violeta→dourado→ciano) em vez de 3, e é o mecanismo de toque de: card de produto, botão primário (via `--gradient-foil-sweep`), sublinhado do H1 do hero.

### Badges / Chips / Cards / Inputs
Sem mudança de mecânica — herdam a paleta e o `cert-label` onde antes usavam `eyebrow` como kicker.

## Do's and Don'ts

### Do:
- **Do** tratar foil como resposta a toque/hover — nunca um glow ou superfície em repouso (Sweep, Not Glow Rule).
- **Do** usar `cert-label` para informação real anexada ao conteúdo; nunca um kicker decorativo acima de heading (No Kicker Rule).
- **Do** manter a escada de raridade fixa e o roxo de marca como acento raro, não fundo.
- **Do** preservar vidro só em overlay (Overlay-Only Glass Rule) e `plate` como repouso.

### Don't:
- **Don't** reintroduzir um kicker/eyebrow solto acima de título — banido, sem exceção de brief.
- **Don't** deixar a banda de foil parada como decoração; ela existe pra reagir.
- **Don't** aproximar o visual de dashboard SaaS genérico.
- **Don't** escrever cor hex direto fora de `@theme`/token.
