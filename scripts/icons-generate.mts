/**
 * Gera os ícones do site a partir da arte da marca.
 *
 *   npm run icons:generate
 *
 * Por que os dois arquivos e por que com chapa escura: o "GAMES" da arte é
 * branco puro sobre fundo transparente. O iOS não respeita transparência no
 * ícone da tela de início — ele compõe sobre branco, e metade da marca sumiria.
 * Então a chapa #12101a vai embutida, a mesma que o cabeçalho usa nos dois
 * temas, pelo mesmo motivo.
 *
 * Os nomes seguem a convenção do App Router: `icon.png` vira o favicon e
 * `apple-icon.png` vira o apple-touch-icon, com as tags geradas pelo Next.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ENTRADA = path.resolve('public/logo.png');
const CHAPA = { r: 0x12, g: 0x10, b: 0x1a, alpha: 1 };

/** Quanto da caixa a arte ocupa. O resto é respiro — ícone colado na borda
 *  fica apertado, ainda mais depois do recorte arredondado do iOS. */
const OCUPACAO = 0.78;

async function gerar(destino: string, lado: number, raio: number) {
  const arte = await sharp(await readFile(ENTRADA))
    .resize({
      width: Math.round(lado * OCUPACAO),
      height: Math.round(lado * OCUPACAO),
      fit: 'inside',
      withoutEnlargement: false,
    })
    .toBuffer();

  const mascara = Buffer.from(
    `<svg width="${lado}" height="${lado}"><rect width="${lado}" height="${lado}" rx="${raio}" ry="${raio}"/></svg>`,
  );

  const saida = await sharp({
    create: { width: lado, height: lado, channels: 4, background: CHAPA },
  })
    .composite([
      { input: arte, gravity: 'center' },
      { input: mascara, blend: 'dest-in' },
    ])
    .png()
    .toBuffer();

  await writeFile(path.resolve(destino), saida);
  console.log(`${destino.padEnd(28)} ${lado}x${lado}`);
}

// Favicon: quadrado reto, o navegador desenha a moldura da aba.
await gerar('src/app/icon.png', 512, 0);
// Apple: o iOS aplica o próprio arredondamento, então a chapa vai cheia.
await gerar('src/app/apple-icon.png', 180, 0);
