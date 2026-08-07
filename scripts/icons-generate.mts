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

/**
 * Cartão de compartilhamento (Open Graph).
 *
 * Sem ele, colar o link no WhatsApp, no Slack ou num slide rende um retângulo
 * vazio. 1200x630 é a proporção que as redes recortam sem cortar nada.
 *
 * A marca vai centralizada sobre a chapa escura, com o mesmo halo roxo que a
 * loja usa — nenhum texto desenhado aqui, porque o título e a descrição já
 * viajam nas metatags e desenhar fonte no servidor traria dependência nova.
 */
async function gerarCartao(destino: string) {
  const [L, A] = [1200, 630];

  const halo = Buffer.from(
    `<svg width="${L}" height="${A}">
       <defs>
         <radialGradient id="g" cx="50%" cy="42%" r="55%">
           <stop offset="0%" stop-color="#a855f7" stop-opacity="0.5"/>
           <stop offset="60%" stop-color="#6d28d9" stop-opacity="0.16"/>
           <stop offset="100%" stop-color="#12101a" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${L}" height="${A}" fill="url(#g)"/>
     </svg>`,
  );

  const arte = await sharp(await readFile(ENTRADA))
    .resize({ width: Math.round(L * 0.46), fit: 'inside', withoutEnlargement: false })
    .toBuffer();

  const saida = await sharp({ create: { width: L, height: A, channels: 4, background: CHAPA } })
    .composite([
      { input: halo, blend: 'over' },
      { input: arte, gravity: 'center' },
    ])
    .png()
    .toBuffer();

  await writeFile(path.resolve(destino), saida);
  console.log(`${destino.padEnd(28)} ${L}x${A}`);
}

// Favicon: quadrado reto, o navegador desenha a moldura da aba.
await gerar('src/app/icon.png', 512, 0);
// Apple: o iOS aplica o próprio arredondamento, então a chapa vai cheia.
await gerar('src/app/apple-icon.png', 180, 0);
// Open Graph: o Next serve este arquivo e escreve as metatags sozinho.
await gerarCartao('src/app/opengraph-image.png');
