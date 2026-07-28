import { cn } from '@/lib/utils';

/** Camada de atmosfera: névoas roxas em movimento lento atrás do conteúdo. */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className="absolute -left-[15%] -top-[30%] size-[60vw] rounded-full blur-[120px] animate-drift"
        style={{
          background: 'radial-gradient(circle, rgba(109,40,217,0.42) 0%, transparent 68%)',
          opacity: 0.85 * intensity,
        }}
      />
      <div
        className="absolute -right-[10%] top-[6%] size-[45vw] rounded-full blur-[130px] animate-drift [animation-delay:-8s]"
        style={{
          background: 'radial-gradient(circle, rgba(147,51,234,0.34) 0%, transparent 66%)',
          opacity: 0.8 * intensity,
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[25%] size-[52vw] rounded-full blur-[140px] animate-drift [animation-delay:-15s]"
        style={{
          background: 'radial-gradient(circle, rgba(192,132,252,0.2) 0%, transparent 70%)',
          opacity: 0.7 * intensity,
        }}
      />
    </div>
  );
}
