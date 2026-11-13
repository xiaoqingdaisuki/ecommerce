'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/shopify/cart.client';
import { prepareCheckout } from '@/lib/shopify/mutations/checkout';

export function CheckoutButton({ isDemo }: { isDemo: boolean }) {
  const pending = useCart(
    (state) => state.loading || state.pending.cost || state.revalidating || state.pending.lines.size > 0,
  );
  const cart = useCart((state) => state.data);
  const latest = useRef({ cart, pending });
  latest.current = { cart, pending };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  useEffect(() => {
    const restore = () => setBusy(false);
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  return (
    <>
      <button
        className="button checkout-button"
        disabled={isDemo || pending || busy}
        onClick={async () => {
          setBusy(true);
          setError(undefined);
          try {
            const url = await prepareCheckout();
            if (latest.current.cart !== cart || latest.current.pending) throw new Error('Cart changed during checkout');
            window.location.assign(url);
          } catch {
            setError('Checkout is unavailable. Please try again.');
            setBusy(false);
          }
        }}
      >
        {busy ? 'Opening checkout…' : 'Continue to checkout'}
        <span>↗</span>
      </button>
      {isDemo ? <p className="muted small">Demo store · Connect your Shopify store to enable checkout.</p> : null}
      {error ? (
        <p role="alert" className="error-message">
          {error}
        </p>
      ) : null}
    </>
  );
}
