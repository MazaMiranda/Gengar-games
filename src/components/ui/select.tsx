'use client';

import { CaretDown, Check } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { useFieldProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  // Herda id/erro/descrição do Field que envolve o campo, igual ao Input.
  const a11y = useFieldProps({
    id: props.id,
    'aria-describedby': props['aria-describedby'],
  });

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      id={a11y.id}
      aria-invalid={a11y.invalid || undefined}
      aria-describedby={a11y.describedBy}
      className={cn(
        'focus-halo group border-line bg-ink/3 text-ink ease-out-expo hover:border-line-strong data-[placeholder]:text-ink-faint flex h-11 w-full items-center justify-between gap-3 rounded-md border px-4 text-sm transition-all duration-300',
        a11y.invalid && 'border-danger/60',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDown className="text-ink-faint size-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'glass-solid shadow-lift relative z-50 max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg p-1.5',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        position === 'popper' && 'data-[side=bottom]:translate-y-2 data-[side=top]:-translate-y-2',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-0">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'text-ink-muted data-[highlighted]:bg-brand-500/15 data-[highlighted]:text-ink data-[state=checked]:text-brand-200 relative flex cursor-pointer items-center rounded-sm py-2.5 pr-9 pl-3 text-sm transition-colors duration-200 outline-none select-none',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="absolute right-3 grid size-4 place-items-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="text-brand-300 size-3.5" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      'font-tech text-2xs text-ink-faint px-3 py-2 tracking-[0.2em] uppercase',
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';
