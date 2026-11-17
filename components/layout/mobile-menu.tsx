'use client';

import { Dialog } from '@base-ui/react/dialog';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui/icons';
import type { NavigationLink } from '@/lib/utils/storefront-url';
import { STORE_NAVIGATION } from '@/lib/utils/navigation';

export function MobileMenu({ links, name }: { links: NavigationLink[]; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="icon-button lg:hidden" aria-label="Open navigation">
        <Icon name="menu" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="mobile-menu">
          <div className="panel-heading">
            <Dialog.Title className="font-semibold">{name}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close navigation">
              <Icon name="close" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Browse our store</Dialog.Description>
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {STORE_NAVIGATION.map((link) =>
              link.title === 'Explore' ? (
                <details key={link.href}>
                  <summary className="menu-link">
                    Explore <Icon name="chevron" className="disclosure-chevron" width={16} />
                  </summary>
                  <div className="flex flex-col pb-3 pl-4">
                    {[{ title: 'All collections', href: '/collections' }, ...links]
                      .filter(
                        (item, index, all) => all.findIndex((entry) => entry.href === item.href) === index,
                      )
                      .map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="mega-link"
                        >
                          {item.title}
                          <Icon name="arrow" width={16} />
                        </Link>
                      ))}
                  </div>
                </details>
              ) : (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="menu-link">
                  {link.title}
                  <Icon name="chevron" width={16} />
                </Link>
              ),
            )}
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
