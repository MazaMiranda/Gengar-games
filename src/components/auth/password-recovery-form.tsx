'use client';

import { EnvelopeSimple, PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';

const schema = z.object({ email: z.string().email('E-mail inválido.') });
type FormValues = z.infer<typeof schema>;

export function PasswordRecoveryForm() {
  const [sent, setSent] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    // O envio real acontece no provedor de e-mail; a resposta é sempre neutra
    // para não revelar quais endereços existem na base.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSent(values.email);
  };

  if (sent) {
    return (
      <div className="border-success/25 bg-success/8 flex flex-col gap-4 rounded-lg border p-6">
        <EnvelopeSimple className="text-success size-6" />
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-ink text-sm font-semibold">Link enviado</p>
          <p className="text-ink-muted text-xs leading-relaxed">
            Se existir uma conta para <strong className="text-ink">{sent}</strong>, o link de
            redefinição chega em alguns minutos. Verifique também a caixa de spam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Field
        label="E-mail cadastrado"
        required
        error={errors.email?.message}
        htmlFor="recover-email"
      >
        <Input
          id="recover-email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </Field>
      <Button type="submit" size="lg" block loading={isSubmitting}>
        <PaperPlaneTilt className="size-4" />
        Enviar link de recuperação
      </Button>
    </form>
  );
}
