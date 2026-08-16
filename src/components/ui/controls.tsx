'use client';

import { Check, Minus, Plus } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer border-line-strong bg-ink/4 ease-out-expo hover:border-brand-400/60 data-[state=checked]:border-brand-400 data-[state=checked]:bg-brand-500 data-[state=checked]:shadow-glow-sm grid size-[18px] shrink-0 place-items-center rounded-xs border transition-all duration-200',
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
      'border-line-strong bg-ink/4 hover:border-brand-400/60 data-[state=checked]:border-brand-400 data-[state=checked]:shadow-glow-sm grid size-[18px] shrink-0 place-items-center rounded-full border transition-all duration-200',
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="bg-brand-400 size-2 rounded-full" />
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
      'peer border-line-strong bg-ink/6 ease-out-expo data-[state=checked]:border-brand-400/60 data-[state=checked]:bg-brand-500/80 data-[state=checked]:shadow-glow-sm inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-all duration-300',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="ease-out-expo pointer-events-none block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-300 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none items-center py-2 select-none', className)}
    {...props}
  >
    <SliderPrimitive.Track className="bg-ink/8 relative h-1 w-full grow overflow-hidden rounded-full">
      <SliderPrimitive.Range className="from-brand-600 to-brand-400 absolute h-full bg-linear-to-r" />
    </SliderPrimitive.Track>
    {(props.value ?? props.defaultValue ?? [0]).map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        className="border-brand-300 bg-void shadow-glow-sm focus-visible:ring-brand-400/50 block size-4 rounded-full border-2 transition-transform duration-200 hover:scale-115 focus-visible:ring-2 focus-visible:outline-none"
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
      'bg-line shrink-0',
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
        'border-line bg-ink/3 inline-flex items-center overflow-hidden rounded-md border',
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
          'text-ink-muted hover:bg-ink/8 hover:text-ink grid place-items-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent',
          button,
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn(
          'font-tech text-ink grid min-w-10 place-items-center font-semibold tabular-nums',
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
          'text-ink-muted hover:bg-ink/8 hover:text-ink grid place-items-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent',
          button,
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
