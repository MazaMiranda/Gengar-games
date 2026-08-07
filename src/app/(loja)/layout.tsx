import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/shop/cart-drawer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Header />
      {/* tabIndex -1 para o salto do skip link também mover o foco, e não só a rolagem */}
      <main id="conteudo" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
