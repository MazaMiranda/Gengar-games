import { BAIRRO_CIDADE, ENDERECO_COMPLETO, LOJA } from '@/lib/loja';

export interface InstitutionalSection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface InstitutionalPage {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  sections: InstitutionalSection[];
}

export const institutionalPages: InstitutionalPage[] = [
  {
    slug: 'entrega',
    title: 'Prazos e frete',
    eyebrow: 'Logística',
    description: 'Como calculamos o frete, quanto tempo levamos para postar e o que fazer se algo atrasar.',
    sections: [
      {
        heading: 'Prazo de postagem',
        body: [
          'Pedidos aprovados até 14h em dia útil são separados e postados no mesmo dia. Depois desse horário, a postagem acontece no próximo dia útil.',
          'Produtos em pré-venda são postados no dia do lançamento oficial no Brasil, e o anúncio sempre informa essa data.',
        ],
      },
      {
        heading: 'Modalidades de envio',
        body: [`Trabalhamos com Correios e transportadora própria na região metropolitana de ${LOJA.endereco.cidade}.`],
        list: [
          'Gengar Express (Loggi): 1 a 2 dias úteis — capitais atendidas',
          'SEDEX: 2 a 4 dias úteis para a maior parte do país',
          'PAC: 6 a 11 dias úteis, opção mais econômica',
          `Retirada na loja do ${BAIRRO_CIDADE}: gratuita, liberada em até 4 horas úteis`,
        ],
      },
      {
        heading: 'Frete grátis',
        body: [
          'Pedidos acima de R$ 299 têm frete grátis para todo o Brasil na modalidade padrão. O desconto aparece automaticamente no carrinho.',
        ],
      },
      {
        heading: 'Atraso ou extravio',
        body: [
          'Se o rastreio ficar parado por mais de 5 dias úteis, abrimos a reclamação junto à transportadora e mantemos você informado por e-mail. Em caso de extravio confirmado, reenviamos o pedido ou devolvemos o valor integral — você escolhe.',
        ],
      },
    ],
  },
  {
    slug: 'trocas',
    title: 'Trocas e devoluções',
    eyebrow: 'Pós-venda',
    description: 'Seus direitos, nossos prazos e o passo a passo para resolver qualquer problema.',
    sections: [
      {
        heading: 'Arrependimento',
        body: [
          'Você tem 7 dias corridos a partir do recebimento para desistir da compra, conforme o Código de Defesa do Consumidor. O produto precisa voltar sem uso e com a embalagem original.',
          'Cartas avulsas devem retornar no mesmo toploader e sleeve em que foram enviadas.',
        ],
      },
      {
        heading: 'Defeito de fabricação',
        body: [
          'Produtos novos têm 30 dias para reclamação de vício aparente e a garantia do fabricante para defeitos posteriores. Consoles e jogos usados têm 90 dias de garantia da Gengar Games.',
        ],
      },
      {
        heading: 'Como solicitar',
        body: ['O processo é feito inteiramente pelo nosso atendimento.'],
        list: [
          'Envie o número do pedido e fotos do item para trocas@gengargames.com.br',
          'Recebemos sua solicitação e enviamos o código de postagem reversa em até 1 dia útil',
          'Após a chegada e a conferência, o reembolso é processado em até 5 dias úteis',
        ],
      },
      {
        heading: 'O que não trocamos',
        body: [
          'Produtos selados abertos por vontade do cliente, como booster boxes e pacotes. Ao abrir o lacre, o valor do item passa a depender do conteúdo sorteado, o que inviabiliza a devolução.',
        ],
      },
    ],
  },
  {
    slug: 'pagamento',
    title: 'Formas de pagamento',
    eyebrow: 'Financeiro',
    description: 'Cartão, PIX, boleto, parcelamento e segurança das transações.',
    sections: [
      {
        heading: 'Meios aceitos',
        body: ['Todas as transações passam por antifraude antes da liberação do pedido.'],
        list: [
          'Cartão de crédito Visa, Mastercard, Elo e American Express',
          'PIX com 5% de desconto e liberação imediata',
          'Boleto bancário com vencimento em 3 dias úteis',
        ],
      },
      {
        heading: 'Parcelamento',
        body: [
          'Parcelamos em até 12x sem juros no cartão, respeitando o valor mínimo de R$ 20 por parcela. O número máximo de parcelas aparece na página do produto e no checkout.',
        ],
      },
      {
        heading: 'Segurança',
        body: [
          'Os dados do cartão trafegam criptografados diretamente para o processador de pagamento — a Gengar Games não armazena número, validade ou CVV em nenhum momento.',
        ],
      },
    ],
  },
  {
    slug: 'curadoria',
    title: 'Como avaliamos cartas',
    eyebrow: 'Curadoria',
    description: 'O critério que usamos para classificar o estado de cada single antes de anunciar.',
    sections: [
      {
        heading: 'Inspeção',
        body: [
          'Toda carta passa por inspeção sob luz branca e luz UV, com avaliação de centralização, superfície, bordas e cantos. Nenhuma carta entra no estoque sem essa etapa.',
        ],
      },
      {
        heading: 'Escala de estado',
        body: ['Seguimos o padrão internacional adotado pelas principais casas de grading.'],
        list: [
          'M (Mint): sem qualquer imperfeição visível, direto do pacote',
          'NM (Near Mint): pode ter uma imperfeição mínima, imperceptível a olho nu',
          'SP (Slightly Played): marcas leves de manuseio nas bordas ou superfície',
          'MP (Moderately Played): desgaste visível, sempre descrito e fotografado no anúncio',
        ],
      },
      {
        heading: 'Embalagem',
        body: [
          'Cartas acima de R$ 100 seguem em sleeve, toploader lacrado com fita e caixa rígida com preenchimento — o mesmo padrão usado para envio a serviços de grading.',
        ],
      },
    ],
  },
  {
    slug: 'contato',
    title: 'Fale com a gente',
    eyebrow: 'Atendimento',
    description: 'Canais oficiais, horários e o que esperar de cada um.',
    sections: [
      {
        heading: 'Canais',
        body: ['Atendemos de segunda a sexta das 9h às 19h e aos sábados das 10h às 16h.'],
        list: [
          `WhatsApp: ${LOJA.telefone} — resposta em até 15 minutos no horário comercial`,
          `E-mail: ${LOJA.email} — resposta em até 1 dia útil`,
          `Loja física: ${ENDERECO_COMPLETO}`,
        ],
      },
      {
        heading: 'Pedidos e trocas',
        body: [
          'Para assuntos relacionados a um pedido específico, use trocas@gengargames.com.br com o número do pedido no assunto. Isso acelera bastante o atendimento.',
        ],
      },
    ],
  },
  {
    slug: 'termos',
    title: 'Termos de uso',
    eyebrow: 'Jurídico',
    description: 'Condições gerais para navegação e compra na Gengar Games.',
    sections: [
      {
        heading: 'Aceite',
        body: [
          `Ao criar uma conta ou finalizar uma compra, você concorda com estes termos e com a política de privacidade da ${LOJA.nome} LTDA, CNPJ ${LOJA.cnpj}.`,
        ],
      },
      {
        heading: 'Preços e disponibilidade',
        body: [
          'Preços e estoque podem mudar sem aviso prévio. Em caso de erro evidente de precificação, entramos em contato antes de processar o pedido e você pode cancelar sem qualquer custo.',
        ],
      },
      {
        heading: 'Conta do usuário',
        body: [
          'Você é responsável por manter a confidencialidade da sua senha. Contas com indício de uso fraudulento podem ser suspensas para análise.',
        ],
      },
    ],
  },
  {
    slug: 'privacidade',
    title: 'Política de privacidade',
    eyebrow: 'Jurídico',
    description: 'Quais dados coletamos, por que coletamos e como você controla o uso.',
    sections: [
      {
        heading: 'Dados coletados',
        body: ['Coletamos apenas o necessário para processar seus pedidos e melhorar a experiência.'],
        list: [
          'Cadastro: nome, e-mail, CPF, telefone e endereço',
          'Pedidos: itens, valores e histórico de compras',
          'Navegação: páginas visitadas e produtos favoritados',
        ],
      },
      {
        heading: 'Uso e compartilhamento',
        body: [
          'Compartilhamos dados apenas com transportadoras, processadores de pagamento e órgãos fiscais, sempre no limite necessário para concluir a operação. Nunca vendemos dados a terceiros.',
        ],
      },
      {
        heading: 'Seus direitos',
        body: [
          'Conforme a LGPD, você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados pelo e-mail privacidade@gengargames.com.br. Respondemos em até 15 dias.',
        ],
      },
    ],
  },
];

export const institutionalBySlug = new Map(institutionalPages.map((page) => [page.slug, page]));
