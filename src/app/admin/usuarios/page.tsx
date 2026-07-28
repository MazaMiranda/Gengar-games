import type { Metadata } from 'next';
import { getAdminUsers } from '@/core/application/admin-service';
import { AdminCard, AdminPage, DataTable } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Usuários' };

export default async function AdminUsersPage() {
  const rows = await getAdminUsers();
  const lifetime = rows.reduce((sum, row) => sum + row.lifetimeValue, 0);

  return (
    <AdminPage
      title="Usuários"
      description={`${rows.length} contas cadastradas · ${formatPrice(lifetime)} em valor histórico.`}
    >
      <AdminCard bodyClassName="p-0">
        <DataTable
          rows={rows}
          getKey={(row) => row.user.id}
          columns={[
            {
              key: 'user',
              header: 'Cliente',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-linear-to-br from-brand-500/35 to-brand-800/35 font-display text-2xs font-bold text-ink">
                    {row.user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-ink">{row.user.name}</span>
                    <span className="text-2xs text-ink-faint">{row.user.email}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Perfil',
              render: (row) => (
                <Badge variant={row.user.role === 'admin' ? 'brand' : 'neutral'} size="sm">
                  {row.user.role === 'admin' ? 'Administrador' : 'Cliente'}
                </Badge>
              ),
            },
            {
              key: 'since',
              header: 'Cliente desde',
              render: (row) => <span className="text-xs">{formatDate(row.user.createdAt)}</span>,
            },
            {
              key: 'orders',
              header: 'Pedidos',
              align: 'center',
              render: (row) => <span className="font-tech text-xs">{row.orderCount}</span>,
            },
            {
              key: 'points',
              header: 'Pontos',
              align: 'center',
              render: (row) => (
                <span className="font-tech text-xs text-brand-200">
                  {row.user.loyaltyPoints.toLocaleString('pt-BR')}
                </span>
              ),
            },
            {
              key: 'ltv',
              header: 'Valor histórico',
              align: 'right',
              render: (row) => (
                <span className="font-display text-sm font-bold text-ink">
                  {formatPrice(row.lifetimeValue)}
                </span>
              ),
            },
            {
              key: 'last',
              header: 'Último pedido',
              align: 'right',
              render: (row) => (
                <span className="text-xs text-ink-muted">
                  {row.lastOrderAt ? formatDate(row.lastOrderAt) : '—'}
                </span>
              ),
            },
          ]}
        />
      </AdminCard>
    </AdminPage>
  );
}
