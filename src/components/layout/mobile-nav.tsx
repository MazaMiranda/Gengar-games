'use client';

import { CaretRight } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Link from 'next/link';
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
                                  className="text-ink-muted hover:text-ink flex items-center justify-between rounded-sm py-2.5 text-sm transition-colors"
                                >
                                  {link.label}
                                  <CaretRight className="text-ink-ghost size-3.5" />
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
                  className="border-line text-ink hover:text-brand-200 flex items-center justify-between border-b px-2 py-4 text-sm font-semibold transition-colors"
                >
                  {entry.label}
                  <CaretRight className="text-ink-ghost size-4" />
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
