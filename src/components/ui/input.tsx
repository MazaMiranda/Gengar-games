'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const fieldBase =
  'focus-halo w-full rounded-md border border-line bg-ink/3 px-4 text-sm text-ink placeholder:text-ink-ghost transition-all duration-300 ease-out-expo focus:bg-ink/5 disabled:opacity-50';

/**
 * Contexto do Field.
 *
 * Existe para o rótulo, a dica e o erro chegarem ao controle sem que cada tela
 * repita id, htmlFor e aria-describedby na mão — que era justamente o que não
 * acontecia: de 49 campos do site, 33 tinham rótulo solto, sem vínculo com o
 * campo, e nenhuma mensagem de erro era anunciada por leitor de tela.
 */
interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** Props de acessibilidade que o controle herda do Field que o envolve. */
export function useFieldProps(own: {
  id?: string;
  invalid?: boolean;
  'aria-describedby'?: string;
}) {
  const field = React.useContext(FieldContext);
  if (!field) return { id: own.id, invalid: own.invalid, describedBy: own['aria-describedby'] };
  return {
    id: own.id ?? field.id,
    invalid: own.invalid ?? field.invalid,
    describedBy: own['aria-describedby'] ?? field.describedBy,
  };
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, icon, ...props }, ref) => {
    const a11y = useFieldProps({ id: props.id, invalid, 'aria-describedby': props['aria-describedby'] });
    const shared = {
      ref,
      id: a11y.id,
      'aria-invalid': a11y.invalid || undefined,
      'aria-describedby': a11y.describedBy,
    };

    if (icon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-ink-faint">
            {icon}
          </span>
          <input
            {...shared}
            className={cn(
              fieldBase,
              'h-12 pl-11',
              a11y.invalid && 'border-danger/60 focus:border-danger',
              className,
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        {...shared}
        className={cn(fieldBase, 'h-12', a11y.invalid && 'border-danger/60 focus:border-danger', className)}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => {
  const a11y = useFieldProps({ id: props.id, invalid, 'aria-describedby': props['aria-describedby'] });
  return (
    <textarea
      ref={ref}
      id={a11y.id}
      aria-invalid={a11y.invalid || undefined}
      aria-describedby={a11y.describedBy}
      className={cn(fieldBase, 'min-h-28 resize-y py-3', a11y.invalid && 'border-danger/60', className)}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'font-tech text-2xs font-semibold uppercase tracking-[0.18em] text-ink-muted',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Agrupa rótulo, controle, dica e erro com o mesmo ritmo vertical.
 *
 * O vínculo entre as três partes é automático: o Field gera um id, o rótulo
 * aponta para ele e o controle o adota, junto com o aria-describedby da dica
 * ou do erro. Passar `htmlFor` continua valendo para quem já tem id próprio.
 */
export function Field({ label, hint, error, required, htmlFor, className, children }: FieldProps) {
  const auto = React.useId();
  const id = htmlFor ?? auto;
  const errorId = `${id}-erro`;
  const hintId = `${id}-dica`;

  const context = React.useMemo(
    () => ({ id, invalid: Boolean(error), describedBy: error ? errorId : hint ? hintId : undefined }),
    [id, error, hint, errorId, hintId],
  );

  return (
    <FieldContext.Provider value={context}>
      <div className={cn('flex flex-col gap-2', className)}>
        {label ? (
          <Label htmlFor={id}>
            {label}
            {required ? (
              <span className="ml-1 text-brand-300" aria-hidden>
                *
              </span>
            ) : null}
            {required ? <span className="sr-only"> (obrigatório)</span> : null}
          </Label>
        ) : null}
        {children}
        {/* role=alert para o erro ser lido no momento em que aparece; sem isso a
            borda vermelha é a única pista, e leitor de tela não vê borda. */}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-ink-faint">
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
