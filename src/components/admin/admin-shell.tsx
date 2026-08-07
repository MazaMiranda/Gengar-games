import { cn } from '@/lib/utils';

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-bold text-ink">{title}</h1>
          {description ? <p className="text-xs text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function AdminCard({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    /*
     * min-w-0 é o que faz a DataTable caber.
     *
     * O card quase sempre é item de grid, e item de grid nasce com
     * min-width:auto — ou seja, se recusa a encolher abaixo do conteúdo. Com a
     * tabela pedindo 46rem, o card inteiro esticava para 738px e arrastava o
     * painel junto: numa tela de 375px o /admin rolava para o lado. O
     * overflow-x-auto da tabela já existia, mas não tinha como agir enquanto o
     * pai crescia atrás dele.
     */
    <section className={cn('plate flex min-w-0 flex-col rounded-xl', className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render: (row: T) => React.ReactNode;
}

/**
 * Tabela padrão do admin — responsiva por rolagem horizontal contida.
 *
 * O ritmo aqui é de painel de operação, não de página de marketing: a linha
 * existe para ser varrida aos montes. Com py-4 ela media 73px para um texto de
 * 12px, e cabiam 6 produtos na tela; o respiro custava mais rolagem do que
 * entregava em conforto.
 */
export function DataTable<T>({
  columns,
  rows,
  getKey,
  empty = 'Nenhum registro encontrado.',
}: {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  empty?: string;
}) {
  if (!rows.length) {
    return <p className="px-4 py-10 text-center text-sm text-ink-faint">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: column.width }}
                className={cn(
                  'px-4 py-2 font-tech text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getKey(row)}
              className="border-b border-line transition-colors last:border-b-0 hover:bg-ink/3"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-2 align-middle text-sm text-ink-muted',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
