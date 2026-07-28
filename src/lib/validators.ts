import { z } from 'zod';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length === 11, 'CPF deve ter 11 dígitos.');

export const zipSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length === 8, 'CEP deve ter 8 dígitos.');

export const phoneSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length >= 10 && value.length <= 11, 'Telefone inválido.');

export const identificationSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo.'),
  email: z.string().email('E-mail inválido.'),
  document: cpfSchema,
  phone: phoneSchema,
});

export const addressSchema = z.object({
  zip: zipSchema,
  street: z.string().min(3, 'Informe a rua.'),
  number: z.string().min(1, 'Informe o número.'),
  complement: z.string().optional(),
  district: z.string().min(2, 'Informe o bairro.'),
  city: z.string().min(2, 'Informe a cidade.'),
  state: z.string().length(2, 'Use a sigla do estado (ex.: SP).'),
  recipient: z.string().min(3, 'Informe quem vai receber.'),
});

export const paymentSchema = z
  .object({
    method: z.enum(['credit', 'pix', 'boleto']),
    installments: z.number().int().min(1).max(12).default(1),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method !== 'credit') return;

    const digits = onlyDigits(data.cardNumber ?? '');
    if (digits.length < 13 || digits.length > 19) {
      ctx.addIssue({ code: 'custom', path: ['cardNumber'], message: 'Número de cartão inválido.' });
    }
    if ((data.cardName ?? '').trim().length < 3) {
      ctx.addIssue({ code: 'custom', path: ['cardName'], message: 'Informe o nome impresso no cartão.' });
    }
    if (!/^\d{2}\/\d{2}$/.test(data.cardExpiry ?? '')) {
      ctx.addIssue({ code: 'custom', path: ['cardExpiry'], message: 'Use o formato MM/AA.' });
    }
    if (!/^\d{3,4}$/.test(data.cardCvv ?? '')) {
      ctx.addIssue({ code: 'custom', path: ['cardCvv'], message: 'CVV inválido.' });
    }
  });

export const checkoutSchema = z.object({
  identification: identificationSchema,
  address: addressSchema,
  shippingOptionId: z.string().min(1),
  payment: paymentSchema,
  couponCode: z.string().nullable().optional(),
  lines: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1, 'Seu carrinho está vazio.'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type IdentificationInput = z.infer<typeof identificationSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(3, 'Informe seu nome completo.'),
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(8, 'A senha precisa de ao menos 8 caracteres.'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'É preciso aceitar os termos.' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha muito curta.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** Máscaras de exibição — a validação sempre roda sobre os dígitos crus. */
export const masks = {
  cpf: (value: string) =>
    onlyDigits(value)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  zip: (value: string) => onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
  phone: (value: string) =>
    onlyDigits(value)
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2'),
  card: (value: string) =>
    onlyDigits(value)
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 '),
  expiry: (value: string) => onlyDigits(value).slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2'),
};
