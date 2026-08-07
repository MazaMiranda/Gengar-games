'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Barcode,
  Check,
  CreditCard,
  Lock,
  QrCode,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem, Separator } from '@/components/ui/controls';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart-store';
import { useCartTotals } from '@/hooks/use-cart-totals';
import { etaLabel, shippingOptionById, shippingOptions } from '@/lib/shipping';
import {
  addressSchema,
  identificationSchema,
  masks,
  paymentSchema,
  type AddressInput,
  type IdentificationInput,
  type PaymentInput,
} from '@/lib/validators';
import { cn, formatPrice, installmentsFor } from '@/lib/utils';
import { OrderSummary } from './order-summary';

const STEPS = [
  { id: 'identificacao', label: 'Identificação' },
  { id: 'entrega', label: 'Entrega' },
  { id: 'pagamento', label: 'Pagamento' },
  { id: 'revisao', label: 'Revisão' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

interface CheckoutFlowProps {
  defaults?: {
    name?: string;
    email?: string;
    document?: string;
    phone?: string;
    address?: Partial<AddressInput>;
  };
}

export function CheckoutFlow({ defaults }: CheckoutFlowProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<StepId>('identificacao');
  const [submitting, setSubmitting] = React.useState(false);

  const lines = useCartStore((state) => state.lines);
  const couponCode = useCartStore((state) => state.couponCode);
  const shippingOptionId = useCartStore((state) => state.shippingOptionId);
  const setShippingOption = useCartStore((state) => state.setShippingOption);
  const clear = useCartStore((state) => state.clear);

  const { totals } = useCartTotals();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const identificationForm = useForm<IdentificationInput>({
    resolver: zodResolver(identificationSchema),
    defaultValues: {
      name: defaults?.name ?? '',
      email: defaults?.email ?? '',
      document: defaults?.document ?? '',
      phone: defaults?.phone ?? '',
    },
  });

  const addressForm = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipient: defaults?.address?.recipient ?? defaults?.name ?? '',
      zip: defaults?.address?.zip ?? '',
      street: defaults?.address?.street ?? '',
      number: defaults?.address?.number ?? '',
      complement: defaults?.address?.complement ?? '',
      district: defaults?.address?.district ?? '',
      city: defaults?.address?.city ?? '',
      state: defaults?.address?.state ?? '',
    },
  });

  const paymentForm = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: 'credit', installments: 12 },
  });

  const method = paymentForm.watch('method');
  const installmentPlan = installmentsFor(totals.total);
  const shipping = shippingOptionById(shippingOptionId);

  const goTo = (target: StepId) => {
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identification: identificationForm.getValues(),
          address: addressForm.getValues(),
          shippingOptionId,
          payment: paymentForm.getValues(),
          couponCode,
          lines: lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        toast.error('Não foi possível finalizar', { description: data.message });
        return;
      }

      clear();
      router.push(`/checkout/sucesso/${data.order.number}`);
    } catch {
      toast.error('Erro de conexão', { description: 'Verifique sua internet e tente de novo.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (mounted && lines.length === 0) {
    return (
      <div className="plate flex flex-col items-center gap-5 rounded-xl px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-full border border-line bg-ink/3">
          <ShoppingBag className="size-6 text-ink-faint" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Seu carrinho está vazio</h2>
          <p className="mt-2 text-sm text-ink-muted">Adicione produtos para continuar o checkout.</p>
        </div>
        <Button asChild>
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((item) => item.id === step);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
      <div className="flex flex-col gap-8">
        {/* Trilha de progresso */}
        <ol className="flex items-center gap-2">
          {STEPS.map((item, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <li key={item.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => (done ? goTo(item.id) : undefined)}
                  disabled={!done}
                  className={cn(
                    'flex items-center gap-2.5 whitespace-nowrap transition-colors',
                    done ? 'cursor-pointer text-ink-muted hover:text-ink' : '',
                    active ? 'text-ink' : 'text-ink-ghost',
                  )}
                >
                  <span
                    className={cn(
                      'tap-44 grid size-8 shrink-0 place-items-center rounded-full border font-tech text-2xs font-bold transition-all duration-400',
                      done
                        ? 'border-success/40 bg-success/15 text-success'
                        : active
                          ? 'border-brand-400/60 bg-brand-500/20 text-brand-100 shadow-glow-sm'
                          : 'border-line text-ink-ghost',
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  <span className="hidden text-xs font-semibold sm:block">{item.label}</span>
                </button>
                {index < STEPS.length - 1 ? (
                  <span
                    className={cn(
                      'h-px flex-1 transition-colors duration-500',
                      index < currentIndex ? 'bg-success/40' : 'bg-line',
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="plate flex flex-col gap-7 rounded-xl p-6 md:p-8"
          >
            {step === 'identificacao' ? (
              <form
                onSubmit={identificationForm.handleSubmit(() => goTo('entrega'))}
                className="flex flex-col gap-6"
                noValidate
              >
                <header className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-bold text-ink">Quem está comprando</h2>
                  <p className="text-sm text-ink-muted">Usamos esses dados para emitir a nota fiscal.</p>
                </header>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nome completo" required error={identificationForm.formState.errors.name?.message} className="sm:col-span-2">
                    <Input placeholder="Ana Beatriz Lopes" {...identificationForm.register('name')} />
                  </Field>
                  <Field label="E-mail" required error={identificationForm.formState.errors.email?.message}>
                    <Input type="email" placeholder="voce@email.com" {...identificationForm.register('email')} />
                  </Field>
                  <Field label="Telefone" required error={identificationForm.formState.errors.phone?.message}>
                    <Input
                      placeholder="(11) 90000-0000"
                      inputMode="numeric"
                      {...identificationForm.register('phone', {
                        onChange: (event) => {
                          event.target.value = masks.phone(event.target.value);
                        },
                      })}
                    />
                  </Field>
                  <Field label="CPF" required error={identificationForm.formState.errors.document?.message}>
                    <Input
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      {...identificationForm.register('document', {
                        onChange: (event) => {
                          event.target.value = masks.cpf(event.target.value);
                        },
                      })}
                    />
                  </Field>
                </div>

                <Button type="submit" size="lg" className="self-start">
                  Continuar para entrega
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            ) : null}

            {step === 'entrega' ? (
              <form
                onSubmit={addressForm.handleSubmit(() => goTo('pagamento'))}
                className="flex flex-col gap-6"
                noValidate
              >
                <header className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-bold text-ink">Endereço de entrega</h2>
                  <p className="text-sm text-ink-muted">Confira com atenção — é para onde o pedido vai.</p>
                </header>

                <div className="grid gap-5 sm:grid-cols-6">
                  <Field label="CEP" required error={addressForm.formState.errors.zip?.message} className="sm:col-span-2">
                    <Input
                      placeholder="00000-000"
                      inputMode="numeric"
                      {...addressForm.register('zip', {
                        onChange: (event) => {
                          event.target.value = masks.zip(event.target.value);
                        },
                      })}
                    />
                  </Field>
                  <Field label="Destinatário" required error={addressForm.formState.errors.recipient?.message} className="sm:col-span-4">
                    <Input placeholder="Quem vai receber" {...addressForm.register('recipient')} />
                  </Field>
                  <Field label="Rua" required error={addressForm.formState.errors.street?.message} className="sm:col-span-4">
                    <Input placeholder="Rua Barata Ribeiro" {...addressForm.register('street')} />
                  </Field>
                  <Field label="Número" required error={addressForm.formState.errors.number?.message} className="sm:col-span-2">
                    <Input placeholder="502" {...addressForm.register('number')} />
                  </Field>
                  <Field label="Complemento" className="sm:col-span-3">
                    <Input placeholder="Apto 71" {...addressForm.register('complement')} />
                  </Field>
                  <Field label="Bairro" required error={addressForm.formState.errors.district?.message} className="sm:col-span-3">
                    <Input placeholder="Copacabana" {...addressForm.register('district')} />
                  </Field>
                  <Field label="Cidade" required error={addressForm.formState.errors.city?.message} className="sm:col-span-4">
                    <Input placeholder="Rio de Janeiro" {...addressForm.register('city')} />
                  </Field>
                  <Field label="UF" required error={addressForm.formState.errors.state?.message} className="sm:col-span-2">
                    <Input placeholder="RJ" maxLength={2} className="uppercase" {...addressForm.register('state')} />
                  </Field>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                    <Truck className="size-4 text-brand-300" />
                    Forma de envio
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {shippingOptions.map((option) => {
                      const active = option.id === shippingOptionId;
                      const free = totals.subtotal >= 29900 || option.price === 0;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setShippingOption(option.id)}
                          className={cn(
                            'flex items-center justify-between gap-3 rounded-md border px-4 py-3.5 text-left transition-all duration-300',
                            active
                              ? 'border-brand-400/50 bg-brand-500/10 shadow-glow-sm'
                              : 'border-line bg-ink/2 hover:border-line-strong',
                          )}
                        >
                          <div>
                            <p className="text-xs font-semibold text-ink">{option.name}</p>
                            <p className="text-2xs text-ink-faint">
                              {option.carrier} · {etaLabel(option)}
                            </p>
                          </div>
                          <span className={cn('font-tech text-xs font-bold', free ? 'text-success' : 'text-ink-muted')}>
                            {free ? 'Grátis' : formatPrice(option.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="ghost" size="lg" onClick={() => goTo('identificacao')}>
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Button>
                  <Button type="submit" size="lg">
                    Continuar para pagamento
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            ) : null}

            {step === 'pagamento' ? (
              <form
                onSubmit={paymentForm.handleSubmit(() => goTo('revisao'))}
                className="flex flex-col gap-6"
                noValidate
              >
                <header className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-bold text-ink">Como você prefere pagar</h2>
                  <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <Lock className="size-3.5 text-success" />
                    Ambiente seguro — dados criptografados de ponta a ponta.
                  </p>
                </header>

                <RadioGroup
                  value={method}
                  onValueChange={(value) => paymentForm.setValue('method', value as PaymentInput['method'])}
                  className="grid gap-2 sm:grid-cols-3"
                >
                  {[
                    { value: 'credit', label: 'Cartão de crédito', hint: `até ${installmentPlan.count}x sem juros`, icon: CreditCard },
                    { value: 'pix', label: 'PIX', hint: '5% de desconto', icon: QrCode },
                    { value: 'boleto', label: 'Boleto', hint: 'compensa em 1-3 dias', icon: Barcode },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-all duration-300',
                        method === option.value
                          ? 'border-brand-400/50 bg-brand-500/10 shadow-glow-sm'
                          : 'border-line bg-ink/2 hover:border-line-strong',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <option.icon className="size-4 text-brand-300" />
                        <RadioGroupItem value={option.value} />
                      </div>
                      <span className="text-xs font-semibold text-ink">{option.label}</span>
                      <span className="text-2xs text-ink-faint">{option.hint}</span>
                    </label>
                  ))}
                </RadioGroup>

                {method === 'credit' ? (
                  <div className="grid gap-5 sm:grid-cols-6">
                    <Field label="Número do cartão" required error={paymentForm.formState.errors.cardNumber?.message} className="sm:col-span-6">
                      <Input
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                        {...paymentForm.register('cardNumber', {
                          onChange: (event) => {
                            event.target.value = masks.card(event.target.value);
                          },
                        })}
                      />
                    </Field>
                    <Field label="Nome impresso" required error={paymentForm.formState.errors.cardName?.message} className="sm:col-span-6">
                      <Input placeholder="ANA B LOPES" className="uppercase" {...paymentForm.register('cardName')} />
                    </Field>
                    <Field label="Validade" required error={paymentForm.formState.errors.cardExpiry?.message} className="sm:col-span-2">
                      <Input
                        placeholder="MM/AA"
                        inputMode="numeric"
                        {...paymentForm.register('cardExpiry', {
                          onChange: (event) => {
                            event.target.value = masks.expiry(event.target.value);
                          },
                        })}
                      />
                    </Field>
                    <Field label="CVV" required error={paymentForm.formState.errors.cardCvv?.message} className="sm:col-span-2">
                      <Input placeholder="123" maxLength={4} inputMode="numeric" {...paymentForm.register('cardCvv')} />
                    </Field>
                    <Field label="Parcelas" className="sm:col-span-2">
                      <select
                        className="h-12 w-full rounded-md border border-line bg-ink/3 px-4 text-sm text-ink outline-none transition-all focus:border-brand-400/60"
                        {...paymentForm.register('installments', { valueAsNumber: true })}
                      >
                        {Array.from({ length: installmentPlan.count }, (_, index) => index + 1).map((count) => (
                          <option key={count} value={count} className="bg-elevated">
                            {count}x de {formatPrice(Math.round(totals.total / count))} sem juros
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                ) : null}

                {method === 'pix' ? (
                  <div className="flex items-start gap-4 rounded-md border border-success/25 bg-success/8 p-5">
                    <QrCode className="size-5 shrink-0 text-success" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-ink">
                        Pague {formatPrice(Math.round(totals.total * 0.95))} com 5% de desconto
                      </p>
                      <p className="text-xs leading-relaxed text-ink-muted">
                        O QR Code é gerado na confirmação e vale por 30 minutos. A liberação do pedido é
                        imediata após o pagamento.
                      </p>
                    </div>
                  </div>
                ) : null}

                {method === 'boleto' ? (
                  <div className="flex items-start gap-4 rounded-md border border-line bg-ink/2 p-5">
                    <Barcode className="size-5 shrink-0 text-ink-muted" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-ink">Boleto bancário</p>
                      <p className="text-xs leading-relaxed text-ink-muted">
                        O boleto vence em 3 dias úteis. O pedido é separado assim que o pagamento
                        compensa — itens com estoque baixo não ficam reservados.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="ghost" size="lg" onClick={() => goTo('entrega')}>
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Button>
                  <Button type="submit" size="lg">
                    Revisar pedido
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            ) : null}

            {step === 'revisao' ? (
              <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-bold text-ink">Confira antes de finalizar</h2>
                  <p className="text-sm text-ink-muted">Está tudo certo? É só confirmar.</p>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ReviewBlock
                    title="Identificação"
                    onEdit={() => goTo('identificacao')}
                    rows={[
                      identificationForm.getValues('name'),
                      identificationForm.getValues('email'),
                      masks.phone(identificationForm.getValues('phone')),
                    ]}
                  />
                  <ReviewBlock
                    title="Entrega"
                    onEdit={() => goTo('entrega')}
                    rows={[
                      `${addressForm.getValues('street')}, ${addressForm.getValues('number')}`,
                      `${addressForm.getValues('district')} · ${addressForm.getValues('city')}/${addressForm.getValues('state').toUpperCase()}`,
                      `CEP ${masks.zip(addressForm.getValues('zip'))}`,
                      `${shipping.name} · ${etaLabel(shipping)}`,
                    ]}
                  />
                  <ReviewBlock
                    title="Pagamento"
                    onEdit={() => goTo('pagamento')}
                    rows={
                      method === 'credit'
                        ? [
                            'Cartão de crédito',
                            `Final ${(paymentForm.getValues('cardNumber') ?? '').replace(/\D/g, '').slice(-4)}`,
                            `${paymentForm.getValues('installments')}x de ${formatPrice(
                              Math.round(totals.total / (paymentForm.getValues('installments') || 1)),
                            )}`,
                          ]
                        : method === 'pix'
                          ? ['PIX', `${formatPrice(Math.round(totals.total * 0.95))} com desconto`]
                          : ['Boleto bancário', 'Vencimento em 3 dias úteis']
                    }
                  />
                  <div className="flex flex-col gap-2 rounded-lg border border-line bg-ink/2 p-5">
                    <span className="eyebrow">Total a pagar</span>
                    <span className="font-display text-3xl font-bold text-ink">
                      {formatPrice(method === 'pix' ? Math.round(totals.total * 0.95) : totals.total)}
                    </span>
                    {totals.savings > 0 ? (
                      <Badge variant="success" className="self-start">
                        Economia de {formatPrice(totals.savings)}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="ghost" size="lg" onClick={() => goTo('pagamento')}>
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Button>
                  <Button type="button" size="lg" loading={submitting} onClick={submitOrder}>
                    <Lock className="size-4" />
                    Finalizar compra
                  </Button>
                </div>
              </div>
            ) : null}
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="lg:sticky lg:top-28 lg:h-fit">
        <OrderSummary
          lines={lines}
          totals={totals}
          couponCode={couponCode}
          shippingLabel={shipping.name}
        />
      </div>
    </div>
  );
}

function ReviewBlock({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: string[];
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-ink/2 p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{title}</span>
        <button
          type="button"
          onClick={onEdit}
          className="text-2xs font-semibold uppercase tracking-wider text-ink-faint transition-colors hover:text-brand-300"
        >
          Editar
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {rows.filter(Boolean).map((row) => (
          <span key={row} className="text-xs text-ink-muted">
            {row}
          </span>
        ))}
      </div>
    </div>
  );
}
