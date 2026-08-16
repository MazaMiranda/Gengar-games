import { Geist, Geist_Mono } from 'next/font/google';

/**
 * Vitrine — pilha tipográfica.
 *
 * Uma família só, dois cortes. A direção anterior usava três (Sora no título,
 * Manrope no corpo, Chakra Petch no rótulo técnico): três famílias disputando
 * a mesma página, e a Chakra Petch carregava sozinha o sotaque de HUD de
 * arcade que esta direção abandona.
 *
 * Geist cobre display e corpo. Hierarquia sai de peso, tamanho e cor, nunca de
 * troca de família — trocar de família para dar ênfase é o tique amador.
 */
export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  weight: ['400', '500', '600', '700'],
});

/**
 * Geist Mono — só número e rótulo curto.
 *
 * Preço, quantidade, número de pedido, contagem de estoque. Numeral tabular
 * segura a coluna quando o valor muda: preço riscado sobre preço final não
 * pode dançar na tela.
 */
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
  weight: ['400', '500', '600'],
});

export const fontVariables = `${geist.variable} ${geistMono.variable}`;
