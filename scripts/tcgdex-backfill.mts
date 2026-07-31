/**
 * Preenche as artes reais das cartas do catálogo a partir da TCGdex.
 *
 *   npm run tcgdex:backfill          # só cartas ainda sem arte
 *   npm run tcgdex:backfill -- --all # revalida todas
 *
 * Escreve em src/infrastructure/data/tcgdex-images.json, que o catalog-builder
 * lê ao montar a mídia dos produtos. Vale para o modo em memória e para o seed
 * do Prisma, porque ambos partem da mesma fonte de dados.
 *
 * Só grava URL que respondeu 200 — um link quebrado renderizaria uma imagem
 * falha, que é pior que a arte procedural desenhada da loja.
 *
 * Precisa de acesso de rede a api.tcgdex.net e assets.tcgdex.net.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { allProducts } from '../src/infrastructure/data/index.ts';
import { lookupTcgdexCard, parseLocalId } from '../src/infrastructure/tcgdex/client.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.join(HERE, '../src/infrastructure/data/tcgdex-images.json');

const all = process.argv.includes('--all');

const file = JSON.parse(await readFile(TARGET, 'utf8')) as {
  _comment: string;
  cards: Record<string, string>;
};

const cards = allProducts.filter((product) => product.type === 'tcg-card' && product.card);
const pending = all ? cards : cards.filter((product) => !file.cards[product.slug]);

console.log(`${cards.length} cartas no catálogo · ${pending.length} a resolver\n`);

let ok = 0;
let miss = 0;

for (const product of pending) {
  const card = product.card!;
  const match = await lookupTcgdexCard({
    name: product.name,
    localId: parseLocalId(card.number),
    setName: card.set,
  });

  if (!match?.imageUrl) {
    console.log(`  ✗ ${product.slug} — sem correspondência na TCGdex`);
    miss++;
    continue;
  }

  // Confere que a imagem existe de fato antes de gravar.
  const head = await fetch(match.imageUrl, { method: 'HEAD' }).catch(() => null);
  if (!head?.ok) {
    console.log(`  ✗ ${product.slug} — carta encontrada, mas a imagem não responde (${head?.status ?? 'rede'})`);
    miss++;
    continue;
  }

  file.cards[product.slug] = match.imageUrl;
  console.log(`  ✓ ${product.slug} → ${match.imageUrl}`);
  ok++;
}

if (ok > 0) {
  const sorted = Object.fromEntries(Object.entries(file.cards).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(TARGET, `${JSON.stringify({ ...file, cards: sorted }, null, 2)}\n`);
}

console.log(`\n${ok} resolvida(s), ${miss} sem imagem.`);
if (ok > 0) console.log('tcgdex-images.json atualizado — rode o build para as artes entrarem.');
