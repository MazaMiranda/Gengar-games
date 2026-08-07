import Link from 'next/link';
import { Instagram, Mail, MapPin, MessageCircle, ShieldCheck, Truck, Youtube } from 'lucide-react';
import { footerNav } from '@/lib/navigation';
import { NewsletterForm } from './newsletter-form';
import { Logo } from './logo';
import { BAIRRO_CIDADE, ENDERECO_CURTO, LOJA, whatsappUrl } from '@/lib/loja';

const guarantees = [
  { icon: ShieldCheck, title: 'Compra protegida', text: 'Pagamento criptografado e nota fiscal em todo pedido.' },
  { icon: Truck, title: 'Frete grátis', text: 'Acima de R$ 299 para todo o Brasil, com rastreio.' },
  { icon: MessageCircle, title: 'Suporte humano', text: 'Atendimento por WhatsApp de segunda a sábado.' },
];

const paymentMethods = ['Visa', 'Master', 'Elo', 'Amex', 'Pix', 'Boleto'];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-surface/40">
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-brand-500/60 to-transparent"
        aria-hidden
      />

      {/* Garantias */}
      <div className="container-page grid gap-6 border-b border-line py-12 md:grid-cols-3">
        {guarantees.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-md border border-line bg-ink/3 text-brand-300">
              <Icon className="size-4.5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-ink">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
            Curadoria de Trading Card Games, consoles e cultura gamer. Cada carta é conferida à mão e
            cada console sai testado da nossa bancada no {BAIRRO_CIDADE}.
          </p>

          <ul className="flex flex-col gap-3 text-xs text-ink-muted">
            <li className="flex items-center gap-2.5">
              <MapPin className="size-3.5 text-brand-400" />
              {ENDERECO_CURTO}
            </li>
            {/* O telefone abre a conversa no WhatsApp com a mensagem pronta —
                é por lá que a loja atende. O e-mail abre o cliente de correio.
                Ambos ao lado do ícone, que é onde o visitante tenta tocar. */}
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-44 flex items-center gap-2.5 transition-colors hover:text-ink"
              >
                <MessageCircle className="size-3.5 shrink-0 text-brand-400" />
                {LOJA.telefone}
                <span className="sr-only">— abrir conversa no WhatsApp</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${LOJA.email}`}
                className="tap-44 flex items-center gap-2.5 transition-colors hover:text-ink"
              >
                <Mail className="size-3.5 shrink-0 text-brand-400" />
                {LOJA.email}
              </a>
            </li>
          </ul>

          {/* O selo do WhatsApp é o único que leva a algum lugar hoje, então é
              o único que virou link — ícone com cara de botão que não faz nada
              é o tipo de coisa que o visitante testa primeiro. */}
          <div className="flex gap-2">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar com a loja no WhatsApp"
              className="tap-44 grid size-10 place-items-center rounded-md border border-line text-ink-muted transition-all duration-300 hover:border-brand-400/50 hover:text-brand-200"
            >
              <MessageCircle className="size-4" />
            </a>
            {[Instagram, Youtube].map((Icon, index) => (
              <span
                key={index}
                aria-hidden
                className="grid size-10 place-items-center rounded-md border border-line text-ink-ghost"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        {footerNav.map((column) => (
          <nav key={column.title} className="flex flex-col gap-4 lg:col-span-2" aria-label={column.title}>
            <h3 className="eyebrow">{column.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors duration-300 hover:text-brand-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="lg:col-span-2">
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page flex flex-col gap-5 border-t border-line py-7 md:flex-row md:items-center md:justify-between">
        <p className="text-2xs text-ink-faint">
          © {new Date().getFullYear()} {LOJA.nome} · CNPJ {LOJA.cnpj} · Todos os direitos
          reservados.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {paymentMethods.map((method) => (
            <span
              key={method}
              className="rounded-xs border border-line bg-ink/3 px-2.5 py-1 font-tech text-[0.625rem] uppercase tracking-wider text-ink-faint"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Wordmark de fundo */}
      <div
        className="pointer-events-none select-none overflow-hidden text-center leading-none"
        aria-hidden
      >
        <span className="block translate-y-[22%] bg-linear-to-b from-ink/6 to-transparent bg-clip-text font-display text-[18vw] font-extrabold tracking-tighter text-transparent">
          GENGAR
        </span>
      </div>
    </footer>
  );
}
