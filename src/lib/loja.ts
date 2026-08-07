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

const { logradouro, complemento, bairro, cidade, cidadeCurta, uf } = LOJA.endereco;

/** Endereço por extenso — páginas institucionais, rodapé. */
export const ENDERECO_COMPLETO = `${logradouro}, ${complemento} — ${bairro}, ${cidade}/${uf}`;

/** Versão curta, para linha estreita: usa a sigla da cidade. */
export const ENDERECO_CURTO = `${logradouro}, ${complemento} — ${bairro}, ${cidadeCurta}/${uf}`;

/** "Vale do Jatobá, Belo Horizonte" — para frases corridas. */
export const BAIRRO_CIDADE = `${bairro}, ${cidade}`;

/** "Belo Horizonte — MG" — rótulo de transportadora e afins. */
export const CIDADE_UF = `${cidade} — ${uf}`;
