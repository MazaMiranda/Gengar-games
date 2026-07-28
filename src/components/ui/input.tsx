'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-md border border-line bg-white/3 px-4 text-sm text-ink placeholder:text-ink-ghost outline-none transition-all duration-300 ease-out-expo focus:border-brand-400/60 focus:bg-white/5 focus:shadow-[0_0_0_3px_rgba(147,51,234,0.14)] disabled:opacity-50';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-ink-faint">
            {icon}
          </span>
          <input
            ref={ref}
            className={cn(fieldBase, 'h-12 pl-11', invalid && 'border-danger/60 focus:border-danger', className)}
            aria-invalid={invalid}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(fieldBase, 'h-12', invalid && 'border-danger/60 focus:border-danger', className)}
        aria-invalid={invalid}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, 'min-h-28 resize-y py-3', invalid && 'border-danger/60', className)}
    aria-invalid={invalid}
    {...props}
  />
));
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

/** Agrupa rótulo, controle, dica e erro com o mesmo ritmo vertical. */
export function Field({ label, hint, error, required, htmlFor, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="ml-1 text-brand-300">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
