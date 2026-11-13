'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/shopify/queries/catalog';
import { useCart, useCartForm } from '@/lib/shopify/cart.client';
import { formatPrice } from '@/lib/utils/money';
import { variantParam } from '@/lib/utils/shopify-routes';

export function ProductPurchase({ product, initialVariantId }: { product: Product; initialVariantId?: string }) {
  const first =
    product.variants.nodes.find((variant) => variantParam(variant.id) === variantParam(initialVariantId ?? '')) ??
    product.variants.nodes.find((variant) => variant.availableForSale) ??
    product.variants.nodes[0];
  const [selectedId, setSelectedId] = useState(first?.id);
  const variant = product.variants.nodes.find((item) => item.id === selectedId) ?? first;
  const [submitted, setSubmitted] = useState(false);
  const { formProps, register } = useCartForm();
  const errors = useCart((state) => state.errors);
  const linePending = useCart((state) => state.pending.lines.size > 0);
  const added = useCart((state) => state.data.lines.nodes.some((line) => line.merchandise?.id === selectedId));
  const messages = [
    ...errors.network.map((error) => error.message),
    ...errors.cart.userErrors.map((error) => error.message),
    ...[...errors.lines.values()].flatMap((group) => group.userErrors.map((error) => error.message)),
  ];
  if (!variant) return <p>This product is currently unavailable.</p>;
  return (
    <div className="purchase-panel">
      <p className="eyebrow">{product.vendor}</p>
      <h1>{product.title}</h1>
      <p className="product-price">{formatPrice(variant.price)}</p>
      <p className="product-description">{product.description}</p>
      <form {...formProps({ afterSubmit: () => setSubmitted(true) })} className="purchase-form">
        <label htmlFor="product-variant">Choose your option</label>
        <select
          id="product-variant"
          {...register('merchandiseId', { value: variant.id })}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setSubmitted(false);
            const url = new URL(window.location.href);
            url.searchParams.set('variant', variantParam(event.target.value));
            window.history.replaceState(null, '', url);
          }}
        >
          {product.variants.nodes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
              {!item.availableForSale ? ' — Sold out' : ''}
            </option>
          ))}
        </select>
        <input type="hidden" {...register('quantity', { value: 1 })} />
        <button {...register('add')} className="button" disabled={!variant.availableForSale}>
          Add to bag <span>↗</span>
        </button>
        {submitted && !messages.length ? (
          <p role="status" className="small">
            {linePending ? 'Adding to your bag…' : added ? 'Added to your bag.' : 'Updating your bag…'}{' '}
            <Link className="text-link" href="/cart">
              View bag
            </Link>
          </p>
        ) : null}
        {messages.length ? (
          <p role="alert" className="error-message">
            {messages.join(' ')}
          </p>
        ) : null}
      </form>
      <div className="product-details">
        <details>
          <summary>
            Product details <span>+</span>
          </summary>
          <p>{product.description}</p>
        </details>
        <details>
          <summary>
            Delivery & returns <span>+</span>
          </summary>
          <p>
            See our <Link href="/policies/shipping-policy">shipping policy</Link> and{' '}
            <Link href="/policies/refund-policy">returns policy</Link>. Shipping is calculated at checkout.
          </p>
        </details>
      </div>
    </div>
  );
}
