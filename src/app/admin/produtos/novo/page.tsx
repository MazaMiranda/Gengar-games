import type { Metadata } from 'next';
import { listBrands, listCategories } from '@/core/application/catalog-service';
import { AdminPage } from '@/components/admin/admin-shell';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = { title: 'Novo produto' };

export default async function NovoProdutoPage() {
  const [categories, brands] = await Promise.all([listCategories(), listBrands()]);

  return (
    <AdminPage
      title="Novo produto"
      description="Cadastre um item no catálogo. Cartas avulsas pedem a ficha com coleção, raridade e estado."
    >
      <ProductForm categories={categories} brands={brands} />
    </AdminPage>
  );
}
