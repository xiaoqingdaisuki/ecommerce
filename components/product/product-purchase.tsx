'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import type { PurchaseProduct } from '@/lib/shopify/queries/catalog';
import { useCart, useCartForm } from '@/lib/shopify/cart.client';
import { variantParam } from '@/lib/utils/shopify-routes';
import { initialVariant } from '@/lib/utils/product-variant';
import { buyNow } from '@/lib/shopify/mutations/checkout';
import { useCommerceActions } from '@/components/ui/commerce-provider';
import { Icon } from '@/components/ui/icons';
import { Price } from './price';

type Variant = PurchaseProduct['variants']['nodes'][number];

export function ProductPurchase({
  product,
  initialVariantId,
  compact = false,
  onAdded,
  onVariantChange,
}: {
  product: PurchaseProduct;
  initialVariantId?: string;
  compact?: boolean;
  onAdded?: () => void;
  onVariantChange?: (variant: Variant) => void;
}) {
  const first = initialVariant(product.variants.nodes, initialVariantId);
  const [selectedId, setSelectedId] = useState(first?.id);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  useEffect(() => {
    const restore = () => setBuying(false);
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  const variant = product.variants.nodes.find((item) => item.id === selectedId) ?? first;
  const formId = useId();
  const { setCartOpen } = useCommerceActions();
  const { formProps, register } = useCartForm();
  const pending = useCart((state) => state.pending.lines.size > 0);
  const errors = useCart((state) => state.errors);
  const messages = [
    ...errors.network.map((error) => error.message),
    ...errors.cart.userErrors.map((error) => error.message),
    ...[...errors.lines.values()].flatMap((group) => group.userErrors.map((error) => error.message)),
  ];
  if (!variant) return <p className="notice">This product is currently unavailable.</p>;
  const options = new Map<string, string[]>();
  for (const item of product.variants.nodes)
    for (const option of item.selectedOptions) {
      const values = options.get(option.name) ?? [];
      if (!values.includes(option.value)) values.push(option.value);
      options.set(option.name, values);
    }
  const choose = (name: string, value: string) => {
    const candidates = product.variants.nodes.filter((item) =>
      item.selectedOptions.some((option) => option.name === name && option.value === value),
    );
    const next =
      candidates.find((item) =>
        item.selectedOptions.every(
          (option) =>
            option.name === name ||
            variant.selectedOptions.some(
              (selected) => selected.name === option.name && selected.value === option.value,
            ),
        ),
      ) ??
      candidates.find((item) => item.availableForSale) ??
      candidates[0];
    if (!next) return;
    setSelectedId(next.id);
    setBuyError('');
    onVariantChange?.(next);
    if (!compact) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variantParam(next.id));
      window.history.replaceState(null, '', url);
    }
  };
  const directCheckout = async () => {
    setBuying(true);
    setBuyError('');
    try {
      window.location.assign(await buyNow(variant.id, quantity));
    } catch (error) {
      setBuyError(error instanceof Error ? error.message : 'Unable to open checkout. Please try again.');
      setBuying(false);
    }
  };
  return (
    <div className={compact ? 'flex min-w-0 flex-col' : 'purchase-panel'}>
      <p className="eyebrow text-emerald-700">{product.productType || product.vendor}</p>
      {compact ? (
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{product.title}</h2>
      ) : (
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight lg:text-[38px]">
          {product.title}
        </h1>
      )}
      <div className="my-5">
        <Price price={variant.price} compareAt={variant.compareAtPrice} large />
      </div>
      {product.description ? (
        <p className="line-clamp-4 text-sm leading-7 text-neutral-500">{product.description}</p>
      ) : null}
      <p
        className={`mt-5 flex items-center gap-2 text-xs ${variant.availableForSale ? 'text-emerald-700' : 'text-neutral-500'}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${variant.availableForSale ? 'bg-emerald-600' : 'bg-neutral-400'}`}
        />
        {variant.availableForSale ? 'Available to order' : 'This option is currently sold out'}
      </p>
      <form
        id={formId}
        {...formProps({
          afterSubmit: () => {
            onAdded?.();
            setCartOpen(true);
          },
        })}
        className="mt-6 flex flex-col gap-6"
      >
        <input type="hidden" {...register('merchandiseId', { value: variant.id })} />
        {[...options]
          .filter(
            ([name, values]) => !(name === 'Title' && values.length === 1 && values[0] === 'Default Title'),
          )
          .map(([name, values]) => (
            <fieldset key={name} className="flex min-w-0 flex-col gap-3">
              <legend className="mb-3 text-sm font-semibold">
                {name}
                <span className="ml-2 font-normal text-neutral-500">
                  {variant.selectedOptions.find((option) => option.name === name)?.value}
                </span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const active = variant.selectedOptions.some(
                    (option) => option.name === name && option.value === value,
                  );
                  const available = product.variants.nodes.some(
                    (item) =>
                      item.availableForSale &&
                      item.selectedOptions.some((option) => option.name === name && option.value === value),
                  );
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => choose(name, value)}
                      className={`variant-button ${active ? 'selected' : ''} ${!available ? 'text-neutral-400' : ''}`}
                    >
                      {value}
                      {!available ? <span className="sr-only"> (sold out)</span> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        <div className="flex items-center justify-between">
          <label htmlFor={`${formId}-qty`} className="text-sm font-semibold">
            Quantity
          </label>
          <div className="quantity-picker">
            <button
              type="button"
              aria-label="Decrease quantity"
              aria-disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              −
            </button>
            <input
              id={`${formId}-qty`}
              {...register('quantity', { value: quantity })}
              type="text"
              inputMode="numeric"
              pattern="[1-9][0-9]?"
              maxLength={2}
              onChange={(event) =>
                setQuantity(Math.min(99, Math.max(1, Math.trunc(Number(event.target.value)) || 1)))
              }
            />
            <button
              type="button"
              aria-label="Increase quantity"
              aria-disabled={quantity >= 99}
              onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            >
              +
            </button>
          </div>
        </div>
        <div
          className="flex items-center justify-between border-t border-neutral-100 pt-4 text-xs"
          aria-live="polite"
        >
          <span className="text-neutral-500">Item subtotal</span>
          <Price price={{ ...variant.price, amount: (Number(variant.price.amount) * quantity).toFixed(2) }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            {...register('add')}
            className="button justify-center"
            disabled={!variant.availableForSale || pending || buying}
          >
            {pending ? 'ADDING…' : 'ADD TO CART'}
            <Icon name="bag" width={17} />
          </button>
          <button
            type="button"
            className="button justify-center"
            disabled={!variant.availableForSale || pending || buying}
            onClick={directCheckout}
          >
            {buying ? 'OPENING…' : 'BUY NOW'}
            <Icon name="arrow" width={17} />
          </button>
        </div>
        {messages.length || buyError ? (
          <p role="alert" className="error-message">
            {buyError || messages.join(' ')}
          </p>
        ) : null}
      </form>
      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
        <Icon name="lock" width={14} height={14} /> Secure checkout · Taxes & shipping at checkout
      </div>
      {!compact ? (
        <>
          <div className="product-details mt-7">
            <details>
              <summary>
                Delivery & returns <Icon name="chevron" className="disclosure-chevron" width={16} />
              </summary>
              <p>
                Delivery options and shipping costs are confirmed at checkout.{' '}
                <Link href="/support">View shipping and returns information</Link>.
              </p>
            </details>
            <details>
              <summary>
                Need a hand choosing? <Icon name="chevron" className="disclosure-chevron" width={16} />
              </summary>
              <p>
                Explore the product details below or <Link href="/support">visit our help center</Link>.
              </p>
            </details>
          </div>
          <div className="sticky-purchase">
            <div className="store-container flex items-center justify-between gap-4">
              <div className="hidden min-w-0 flex-col lg:flex">
                <span className="truncate text-sm font-semibold">{product.title}</span>
                <span className="text-xs text-neutral-500">
                  {variant.title === 'Default Title' ? 'Choose your next adventure' : variant.title}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 lg:flex-none lg:gap-6">
                <Price price={variant.price} />
                <div className="flex gap-2">
                  <button
                    {...register('add')}
                    form={formId}
                    className="button justify-center"
                    disabled={!variant.availableForSale || pending || buying}
                  >
                    {pending ? 'ADDING…' : 'ADD TO CART'}
                  </button>
                  <button
                    type="button"
                    className="button hidden justify-center lg:flex"
                    disabled={!variant.availableForSale || pending || buying}
                    onClick={directCheckout}
                  >
                    {buying ? 'OPENING…' : 'BUY NOW'}
                    <Icon name="arrow" width={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
