import type { Money } from '@/core/domain/entities';

export interface PaymentIntentResult {
  provider: 'stripe' | 'simulado';
  status: 'requires_confirmation' | 'succeeded' | 'pending';
  reference: string;
  clientSecret: string | null;
  message: string;
}

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

/**
 * Cria a intenção de pagamento.
 *
 * Com STRIPE_SECRET_KEY configurada, chama a API do Stripe (o SDK oficial entra
 * aqui, junto do webhook em /api/webhooks/stripe). Sem a chave, o checkout roda
 * em modo simulação para que o fluxo completo continue testável.
 */
export async function createPaymentIntent(input: {
  amount: Money;
  method: 'credit' | 'pix' | 'boleto';
  installments: number;
  customerEmail: string;
  orderNumber: string;
}): Promise<PaymentIntentResult> {
  if (!stripeEnabled()) {
    return {
      provider: 'simulado',
      status: input.method === 'boleto' ? 'pending' : 'succeeded',
      reference: `sim_${input.orderNumber}`,
      clientSecret: null,
      message:
        input.method === 'boleto'
          ? 'Boleto gerado. O pedido será liberado após a compensação.'
          : 'Pagamento aprovado em ambiente de simulação.',
    };
  }

  const body = new URLSearchParams({
    amount: String(input.amount),
    currency: 'brl',
    'automatic_payment_methods[enabled]': 'true',
    receipt_email: input.customerEmail,
    'metadata[order_number]': input.orderNumber,
    'metadata[installments]': String(input.installments),
  });

  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Falha ao criar PaymentIntent no Stripe: ${error}`);
  }

  const intent = (await response.json()) as {
    id: string;
    client_secret: string;
    status: string;
  };

  return {
    provider: 'stripe',
    status: intent.status === 'succeeded' ? 'succeeded' : 'requires_confirmation',
    reference: intent.id,
    clientSecret: intent.client_secret,
    message: 'Intenção de pagamento criada no Stripe.',
  };
}
