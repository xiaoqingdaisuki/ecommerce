'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/shopify/cart.client';
import { CartContent } from './cart-content';
import { Icon } from '@/components/ui/icons';

export function CartDrawer({ isDemo }: { isDemo: boolean }) {
  const [open, setOpen] = useState(false);
  const count = useCart((state) => state.data.totalQuantity);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="icon-button cart-trigger" aria-label={`Bag (${count})`}>
        <Icon name="bag" />
        <span className="cart-count" aria-live="polite">
          {count}
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="cart-popup">
          <div className="panel-heading">
            <Dialog.Title>
              Your bag <span className="muted">({count})</span>
            </Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close bag">
              <Icon name="close" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Review your items and continue to Shopify checkout.
          </Dialog.Description>
          <div
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setOpen(false);
            }}
          >
            <CartContent isDemo={isDemo} />
          </div>
          <Link className="text-link" href="/cart" onClick={() => setOpen(false)}>
            View full bag
          </Link>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
