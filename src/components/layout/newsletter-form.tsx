'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
});

type FormValues = z.infer<typeof schema>;

export function NewsletterForm() {
  const [subscribed, setSubscribed] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      toast.error('Não foi possível cadastrar', { description: 'Tente novamente em instantes.' });
      return;
    }

    setSubscribed(true);
    reset();
    toast.success('Inscrição confirmada', {
      description: 'Você receberá os lançamentos e drops antes de todo mundo.',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="eyebrow">Newsletter</h3>
      <p className="text-sm leading-relaxed text-ink-muted">
        Pré-vendas, restocks e cupons antes de irem para o site.
      </p>

      {subscribed ? (
        <div className="flex items-center gap-2.5 rounded-md border border-success/30 bg-success/8 px-4 py-3">
          <Check className="size-4 text-success" />
          <p className="text-xs text-ink-muted">Tudo certo! Confira sua caixa de entrada.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2" noValidate>
          <div className="relative">
            <Input
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              invalid={Boolean(errors.email)}
              aria-label="Seu e-mail"
              className="h-12 pr-12"
              {...register('email')}
            />
            <Button
              type="submit"
              size="icon-sm"
              loading={isSubmitting}
              className="absolute right-1.5 top-1.5"
              aria-label="Inscrever"
            >
              {!isSubmitting ? <ArrowRight className="size-4" /> : null}
            </Button>
          </div>
          {errors.email ? <p className="text-xs text-danger">{errors.email.message}</p> : null}
          <p className="text-2xs leading-relaxed text-ink-ghost">
            Ao assinar você concorda em receber e-mails da Gengar Games. Cancele quando quiser.
          </p>
        </form>
      )}
    </div>
  );
}
