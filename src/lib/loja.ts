/**
 * Dados da loja física e dos canais de atendimento.
 *
 * Fonte única de propósito: o endereço aparecia escrito à mão em nove lugares
 * — rodapé, caixa de compra, FAQ, frete, ticker de avisos e três páginas
 * institucionais —, então trocar de sede significava caçar string por string e
 * torcer para não esquecer nenhuma. Aqui muda num lugar só.
 */

export const LOJA = {
  nome: 'Gengar Games',
  cnpj: '48.221.905/0001-32',

  endereco: {
    logradouro: 'Avenida Senador Levindo Coelho, 1990',
    complemento: 'BOX 15',
    bairro: 'Vale do Jatobá',
    cidade: 'Belo Horizonte',
    cidadeCurta: 'BH',
    uf: 'MG',
  },

  telefone: '+55 31 8514-4153',
  email: 'contato@gengargames.com.br',
  emailTrocas: 'trocas@gengargames.com.br',
} as const;

/** Só os dígitos, com país — formato que `tel:` e o WhatsApp esperam. */
export const TELEFONE_LINK = LOJA.telefone.replace(/\D/g, '');

/** Primeira frase da conversa, quando quem clica não veio de um produto. */
export const MENSAGEM_PADRAO = 'Olá! Vim pelo site da Gengar Games e queria tirar uma dúvida.';

/**
 * Link de conversa no WhatsApp, já com a mensagem digitada.
 *
 * O wa.me é o endereço oficial e resolve sozinho para onde o cliente tem o
 * WhatsApp: aplicativo no celular, versão de desktop, ou WhatsApp Web no
 * navegador. Por isso não vale a pena detectar dispositivo aqui.
 *
 * O número entra só com dígitos e código do país, sem +, sem espaço e sem
 * traço — é o único formato que o wa.me aceita.
 */
export function whatsappUrl(mensagem: string = MENSAGEM_PADRAO) {
  return `https://wa.me/${TELEFONE_LINK}?text=${encodeURIComponent(mensagem)}`;
}

const { logradouro, complemento, bairro, cidade, cidadeCurta, uf } = LOJA.endereco;

/** Endereço por extenso — páginas institucionais, rodapé. */
export const ENDERECO_COMPLETO = `${logradouro}, ${complemento} — ${bairro}, ${cidade}/${uf}`;

/** Versão curta, para linha estreita: usa a sigla da cidade. */
export const ENDERECO_CURTO = `${logradouro}, ${complemento} — ${bairro}, ${cidadeCurta}/${uf}`;

/** "Vale do Jatobá, Belo Horizonte" — para frases corridas. */
export const BAIRRO_CIDADE = `${bairro}, ${cidade}`;

/** "Belo Horizonte — MG" — rótulo de transportadora e afins. */
export const CIDADE_UF = `${cidade} — ${uf}`;
