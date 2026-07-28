'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PARAM, countActiveFilters, setParam, toggleParam } from '@/lib/catalog-params';

/** Estado dos filtros vive na URL — compartilhável, indexável e com histórico. */
export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  const push = React.useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router],
  );

  const toggle = React.useCallback(
    (key: string, value: string) => push(toggleParam(searchParams, key, value)),
    [push, searchParams],
  );

  const set = React.useCallback(
    (key: string, value?: string | null) => push(setParam(searchParams, key, value)),
    [push, searchParams],
  );

  const clearAll = React.useCallback(() => {
    const next = new URLSearchParams();
    const sort = searchParams.get(PARAM.sort);
    if (sort) next.set(PARAM.sort, sort);
    push(next);
  }, [push, searchParams]);

  const isSelected = React.useCallback(
    (key: string, value: string) => searchParams.getAll(key).includes(value),
    [searchParams],
  );

  return {
    searchParams,
    apply: push,
    toggle,
    set,
    clearAll,
    isSelected,
    pending,
    activeCount: countActiveFilters(searchParams),
  };
}
