'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSession, signIn } from 'next-auth/react';
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

  /*
   * Quando a pessoa foi mandada para cá por uma página protegida, o destino é
   * essa página — respeitar isso vem antes de qualquer preferência por perfil.
   * Sem callbackUrl, o destino depende de quem entrou: ver `destinoPadrao`.
   */
  const callbackUrl = searchParams.get('callbackUrl');

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

    /*
     * O papel só existe na sessão, que o signIn com redirect:false não devolve
     * — daí o getSession logo depois. Administrador entra para trabalhar no
     * catálogo, então cai no painel; a área de cliente continua acessível por
     * /conta para quem quiser.
     */
    const session = await getSession();
    const destinoPadrao = session?.user?.role === 'admin' ? '/admin' : '/conta';

    toast.success('Bem-vindo de volta!');
    router.push(callbackUrl ?? destinoPadrao);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-title text-ink font-bold">Entrar na Gengar Games</h1>
          <span className="cert-label">Acessar conta</span>
        </div>
        <p className="text-ink-muted text-sm">
          Acompanhe pedidos, favoritos e cupons em um só lugar.
        </p>
      </header>

      {failed ? (
        <div
          role="alert"
          className="border-danger/30 bg-danger/8 flex items-start gap-3 rounded-md border px-4 py-3"
        >
          <AlertCircle className="text-danger mt-0.5 size-4 shrink-0" />
          <p className="text-ink-muted text-xs leading-relaxed">
            E-mail ou senha incorretos. Verifique os dados e tente novamente.
          </p>
        </div>
      ) : null}

      {/*
        method="post" mesmo o envio sendo por JS.
        Formulário sem método faz GET, e GET põe cada campo na barra de
        endereço. Se o JS ainda não hidratou quando a pessoa aperta enter — ou
        se falhou de vez —, o navegador envia sozinho e a senha vai parar na
        URL, no histórico e no log do servidor. Com post, o pior caso é um
        erro de método; nada vaza.
      */}
      <form
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
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
              className="text-ink-faint hover:text-ink absolute top-1/2 right-1.5 grid size-11 -translate-y-1/2 place-items-center rounded-sm transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-4">
          <label className="text-ink-muted flex cursor-pointer items-center gap-2.5 text-xs">
            <Checkbox defaultChecked />
            Manter conectado
          </label>
          <Link
            href="/login/recuperar"
            className="text-brand-300 hover:text-brand-200 -my-2.5 py-2.5 text-xs font-semibold transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" size="lg" block loading={isSubmitting}>
          <LogIn className="size-4" />
          Entrar
        </Button>
      </form>

      <div className="border-line bg-ink/2 flex flex-col gap-3 rounded-lg border p-5">
        <p className="font-tech text-2xs text-ink-faint tracking-[0.18em] uppercase">
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
              className="border-line text-ink-muted hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-ink h-9 rounded-sm border px-3.5 text-xs font-medium transition-all"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-ink-muted text-center text-sm">
        Ainda não tem conta?{' '}
        <Link
          href="/cadastro"
          className="text-brand-300 hover:text-brand-200 -my-2.5 inline-block py-2.5 font-semibold transition-colors"
        >
          Criar cadastro
        </Link>
      </p>
    </div>
  );
}
