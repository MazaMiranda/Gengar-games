'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/disclosure';
import { Button } from '@/components/ui/button';
import { primaryNav } from '@/lib/navigation';

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent side="left" className="max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Navegar</DrawerTitle>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="px-4">
          <Accordion type="multiple" className="flex flex-col">
            {primaryNav.map((entry) =>
              entry.columns ? (
                <AccordionItem key={entry.id} value={entry.id}>
                  <AccordionTrigger className="px-2">{entry.label}</AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="flex flex-col gap-5">
                      {entry.columns.map((column) => (
                        <div key={column.title} className="flex flex-col gap-2">
                          <p className="eyebrow">{column.title}</p>
                          <ul className="flex flex-col">
                            {column.links.map((link) => (
                              <li key={link.href + link.label}>
                                <Link
                                  href={link.href}
                                  onClick={() => setOpen(false)}
                                  className="flex items-center justify-between rounded-sm py-2.5 text-sm text-ink-muted transition-colors hover:text-ink"
                                >
                                  {link.label}
                                  <ChevronRight className="size-3.5 text-ink-ghost" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link
                  key={entry.id}
                  href={entry.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-line px-2 py-4 text-sm font-semibold text-ink transition-colors hover:text-brand-200"
                >
                  {entry.label}
                  <ChevronRight className="size-4 text-ink-ghost" />
                </Link>
              ),
            )}
          </Accordion>
        </DrawerBody>

        <DrawerFooter className="flex flex-col gap-2">
          <Button asChild block onClick={() => setOpen(false)}>
            <Link href="/catalogo">Ver catálogo completo</Link>
          </Button>
          <Button asChild variant="secondary" block onClick={() => setOpen(false)}>
            <Link href="/conta">Minha conta</Link>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
