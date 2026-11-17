'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useCommerce } from '@/components/ui/commerce-provider';
import Link from 'next/link';
import { useCart } from '@/lib/shopify/cart.client';
import dynamic from 'next/dynamic';
import { Icon } from '@/components/ui/icons';

const LazyCartContent = dynamic(() => import('./cart-content').then((module) => module.CartContent), {
  loading: () => (
    <div className="flex min-h-64 flex-col gap-5" role="status" aria-label="Loading your cart">
      <div className="skeleton h-24 rounded-xl" />
      <div className="skeleton h-24 rounded-xl" />
      <div className="skeleton h-11 rounded-md" />
    </div>
  ),
});

export function CartDrawer({ isDemo }: { isDemo: boolean }) {
  const { cartOpen: open, setCartOpen: setOpen } = useCommerce();
  const count = useCart((state) => state.data.totalQuantity);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="icon-button cart-trigger" aria-label={`Cart (${count})`}>
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
              Your cart <span className="muted">({count})</span>
            </Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close cart">
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
            {open ? <LazyCartContent isDemo={isDemo} /> : null}
          </div>
          <Link className="text-link" href="/cart" onClick={() => setOpen(false)}>
            View full cart <Icon name="arrow" width={16} />
          </Link>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
