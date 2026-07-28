'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Logo } from '@/components/layout/logo';
import { AdminNav } from './admin-nav';

export function AdminMobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-3">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label="Abrir menu do painel"
            className="grid size-9 place-items-center rounded-md border border-line text-ink-muted transition-colors hover:text-ink lg:hidden"
          >
            <Menu className="size-4" />
          </button>
        </DrawerTrigger>
        <DrawerContent side="left" className="max-w-72 p-0">
          <div onClick={() => setOpen(false)} className="h-full overflow-y-auto">
            <AdminNav />
          </div>
        </DrawerContent>
      </Drawer>

      <div className="lg:hidden">
        <Logo compact href="/admin" />
      </div>
    </div>
  );
}
