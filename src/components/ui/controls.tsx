'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { Check, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer grid size-[18px] shrink-0 place-items-center rounded-xs border border-line-strong bg-ink/4 transition-all duration-200 ease-out-expo hover:border-brand-400/60 data-[state=checked]:border-brand-400 data-[state=checked]:bg-brand-500 data-[state=checked]:shadow-glow-sm',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="text-white">
      <Check className="size-3 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-3', className)} {...props} />
));
RadioGroup.displayName = 'RadioGroup';

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'grid size-[18px] shrink-0 place-items-center rounded-full border border-line-strong bg-ink/4 transition-all duration-200 hover:border-brand-400/60 data-[state=checked]:border-brand-400 data-[state=checked]:shadow-glow-sm',
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-brand-400" />
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = 'RadioGroupItem';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-line-strong bg-ink/6 p-0.5 transition-all duration-300 ease-out-expo data-[state=checked]:border-brand-400/60 data-[state=checked]:bg-brand-500/80 data-[state=checked]:shadow-glow-sm',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out-expo data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center py-2', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-ink/8">
      <SliderPrimitive.Range className="absolute h-full bg-linear-to-r from-brand-600 to-brand-400" />
    </SliderPrimitive.Track>
    {(props.value ?? props.defaultValue ?? [0]).map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        className="block size-4 rounded-full border-2 border-brand-300 bg-void shadow-glow-sm transition-transform duration-200 hover:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = 'Slider';

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-line',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
));
Separator.displayName = 'Separator';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/** Controle de quantidade usado no carrinho e na página de produto. */
export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const dimension = size === 'sm' ? 'h-9' : 'h-12';
  const button = size === 'sm' ? 'size-9' : 'size-12';

  return (
    <div
      className={cn(
        'inline-flex items-center overflow-hidden rounded-md border border-line bg-ink/3',
        dimension,
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
        className={cn(
          'grid place-items-center text-ink-muted transition-colors hover:bg-ink/8 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent',
          button,
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn(
          'grid min-w-10 place-items-center font-tech font-semibold tabular-nums text-ink',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className={cn(
          'grid place-items-center text-ink-muted transition-colors hover:bg-ink/8 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent',
          button,
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
