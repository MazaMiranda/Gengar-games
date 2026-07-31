/**
 * Recorta o fundo da arte da marca e grava a versão com transparência.
 *
 *   npm run logo:prepare                      # public/logo-original.png -> public/logo.png
 *   npm run logo:prepare -- entrada.png saida.png
 *
 * Por que não basta "apagar todo pixel escuro": a arte tem contorno preto em
 * volta das letras. Uma limiarização global comeria esse contorno e deixaria a
 * logo esburacada. Aqui o preenchimento parte das bordas da imagem e só avança
 * por vizinhança — então o fundo sai inteiro e o preto interno das letras, que
 * não encosta na borda, permanece.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [inputArg, outputArg] = process.argv.slice(2);
const INPUT = path.resolve(inputArg ?? 'public/logo-original.png');
const OUTPUT = path.resolve(outputArg ?? 'public/logo.png');

/** Distância euclidiana no cubo RGB. */
function distance(r: number, g: number, b: number, to: [number, number, number]) {
  return Math.sqrt((r - to[0]) ** 2 + (g - to[1]) ** 2 + (b - to[2]) ** 2);
}

const source = sharp(await readFile(INPUT));
const { width, height } = await source.metadata();
if (!width || !height) throw new Error('Não consegui ler as dimensões da imagem.');

const { data } = await source.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const pixels = new Uint8ClampedArray(data);

// Cor do fundo: média dos quatro cantos. Se os cantos discordarem muito, a
// imagem provavelmente já veio recortada ou tem fundo complexo — melhor avisar
// do que produzir um recorte errado em silêncio.
const corners: [number, number][] = [
  [0, 0],
  [width - 1, 0],
  [0, height - 1],
  [width - 1, height - 1],
];
const sampled = corners.map(([x, y]) => {
  const i = (y * width + x) * 4;
  return [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!] as [number, number, number];
});
const background: [number, number, number] = [0, 1, 2].map(
  (channel) => sampled.reduce((sum, c) => sum + c[channel]!, 0) / sampled.length,
) as [number, number, number];

const spread = Math.max(...sampled.map((c) => distance(c[0], c[1], c[2], background)));
if (spread > 40) {
  console.warn(
    `⚠ Os cantos da imagem têm cores bem diferentes entre si (variação ${spread.toFixed(0)}).\n` +
      '  O fundo pode não ser uniforme — confira o resultado antes de usar.',
  );
}

/*
 * Tolerância em dois níveis para a borda não ficar serrilhada:
 * abaixo de SOLID o pixel é fundo puro (some), acima de EDGE é arte (fica), e
 * no meio a opacidade cresce proporcionalmente — é o que suaviza o contorno.
 */
const SOLID = 26;
const EDGE = 78;

const visited = new Uint8Array(width * height);
// Fila explícita em vez de recursão: 1080x1080 estouraria a pilha.
const queue: number[] = [];

for (let x = 0; x < width; x++) {
  queue.push(x, x + (height - 1) * width);
}
for (let y = 0; y < height; y++) {
  queue.push(y * width, width - 1 + y * width);
}

let cleared = 0;

while (queue.length) {
  const index = queue.pop()!;
  if (visited[index]) continue;
  visited[index] = 1;

  const i = index * 4;
  const d = distance(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, background);
  if (d > EDGE) continue; // chegou na arte: para de avançar por aqui

  if (d <= SOLID) {
    pixels[i + 3] = 0;
    cleared++;
  } else {
    // Banda de transição: quanto mais longe do fundo, mais opaco.
    const alpha = Math.round(((d - SOLID) / (EDGE - SOLID)) * 255);
    pixels[i + 3] = Math.min(pixels[i + 3]!, alpha);
  }

  const x = index % width;
  const y = (index - x) / width;
  if (x > 0) queue.push(index - 1);
  if (x < width - 1) queue.push(index + 1);
  if (y > 0) queue.push(index - width);
  if (y < height - 1) queue.push(index + width);
}

const output = await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels: 4 } })
  .png()
  // Apara a moldura vazia que sobra depois do recorte.
  .trim({ threshold: 0 })
  .toBuffer();

const final = sharp(output);
const meta = await final.metadata();
await writeFile(OUTPUT, output);

const percent = ((cleared / (width * height)) * 100).toFixed(1);
console.log(`entrada : ${INPUT} (${width}x${height})`);
console.log(`fundo   : rgb(${background.map((c) => Math.round(c)).join(', ')}) — ${percent}% dos pixels removidos`);
console.log(`saída   : ${OUTPUT} (${meta.width}x${meta.height}, com transparência)`);
