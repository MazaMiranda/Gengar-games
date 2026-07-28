import type { Repositories } from '@/core/ports/repositories';
import { createInMemoryRepositories } from './repositories/in-memory';

let cached: Repositories | null = null;

/**
 * Ponto único de resolução de dependências.
 * Com DATABASE_URL configurada, usa PostgreSQL via Prisma; sem ela, a loja roda
 * inteira sobre o catálogo seed em memória (útil em preview, CI e demonstração).
 */
export async function getRepositories(): Promise<Repositories> {
  if (cached) return cached;

  if (process.env.DATABASE_URL) {
    try {
      const { createPrismaRepositories } = await import('./repositories/prisma');
      cached = createPrismaRepositories();
      return cached;
    } catch (error) {
      console.warn('[gengar] Prisma indisponível, usando catálogo em memória.', error);
    }
  }

  cached = createInMemoryRepositories();
  return cached;
}

export const usingDatabase = () => Boolean(process.env.DATABASE_URL);
