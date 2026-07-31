'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ImageDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SyncResponse {
  ok: boolean;
  message?: string;
  verificados?: number;
  atualizados?: number;
}

/**
 * Preenche a arte real das cartas cadastradas antes da integração com a
 * TCGdex existir (ou que ficaram sem correspondência na primeira tentativa).
 * Cadastro novo já busca sozinho; este botão é só para o catálogo existente.
 */
export function TcgdexSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const sync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tcgdex/sync', { method: 'POST' });
      const payload = (await response.json().catch(() => null)) as SyncResponse | null;

      if (!response.ok || !payload?.ok) {
        toast.error(payload?.message ?? 'Não foi possível sincronizar com a TCGdex.');
        return;
      }

      const { verificados = 0, atualizados = 0 } = payload;
      if (verificados === 0) {
        toast.success('Nada para sincronizar', {
          description: 'Todas as cartas cadastradas já têm foto.',
        });
      } else {
        toast.success('Sincronização concluída', {
          description: `${atualizados} de ${verificados} carta(s) ganharam a arte real da TCGdex.`,
        });
      }
      router.refresh();
    } catch {
      toast.error('Falha de rede ao falar com a TCGdex.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={sync} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <ImageDown className="size-4" />}
      Sincronizar fotos da TCGdex
    </Button>
  );
}
