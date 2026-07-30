import { cn } from '@/lib/utils';

/** Camada de atmosfera: névoas roxas em movimento lento atrás do conteúdo. */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {/*
        Sem filter: blur() de propósito.

        Estas camadas passam de 800px cada e ficam animadas em loop; um blur de
        120–140px sobre elas obriga o compositor a refiltrar ~2 megapixels por
        camada a cada quadro. Como a forma já é um radial-gradient — suave por
        construção — o blur quase não mudava o resultado visual. A suavidade
        agora vem só das paradas do gradiente, de graça.
      */}
      <div
        className="absolute -left-[15%] -top-[30%] size-[60vw] rounded-full animate-drift"
        style={{
          background: 'radial-gradient(circle, rgba(109,40,217,0.42) 0%, rgba(109,40,217,0.16) 38%, transparent 72%)',
          opacity: 0.85 * intensity,
        }}
      />
      <div
        className="absolute -right-[10%] top-[6%] size-[45vw] rounded-full animate-drift [animation-delay:-8s]"
        style={{
          background: 'radial-gradient(circle, rgba(147,51,234,0.34) 0%, rgba(147,51,234,0.13) 40%, transparent 72%)',
          opacity: 0.8 * intensity,
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[25%] size-[52vw] rounded-full animate-drift [animation-delay:-15s]"
        style={{
          background: 'radial-gradient(circle, rgba(192,132,252,0.2) 0%, rgba(192,132,252,0.08) 42%, transparent 74%)',
          opacity: 0.7 * intensity,
        }}
      />
    </div>
  );
}
