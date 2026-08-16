import { ArrowUpRight, Check } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { institutionalBySlug, institutionalPages } from '@/lib/institucional';
import { PageHeader } from '@/components/layout/page-header';
import { Reveal } from '@/components/ui/motion';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return institutionalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = institutionalBySlug.get(slug);
  if (!page) return { title: 'Página não encontrada' };

  return { title: page.title, description: page.description };
}

export default async function InstitutionalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = institutionalBySlug.get(slug);
  if (!page) notFound();

  const others = institutionalPages.filter((item) => item.slug !== slug);

  return (
    <>
      <PageHeader
        compact
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        crumbs={[{ label: 'Início', href: '/' }, { label: page.title }]}
      />

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_16rem] lg:gap-16">
        <article className="flex max-w-2xl flex-col gap-10">
          {page.sections.map((section, index) => (
            <Reveal
              key={section.heading}
              delay={index * 0.04}
              as="section"
              className="flex flex-col gap-4"
            >
              <h2 className="font-display text-ink text-lg font-bold">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-ink-muted text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className="flex flex-col gap-2.5 pt-1">
                  {section.list.map((item) => (
                    <li key={item} className="text-ink-muted flex items-start gap-3 text-sm">
                      <Check className="text-brand-400 mt-0.5 size-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
          ))}
        </article>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="plate flex flex-col gap-1 rounded-xl p-5">
            <span className="eyebrow mb-2">Outras páginas</span>
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/institucional/${item.slug}`}
                className="group text-ink-muted hover:bg-ink/4 hover:text-ink flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm transition-colors"
              >
                {item.title}
                <ArrowUpRight className="text-ink-ghost size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
