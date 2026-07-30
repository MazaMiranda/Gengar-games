'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { AlertCircle, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/controls';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { cn } from '@/lib/utils';

/** Força da senha em quatro níveis — feedback imediato, sem bloquear o envio. */
function strengthOf(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABEL = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
const STRENGTH_TONE = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = watch('password') ?? '';
  const score = strengthOf(password);

  const onSubmit = async (values: RegisterInput) => {
    setError(null);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      setError(data.message ?? 'Não foi possível criar sua conta.');
      return;
    }

    await signIn('credentials', { email: values.email, password: values.password, redirect: false });
    toast.success('Conta criada!', { description: 'Bem-vindo à Gengar Games.' });
    router.push('/conta');
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Criar conta</span>
        <h1 className="text-title font-bold text-ink">Comece sua coleção</h1>
        <p className="text-sm text-ink-muted">
          Leva menos de um minuto e libera cupons exclusivos de primeira compra.
        </p>
      </header>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-danger/30 bg-danger/8 px-4 py-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
          <p className="text-xs leading-relaxed text-ink-muted">{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field label="Nome completo" required error={errors.name?.message} htmlFor="name">
          <Input id="name" autoComplete="name" placeholder="Ana Beatriz Lopes" invalid={Boolean(errors.name)} {...register('name')} />
        </Field>

        <Field label="E-mail" required error={errors.email?.message} htmlFor="reg-email">
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label="Senha" required error={errors.password?.message} htmlFor="reg-password">
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        {password ? (
          <div className="-mt-2 flex flex-col gap-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-300',
                    index < score ? STRENGTH_TONE[score] : 'bg-ink/8',
                  )}
                />
              ))}
            </div>
            <p className="text-2xs text-ink-faint">
              Força da senha: <strong className="text-ink-muted">{STRENGTH_LABEL[score]}</strong>
            </p>
          </div>
        ) : null}

        <Field label="Confirmar senha" required error={errors.confirmPassword?.message} htmlFor="confirm">
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-muted">
            <Checkbox
              className="mt-0.5"
              onCheckedChange={(checked) =>
                setValue('acceptTerms', (checked === true) as true, { shouldValidate: true })
              }
            />
            <span>
              Li e aceito os{' '}
              <Link href="/institucional/termos" className="font-semibold text-brand-300 hover:text-brand-200">
                termos de uso
              </Link>{' '}
              e a{' '}
              <Link href="/institucional/privacidade" className="font-semibold text-brand-300 hover:text-brand-200">
                política de privacidade
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms ? (
            <p className="text-xs text-danger">{errors.acceptTerms.message}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" block loading={isSubmitting}>
          <UserPlus className="size-4" />
          Criar minha conta
        </Button>
      </form>

      <ul className="flex flex-col gap-2.5">
        {['Cupom de R$ 50 na primeira compra', 'Alertas de restock dos seus favoritos', 'Histórico de pedidos e rastreio'].map(
          (benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 text-xs text-ink-muted">
              <Check className="size-3.5 text-success" />
              {benefit}
            </li>
          ),
        )}
      </ul>

      <p className="text-center text-sm text-ink-muted">
        Já tem cadastro?{' '}
        <Link href="/login" className="font-semibold text-brand-300 transition-colors hover:text-brand-200">
          Entrar
        </Link>
      </p>
    </div>
  );
}
