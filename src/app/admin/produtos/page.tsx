import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAdminCatalog } from '@/core/application/admin-service';
import { listCategories } from '@/core/application/catalog-service';
import { AdminPage } from '@/components/admin/admin-shell';
import { ProductTable } from '@/components/admin/product-table';
import { TcgdexSyncButton } from '@/components/admin/tcgdex-sync-button';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Produtos' };

export default async function AdminProductsPage() {
  const [catalog, categories] = await Promise.all([getAdminCatalog(), listCategories()]);

  return (
    <AdminPage
      title="Produtos"
      description={`${catalog.total} itens cadastrados no catálogo.`}
      actions={
        <>
          <TcgdexSyncButton />
          <Button asChild size="sm">
            <Link href="/admin/produtos/novo">
              <Plus className="size-4" />
              Novo produto
            </Link>
          </Button>
        </>
      }
    >
      <ProductTable products={catalog.items} categories={categories} />
    </AdminPage>
  );
}
