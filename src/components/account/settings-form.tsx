'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Save, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Separator, Switch } from '@/components/ui/controls';
import { identificationSchema, masks, type IdentificationInput } from '@/lib/validators';

const PREFERENCES = [
  { id: 'restock', label: 'Alertas de restock dos meus favoritos', defaultOn: true },
  { id: 'drops', label: 'Novidades e pré-vendas de TCG', defaultOn: true },
  { id: 'promos', label: 'Cupons e campanhas promocionais', defaultOn: true },
  { id: 'orders', label: 'Atualizações de pedido por WhatsApp', defaultOn: false },
];

export function AccountSettingsForm({ defaults }: { defaults: IdentificationInput }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<IdentificationInput>({
    resolver: zodResolver(identificationSchema),
    defaultValues: defaults,
  });

  const onSubmit = async () => {
    // A persistência entra no repositório de usuários; o formulário já entrega
    // os dados validados no formato do domínio.
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success('Dados atualizados', { description: 'Suas informações foram salvas.' });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="plate flex flex-col gap-6 rounded-xl p-6" noValidate>
        <h2 className="font-display text-sm font-bold text-ink">Dados cadastrais</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome completo" required error={errors.name?.message} className="sm:col-span-2">
            <Input {...register('name')} />
          </Field>
          <Field label="E-mail" required error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </Field>
          <Field label="Telefone" required error={errors.phone?.message}>
            <Input
              inputMode="numeric"
              {...register('phone', {
                onChange: (event) => {
                  event.target.value = masks.phone(event.target.value);
                },
              })}
            />
          </Field>
          <Field label="CPF" required error={errors.document?.message}>
            <Input
              inputMode="numeric"
              {...register('document', {
                onChange: (event) => {
                  event.target.value = masks.cpf(event.target.value);
                },
              })}
            />
          </Field>
        </div>

        <Button type="submit" className="self-start" loading={isSubmitting} disabled={!isDirty}>
          <Save className="size-4" />
          Salvar alterações
        </Button>
      </form>

      <section className="plate flex flex-col gap-5 rounded-xl p-6">
        <h2 className="font-display text-sm font-bold text-ink">Comunicação</h2>
        <div className="flex flex-col gap-1">
          {PREFERENCES.map((preference, index) => (
            <React.Fragment key={preference.id}>
              {index > 0 ? <Separator /> : null}
              <label className="flex cursor-pointer items-center justify-between gap-6 py-3.5">
                <span className="text-sm text-ink-muted">{preference.label}</span>
                <Switch defaultChecked={preference.defaultOn} />
              </label>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="plate flex flex-col gap-5 rounded-xl p-6">
        <h2 className="font-display text-sm font-bold text-ink">Segurança</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
              <KeyRound className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Senha</p>
              <p className="text-2xs text-ink-faint">Recomendamos trocar a cada 6 meses.</p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Alterar senha
          </Button>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md border border-danger/25 bg-danger/8 text-danger">
              <ShieldAlert className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Excluir conta</p>
              <p className="text-2xs text-ink-faint">
                Remove seus dados pessoais. O histórico fiscal é mantido por obrigação legal.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-danger hover:border-danger/50 hover:bg-danger/8">
            Excluir
          </Button>
        </div>
      </section>
    </div>
  );
}
