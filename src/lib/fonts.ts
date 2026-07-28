import { Sora, Manrope, Chakra_Petch } from 'next/font/google';

/** Títulos e números grandes — geométrica, com personalidade. */
export const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
  weight: ['400', '500', '600', '700', '800'],
});

/** Corpo e interface — legível em densidade alta, sem cara de template. */
export const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
});

/** Rótulos técnicos, badges e HUD — angular, referência gamer. */
export const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-chakra',
  weight: ['400', '500', '600', '700'],
});

export const fontVariables = `${sora.variable} ${manrope.variable} ${chakraPetch.variable}`;
