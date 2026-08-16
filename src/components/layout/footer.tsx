import {
  ChatCircle,
  Envelope,
  InstagramLogo,
  MapPin,
  ShieldCheck,
  Truck,
  YoutubeLogo,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { footerNav, legalNav } from '@/lib/navigation';
import { NewsletterForm } from './newsletter-form';
import { Logo } from './logo';
import { BAIRRO_CIDADE, ENDERECO_CURTO, LOJA, whatsappUrl } from '@/lib/loja';

const guarantees = [
  {
    icon: ShieldCheck,
    title: 'Compra protegida',
    text: 'Pagamento criptografado e nota fiscal em todo pedido.',
  },
  { icon: Truck, title: 'Frete grátis', text: 'Acima de R$ 299 para todo o Brasil, com rastreio.' },
  {
    icon: ChatCircle,
    title: 'Suporte humano',
    text: 'Atendimento por WhatsApp de segunda a sábado.',
  },
];

const paymentMethods = ['Visa', 'Master', 'Elo', 'Amex', 'Pix', 'Boleto'];

export function Footer() {
  return (
    <footer className="border-line bg-surface/40 relative mt-24 overflow-hidden border-t">
      <div
        className="via-brand-500/60 pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent to-transparent"
        aria-hidden
      />

      {/* Garantias */}
      <div className="container-page border-line grid gap-6 border-b py-12 md:grid-cols-3">
        {guarantees.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="border-line bg-ink/3 text-brand-300 grid size-11 shrink-0 place-items-center rounded-md border">
              <Icon className="size-4.5" />
            </span>
            <div>
              <p className="font-display text-ink text-sm font-semibold">{title}</p>
              <p className="text-ink-muted mt-1 text-xs leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Logo />
          <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
            Curadoria de Trading Card Games, consoles e cultura gamer. Cada carta é conferida à mão
            e cada console sai testado da nossa bancada no {BAIRRO_CIDADE}.
          </p>

          <ul className="text-ink-muted flex flex-col gap-3 text-xs">
            <li className="flex items-center gap-2.5">
              <MapPin className="text-brand-400 size-3.5" />
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
                className="tap-44 hover:text-ink flex items-center gap-2.5 transition-colors"
              >
                <ChatCircle className="text-brand-400 size-3.5 shrink-0" />
                {LOJA.telefone}
                <span className="sr-only">— abrir conversa no WhatsApp</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${LOJA.email}`}
                className="tap-44 hover:text-ink flex items-center gap-2.5 transition-colors"
              >
                <Envelope className="text-brand-400 size-3.5 shrink-0" />
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
              className="tap-44 border-line text-ink-muted hover:border-brand-400/50 hover:text-brand-200 grid size-10 place-items-center rounded-md border transition-all duration-300"
            >
              <ChatCircle className="size-4" />
            </a>
            {[InstagramLogo, YoutubeLogo].map((Icon, index) => (
              <span
                key={index}
                aria-hidden
                className="border-line text-ink-ghost grid size-10 place-items-center rounded-md border"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        {footerNav.map((column) => (
          <nav
            key={column.title}
            className="flex flex-col gap-4 lg:col-span-2"
            aria-label={column.title}
          >
            <h3 className="eyebrow">{column.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  {/* min-h-11 no celular: estes links tinham 18px de altura,
                      abaixo do mínimo de 24px para alvo de toque (WCAG 2.5.8).
                      No desktop o cursor é preciso e a altura volta ao natural,
                      para o rodapé não inchar. */}
                  <Link
                    href={link.href}
                    className="text-ink-muted hover:text-brand-200 flex min-h-11 items-center text-sm transition-colors duration-300 sm:min-h-0"
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

      <div className="container-page border-line flex flex-col gap-5 border-t py-7 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
          <p className="text-2xs text-ink-faint">
            © {new Date().getFullYear()} {LOJA.nome} · CNPJ {LOJA.cnpj} · Todos os direitos
            reservados.
          </p>

          {/* Termos e privacidade ficavam sem link em lugar nenhum do site: as
              páginas existiam e entravam no sitemap, mas só chegava nelas quem
              digitasse a URL. O aceite do cadastro cita as duas — precisam ser
              alcançáveis de qualquer página. */}
          <nav
            aria-label="Links legais"
            className="border-line flex flex-wrap items-center gap-x-4 gap-y-1 md:border-l md:pl-5"
          >
            {legalNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-faint hover:text-ink-muted text-2xs flex min-h-11 items-center transition-colors duration-300 sm:min-h-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {paymentMethods.map((method) => (
            <span
              key={method}
              className="border-line bg-ink/3 font-tech text-ink-faint rounded-xs border px-2.5 py-1 text-[0.625rem] tracking-wider uppercase"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Wordmark de fundo */}
      <div
        className="pointer-events-none overflow-hidden text-center leading-none select-none"
        aria-hidden
      >
        <span className="from-ink/6 font-display block translate-y-[22%] bg-linear-to-b to-transparent bg-clip-text text-[18vw] font-extrabold tracking-tighter text-transparent">
          GENGAR
        </span>
      </div>
    </footer>
  );
}
