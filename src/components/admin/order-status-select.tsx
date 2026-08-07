'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { OrderStatus } from '@/core/domain/entities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_META } from '@/components/account/order-card';

const OPTIONS: OrderStatus[] = [
  'aguardando-pagamento',
  'pago',
  'separando',
  'enviado',
  'entregue',
  'cancelado',
];

export function OrderStatusSelect({
  orderId,
  status,
  compact,
}: {
  orderId: string;
  status: OrderStatus;
  compact?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState<OrderStatus>(status);
  const [pending, startTransition] = React.useTransition();

  const update = async (next: string) => {
    const previous = value;
    setValue(next as OrderStatus);

    const response = await fetch('/api/admin/pedidos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: next }),
    });

    if (!response.ok) {
      setValue(previous);
      toast.error('Não foi possível atualizar o status.');
      return;
    }

    toast.success('Status atualizado', {
      description: `Pedido agora está como "${STATUS_META[next as OrderStatus].label}".`,
    });
    startTransition(() => router.refresh());
  };

  return (
    <Select value={value} onValueChange={update} disabled={pending}>
      {/* No compacto o gatilho encolhe só a partir de md: mudar o status de um
          pedido é ação de verdade e no celular precisa dos 44px. */}
      <SelectTrigger
        className={compact ? 'w-44 text-xs md:h-9' : 'w-56'}
        aria-label="Alterar status do pedido"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {STATUS_META[option].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
