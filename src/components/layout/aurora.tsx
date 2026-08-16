import { cn } from '@/lib/utils';

/**
 * Luz de vitrine: duas lavagens largas e lentas atrás do conteúdo.
 *
 * A direção anterior varria faixas prismáticas (violeta, magenta e ciano ao
 * mesmo tempo) porque a tese era difração de foil. Nesta, a página tem um
 * acento só, então a atmosfera também: dois panos do mesmo violeta, muito
 * fracos, só para o fundo não ser papel morto.
 *
 * A cor sai de --color-brand-500 via color-mix em vez de rgba cravado — era
 * o último lugar do site onde o acento não obedecia ao token, e por isso o
 * fundo continuava roxo-neon depois de a marca inteira ter dessaturado.
 */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      // --t-aurora-strength derruba a intensidade no tema claro, onde o
      // acento satura muito mais rápido sobre papel do que sobre off-black.
      style={{ opacity: 'var(--t-aurora-strength)' }}
      aria-hidden
    >
      {/*
        Sem filter: blur(). A faixa já nasce suave pelas paradas do gradiente,
        então refiltrar a cada quadro custaria quadro sem mudar o resultado.
        Só translação anima (ver o keyframe drift): escalar camada borrada
        obriga o navegador a re-rasterizar o blur a cada frame.
      */}
      <div
        className="animate-drift absolute -top-1/4 -left-1/3 h-[46vw] w-[140vw] rotate-[-14deg]"
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, color-mix(in srgb, var(--color-brand-500) 18%, transparent) 42%, color-mix(in srgb, var(--color-brand-400) 12%, transparent) 72%, transparent 100%)',
          opacity: 0.8 * intensity,
        }}
      />
      <div
        className="animate-drift absolute top-[38%] -right-1/3 h-[34vw] w-[130vw] rotate-[-14deg] [animation-delay:-11s]"
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, color-mix(in srgb, var(--color-brand-400) 10%, transparent) 38%, color-mix(in srgb, var(--color-brand-500) 14%, transparent) 70%, transparent 100%)',
          opacity: 0.6 * intensity,
        }}
      />
    </div>
  );
}
