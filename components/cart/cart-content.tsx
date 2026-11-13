'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useId } from 'react';
import { useCart, useCartForm, useSuspenseCart } from '@/lib/shopify/cart.client';
import { formatPrice } from '@/lib/utils/money';
import { CheckoutButton } from '@/components/checkout/checkout-button';

export function CartContent({ isDemo }: { isDemo: boolean }) {
  return (
    <Suspense
      fallback={
        <p className="cart-loading" role="status">
          Loading your bag…
        </p>
      }
    >
      <CartBody isDemo={isDemo} />
    </Suspense>
  );
}

function CartBody({ isDemo }: { isDemo: boolean }) {
  const cart = useSuspenseCart((state) => state.data);
  const pending = useCart((state) => state.pending.cost || state.revalidating);
  const errors = useCart((state) => state.errors);
  const visibleLineIds = new Set(cart.lines.nodes.map((line) => line.id));
  const messages = [
    ...errors.network.map((error) => error.message),
    ...errors.cart.userErrors.map((error) => error.message),
    ...[...errors.lines.entries()]
      .filter(([id]) => !visibleLineIds.has(id))
      .flatMap(([, group]) => group.userErrors.map((error) => error.message)),
  ];
  return (
    <>
      {messages.length ? (
        <div role="alert" className="error-message">
          {messages.join(' ')}
        </div>
      ) : null}
      {!cart.lines.nodes.length ? (
        <div className="empty-state">
          <p className="eyebrow">Room for something good</p>
          <h2>Your bag is empty.</h2>
          <p className="muted">A few considered essentials are a good place to start.</p>
          <Link className="button" href="/search">
            Explore the collection <span>↗</span>
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-lines">
            {cart.lines.nodes.map((line) => (
              <CartLine key={line.id} line={line} />
            ))}
          </ul>
          <div className="cart-summary" style={{ opacity: pending ? 0.45 : 1 }} aria-busy={pending}>
            <span>Subtotal</span>
            <strong>{formatPrice(cart.cost.subtotalAmount)}</strong>
          </div>
          <p className="muted small">Shipping and taxes calculated at checkout.</p>
          <CheckoutButton isDemo={isDemo} />
        </>
      )}
    </>
  );
}

type CartLineData = import('@shopify/hydrogen').CartLine;

function CartLine({ line }: { line: CartLineData }) {
  const { formProps, register } = useCartForm();
  const pending = useCart((state) => state.pending.lines.has(line.id));
  const errors = useCart((state) => state.errors.lines.get(line.id)?.userErrors);
  const errorId = useId();
  const item = line.merchandise;
  return (
    <li className="cart-line">
      <div className="cart-line-image">
        {item?.image ? (
          <Image src={item.image.url} alt={item.image.altText ?? item.product?.title ?? 'Product'} fill sizes="100px" />
        ) : null}
      </div>
      <div className="cart-line-details">
        <Link href={`/products/${item?.product?.handle ?? ''}`}>
          {item?.product?.title ?? item?.title ?? 'Product'}
        </Link>
        <p className="muted small">{item?.selectedOptions?.map((option) => option.value).join(' / ')}</p>
        <form {...formProps()} className="quantity-form">
          <button {...register('set')} />
          <input type="hidden" {...register('lineId', { value: line.id })} />
          <button {...register('decrease')} aria-label={`Decrease ${item?.product?.title ?? 'item'} quantity`}>
            −
          </button>
          <input
            {...register('quantity', { value: line.quantity, interactive: true })}
            aria-label={`Quantity for ${item?.product?.title ?? 'item'}`}
            aria-invalid={!!errors?.length}
            aria-describedby={errors?.length ? errorId : undefined}
            style={{ opacity: pending ? 0.45 : 1 }}
          />
          <button {...register('increase')} aria-label={`Increase ${item?.product?.title ?? 'item'} quantity`}>
            +
          </button>
          <button {...register('remove')} className="remove-button">
            Remove
          </button>
        </form>
        {errors?.length ? (
          <p id={errorId} role="alert" className="error-message">
            {errors.map((error) => error.message).join(' ')}
          </p>
        ) : null}
      </div>
      <span className="small" style={{ opacity: pending ? 0.45 : 1 }}>
        {formatPrice(line.cost.totalAmount)}
      </span>
    </li>
  );
}
