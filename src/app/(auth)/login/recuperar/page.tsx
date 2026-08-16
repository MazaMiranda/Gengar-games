import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';

export const metadata: Metadata = {
  title: 'Recuperar senha',
  robots: { index: false, follow: false },
};

export default function RecoverPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-title font-bold text-ink">Esqueceu a senha?</h1>
          <span className="cert-label">Recuperar acesso</span>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">
          Informe o e-mail cadastrado e enviamos um link para você criar uma nova senha.
        </p>
      </header>

      <PasswordRecoveryForm />

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        Voltar para o login
      </Link>
    </div>
  );
}
