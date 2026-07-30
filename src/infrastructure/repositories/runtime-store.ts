import type { Product } from '@/core/domain/entities';

/**
 * Produtos cadastrados em tempo de execução no modo sem banco.
 *
 * Mora em globalThis de propósito: o Next compila rotas e páginas como entradas
 * separadas e pode instanciar o mesmo módulo mais de uma vez no processo, e aí
 * cada cópia teria seu próprio array — um produto cadastrado pela rota admin
 * sumiria na busca. É o mesmo motivo pelo qual o cliente Prisma é um singleton
 * pendurado no global.
 *
 * A durabilidade continua sendo a do processo: reiniciou o servidor, foi embora.
 * Para persistir de verdade, configure DATABASE_URL e o container passa a
 * resolver os repositórios Prisma.
 */
const store = globalThis as typeof globalThis & { __gengarRuntimeProducts?: Product[] };

export const runtimeProducts: Product[] = (store.__gengarRuntimeProducts ??= []);

export function addRuntimeProduct(product: Product) {
  runtimeProducts.push(product);
  return product;
}
