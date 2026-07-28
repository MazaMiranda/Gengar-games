'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/disclosure';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster
            position="bottom-right"
            offset={20}
            toastOptions={{
              classNames: {
                toast:
                  'glass-solid !rounded-lg !border-line !text-ink !shadow-lift !font-sans !text-sm !gap-3',
                title: '!font-display !font-semibold !text-ink !text-sm',
                description: '!text-ink-muted !text-xs',
                actionButton: '!bg-brand-500 !text-white !rounded-sm !text-xs',
                cancelButton: '!bg-white/8 !text-ink-muted !rounded-sm !text-xs',
                success: '[&_[data-icon]]:!text-success',
                error: '[&_[data-icon]]:!text-danger',
              },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
