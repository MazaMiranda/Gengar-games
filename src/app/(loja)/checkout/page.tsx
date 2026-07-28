import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getRepositories } from '@/infrastructure/container';
import { PageHeader } from '@/components/layout/page-header';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Finalize sua compra na Gengar Games com pagamento seguro.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();

  // Cliente logado já chega com os campos preenchidos.
  let defaults;
  if (session?.user?.id) {
    const { users } = await getRepositories();
    const user = await users.findById(session.user.id);
    const address = user?.addresses.find((item) => item.isDefault) ?? user?.addresses[0];

    defaults = {
      name: user?.name,
      email: user?.email,
      document: user?.document,
      phone: user?.phone,
      address: address
        ? {
            recipient: address.recipient,
            zip: address.zip,
            street: address.street,
            number: address.number,
            complement: address.complement,
            district: address.district,
            city: address.city,
            state: address.state,
          }
        : undefined,
    };
  }

  return (
    <>
      <PageHeader
        compact
        eyebrow="Checkout"
        title="Finalizar compra"
        description="Quatro passos rápidos. Seus dados são usados apenas para processar este pedido."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Checkout' }]}
      />

      <div className="container-page py-12">
        <CheckoutFlow defaults={defaults} />
      </div>
    </>
  );
}
