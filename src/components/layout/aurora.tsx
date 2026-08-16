import { cn } from '@/lib/utils';

/**
 * Camada de atmosfera: varredura de luz prismática, lenta, atrás do
 * conteúdo — a mesma física do holo, só que grande o bastante pra cobrir a
 * página, como se uma fonte de luz passasse devagar sobre a loja inteira.
 *
 * Antes eram três névoas roxas paradas (nebulosa de arcade). Aqui são
 * faixas diagonais estreitas que atravessam o viewport em loop — a leitura
 * é "luz varrendo uma superfície", não "atmosfera ambiente".
 */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      // --t-aurora-strength derruba a intensidade no tema claro, onde a
      // banda prismática satura demais sobre branco.
      style={{ opacity: 'var(--t-aurora-strength)' }}
      aria-hidden
    >
      {/*
        Sem filter: blur() de propósito — mesmo motivo de sempre: a faixa já
        nasce suave pelas paradas do gradiente, então refiltrar a cada
        quadro só custaria quadro sem mudar o resultado visual.
      */}
      {/*
        Sem dourado na névoa ambiente: roxo+dourado sob backdrop-filter
        saturate(150%) (o "glass" dos botões secundários) misturava pra um
        marrom sujo, não pra luz de foil. Dourado fica reservado pro
        primeiro plano (holo, sweep) — aqui só a família roxo→magenta→ciano,
        que é análoga e não suja o vidro por trás.
      */}
      <div
        className="animate-drift absolute -top-1/4 -left-1/3 h-[46vw] w-[140vw] rotate-[-14deg]"
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, rgba(147,51,234,0.26) 34%, rgba(232,57,156,0.18) 58%, rgba(77,216,240,0.14) 80%, transparent 100%)',
          opacity: 0.85 * intensity,
        }}
      />
      <div
        className="animate-drift absolute top-[38%] -right-1/3 h-[34vw] w-[130vw] rotate-[-14deg] [animation-delay:-11s]"
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, rgba(77,216,240,0.14) 30%, rgba(147,51,234,0.2) 58%, rgba(232,57,156,0.14) 82%, transparent 100%)',
          opacity: 0.65 * intensity,
        }}
      />
    </div>
  );
}
