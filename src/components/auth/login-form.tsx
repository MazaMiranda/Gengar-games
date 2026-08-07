'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/controls';
import { loginSchema, type LoginInput } from '@/lib/validators';

const DEMO_ACCOUNTS = [
  { label: 'Cliente', email: 'cliente@gengargames.com.br' },
  { label: 'Administrador', email: 'admin@gengargames.com.br' },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const callbackUrl = searchParams.get('callbackUrl') ?? '/conta';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setFailed(false);
    const result = await signIn('credentials', { ...values, redirect: false });

    if (result?.error) {
      setFailed(true);
      return;
    }

    toast.success('Bem-vindo de volta!');
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Acessar conta</span>
        <h1 className="text-title font-bold text-ink">Entrar na Gengar Games</h1>
        <p className="text-sm text-ink-muted">
          Acompanhe pedidos, favoritos e cupons em um só lugar.
        </p>
      </header>

      {failed ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-danger/30 bg-danger/8 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
          <p className="text-xs leading-relaxed text-ink-muted">
            E-mail ou senha incorretos. Verifique os dados e tente novamente.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field label="E-mail" required error={errors.email?.message} htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label="Senha" required error={errors.password?.message} htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-12"
              invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-sm text-ink-faint transition-colors hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-xs text-ink-muted">
            <Checkbox defaultChecked />
            Manter conectado
          </label>
          <Link
            href="/login/recuperar"
            className="-my-2.5 py-2.5 text-xs font-semibold text-brand-300 transition-colors hover:text-brand-200"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" size="lg" block loading={isSubmitting}>
          <LogIn className="size-4" />
          Entrar
        </Button>
      </form>

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-ink/2 p-5">
        <p className="font-tech text-2xs uppercase tracking-[0.18em] text-ink-faint">
          Contas de demonstração · senha gengar123
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setValue('email', account.email);
                setValue('password', 'gengar123');
              }}
              className="h-9 rounded-sm border border-line px-3.5 text-xs font-medium text-ink-muted transition-all hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-ink"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-ink-muted">
        Ainda não tem conta?{' '}
        <Link
          href="/cadastro"
          className="-my-2.5 inline-block py-2.5 font-semibold text-brand-300 transition-colors hover:text-brand-200"
        >
          Criar cadastro
        </Link>
      </p>
    </div>
  );
}
