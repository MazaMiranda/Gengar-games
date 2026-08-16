import { Plus } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';
import { getAdminCoupons } from '@/core/application/admin-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Cupons' };

const TYPE_LABEL = {
  percent: 'Percentual',
  fixed: 'Valor fixo',
  shipping: 'Frete grátis',
} as const;

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  const active = coupons.filter((coupon) => coupon.active).length;

  return (
    <AdminPage
      title="Cupons"
      description={`${coupons.length} cupons cadastrados · ${active} ativos.`}
      actions={
        <Button size="sm">
          <Plus className="size-4" />
          Novo cupom
        </Button>
      }
    >
      <AdminCard bodyClassName="p-0">
        <DataTable
          rows={coupons}
          getKey={(coupon) => coupon.code}
          columns={[
            {
              key: 'code',
              header: 'Código',
              render: (coupon) => (
                <span className="font-tech text-ink text-xs font-bold tracking-[0.14em] uppercase">
                  {coupon.code}
                </span>
              ),
            },
            {
              key: 'type',
              header: 'Tipo',
              render: (coupon) => (
                <Badge variant="neutral" size="sm">
                  {TYPE_LABEL[coupon.type]}
                </Badge>
              ),
            },
            {
              key: 'value',
              header: 'Benefício',
              render: (coupon) => (
                <span className="text-brand-200 text-xs font-semibold">
                  {coupon.type === 'percent'
                    ? `${coupon.value}% off`
                    : coupon.type === 'shipping'
                      ? 'Frete grátis'
                      : `${formatPrice(coupon.value)} off`}
                </span>
              ),
            },
            {
              key: 'min',
              header: 'Mínimo',
              align: 'right',
              render: (coupon) => (
                <span className="text-xs">
                  {coupon.minSubtotal > 0 ? formatPrice(coupon.minSubtotal) : '—'}
                </span>
              ),
            },
            {
              key: 'usage',
              header: 'Uso',
              align: 'center',
              render: (coupon) => (
                <div className="flex flex-col items-center gap-1">
                  <span className="font-tech text-2xs text-ink">
                    {coupon.usageCount}/{coupon.usageLimit || '∞'}
                  </span>
                  {coupon.usageLimit > 0 ? (
                    <span className="bg-ink/8 h-1 w-16 overflow-hidden rounded-full">
                      <span
                        className="from-brand-500 to-brand-300 block h-full rounded-full bg-linear-to-r"
                        style={{
                          width: `${Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100)}%`,
                        }}
                      />
                    </span>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'expires',
              header: 'Validade',
              render: (coupon) => <span className="text-xs">{formatDate(coupon.expiresAt)}</span>,
            },
            {
              key: 'status',
              header: 'Status',
              align: 'right',
              render: (coupon) => (
                <Badge variant={coupon.active ? 'success' : 'neutral'} size="sm">
                  {coupon.active ? 'Ativo' : 'Encerrado'}
                </Badge>
              ),
            },
          ]}
        />
      </AdminCard>
    </AdminPage>
  );
}
