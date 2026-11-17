'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useId, useState } from 'react';
import { useCart, useCartForm, useSuspenseCart } from '@/lib/shopify/cart.client';
import { formatPrice } from '@/lib/utils/money';
import { CheckoutButton } from '@/components/checkout/checkout-button';
import { Icon } from '@/components/ui/icons';
import { Price } from '@/components/product/price';
import { cartSavings } from '@/lib/utils/cart-savings';

export function CartContent({
  isDemo,
  variant = 'drawer',
}: {
  isDemo: boolean;
  variant?: 'drawer' | 'page';
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <CartLoading variant={variant} />;
  return (
    <Suspense fallback={<CartLoading variant={variant} />}>
      <CartBody isDemo={isDemo} variant={variant} />
    </Suspense>
  );
}

function CartLoading({ variant }: { variant: 'drawer' | 'page' }) {
  return (
    <div
      className={variant === 'page' ? 'cart-page-layout' : 'flex flex-col gap-5'}
      role="status"
      aria-label="Loading your cart"
    >
      <div className="skeleton min-h-64 rounded-xl" />
      <div className="skeleton min-h-80 rounded-xl" />
    </div>
  );
}

function CartBody({ isDemo, variant }: { isDemo: boolean; variant: 'drawer' | 'page' }) {
  const cart = useSuspenseCart((state) => state.data);
  const savings = cartSavings(cart);
  const pending = useCart(
    (state) => state.pending.cost || state.revalidating || state.pending.lines.size > 0,
  );
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
          <Icon name="bag" width={40} height={40} className="mb-5 text-neutral-400" />
          <h2>{pending ? 'Updating your cart…' : 'Your cart is empty.'}</h2>
          <Link className="button" href="/collections/all">
            SHOP NOW <span>↗</span>
          </Link>
        </div>
      ) : (
        <div className={variant === 'page' ? 'cart-page-layout' : 'cart-drawer-layout'}>
          <section className={variant === 'page' ? 'cart-items-panel' : ''} aria-label="Cart items">
            {variant === 'page' ? (
              <div className="mb-2 flex items-center justify-between border-b border-neutral-200 pb-5">
                <h2 className="text-lg font-semibold">Your items</h2>
                <span className="text-xs text-neutral-500">
                  {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}
                </span>
              </div>
            ) : null}
            {variant === 'page' && savings?.hasSavings ? (
              <div className="cart-savings-callout" aria-busy={pending}>
                <Icon name="check" width={18} />
                <span>
                  You save <strong>{formatPrice(savings.total)}</strong> on this order
                </span>
                {savings.percent > 0 ? (
                  <span className="cart-savings-pill">{savings.percent}% OFF</span>
                ) : null}
              </div>
            ) : null}
            <ul className="cart-lines">
              {cart.lines.nodes.map((line) => (
                <CartLine key={line.id} line={line} />
              ))}
            </ul>
            {variant === 'page' ? <CartExtras showDiscount={false} /> : null}
            {variant === 'page' ? (
              <Link href="/collections/all" className="text-link mt-6">
                Continue shopping <Icon name="arrow" width={16} />
              </Link>
            ) : null}
          </section>
          <aside className={variant === 'page' ? 'cart-order-panel' : ''} aria-label="Order summary">
            {variant === 'page' ? (
              <h2 className="text-xl font-semibold tracking-tight">Order summary</h2>
            ) : null}
            {variant === 'drawer' ? <CartExtras /> : null}
            <div className="cart-summary" style={{ opacity: pending ? 0.45 : 1 }} aria-busy={pending}>
              <span>{savings?.hasSavings ? 'Original total' : 'Subtotal'}</span>
              {savings?.hasSavings ? (
                <del className="text-sm font-normal text-neutral-500">{formatPrice(savings.original)}</del>
              ) : (
                <strong>{formatPrice(cart.cost.subtotalAmount)}</strong>
              )}
            </div>
            {savings?.hasSavings ? (
              <dl className="cart-discount-breakdown" aria-busy={pending}>
                {Number(savings.item.amount) > 0 ? (
                  <div>
                    <dt>Product savings</dt>
                    <dd>−{formatPrice(savings.item)}</dd>
                  </div>
                ) : null}
                {Number(savings.code.amount) > 0 ? (
                  <div>
                    <dt>Code savings</dt>
                    <dd>−{formatPrice(savings.code)}</dd>
                  </div>
                ) : null}
                {Number(savings.order.amount) > 0 ? (
                  <div>
                    <dt>Order discount</dt>
                    <dd>−{formatPrice(savings.order)}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            <p className="muted small">Shipping and taxes calculated at checkout.</p>
            {variant === 'page' ? (
              <>
                <CartExtras showNote={false} />
                <div className="cart-estimated-total" aria-busy={pending}>
                  <span>Estimated total</span>
                  <strong>{formatPrice(cart.cost.totalAmount)}</strong>
                </div>
                {savings?.hasSavings ? (
                  <div className="cart-total-savings">
                    <span>Total savings</span>
                    <strong>{formatPrice(savings.total)}</strong>
                  </div>
                ) : null}
              </>
            ) : null}
            <CheckoutButton isDemo={isDemo} />
          </aside>
        </div>
      )}
    </>
  );
}

function CartExtras({
  showDiscount = true,
  showNote = true,
}: {
  showDiscount?: boolean;
  showNote?: boolean;
}) {
  const discount = useCartForm();
  const note = useCartForm();
  const pending = useCart(
    (state) => state.pending.cost || state.revalidating || state.pending.discountCodes.size > 0,
  );
  const notePending = useCart((state) => state.pending.note);
  const savedNote = useCart((state) => state.data.note ?? '');
  const [draftNote, setDraftNote] = useState(savedNote);
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  const noteErrors = useCart((state) => state.errors.note.userErrors);
  const codes = useCart((state) => state.data.discountCodes);
  const discountErrors = useCart((state) => state.errors.discountCodes);
  // Shopify retains inapplicable codes in cart data. Feedback belongs to this
  // form attempt, so reopening a drawer must not replay old validation errors.
  const [draftCode, setDraftCode] = useState('');
  const [discountAttempt, setDiscountAttempt] = useState<string | null>(null);
  const discountErrorId = useId();
  const matchesAttempt = (code: string) => code.toUpperCase() === discountAttempt?.toUpperCase();
  const attemptedCode = codes.find((code) => matchesAttempt(code.code));
  const attemptErrors = [...discountErrors.entries()]
    .filter(([code]) => matchesAttempt(code))
    .flatMap(([, group]) => group.userErrors.map((error) => error.message));
  const discountMessage =
    discountAttempt && !pending
      ? attemptErrors.join(' ') ||
        (attemptedCode && !attemptedCode.applicable
          ? `“${discountAttempt}” cannot be applied to this cart. Check the code and its requirements.`
          : '')
      : '';
  return (
    <div className="mt-6 flex flex-col gap-4">
      {showDiscount ? (
        <section
          className="rounded-lg border border-neutral-200 bg-[#f2f7f4] px-4 py-4"
          aria-label="Discount code"
        >
          <h3 className="text-sm font-semibold">Discount code</h3>
          <form
            {...discount.formProps({
              beforeSubmit: () => setDiscountAttempt(draftCode.trim()),
            })}
            className="mt-4 flex items-center gap-2"
            aria-busy={pending}
          >
            <input
              {...discount.register('discountCode', { value: draftCode })}
              onChange={(event) => {
                setDraftCode(event.target.value);
                setDiscountAttempt(null);
              }}
              aria-label="Discount code"
              aria-invalid={Boolean(discountMessage)}
              aria-describedby={discountMessage ? discountErrorId : undefined}
              placeholder="Enter discount code"
              className="w-full flex-1 text-xs"
              required
            />
            <button
              {...discount.register('discount-apply')}
              className="button"
              disabled={pending || !draftCode.trim()}
            >
              {pending ? 'APPLYING…' : 'APPLY'}
            </button>
          </form>
          {codes
            .filter((code) => code.applicable)
            .map((code) => (
              <DiscountCode key={code.code} code={code.code} />
            ))}
          {discountMessage ? (
            <div
              id={discountErrorId}
              role="alert"
              className="mt-3 flex items-center gap-3 text-xs text-red-700"
            >
              <p className="flex-1 leading-6">{discountMessage}</p>
              <button
                type="button"
                className="icon-button shrink-0 text-neutral-600"
                aria-label="Dismiss discount error"
                onClick={() => setDiscountAttempt(null)}
              >
                <Icon name="close" width={15} />
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
      {showNote ? (
        <details className="rounded-lg border border-neutral-200 px-4 py-3">
          <summary className="flex items-center justify-between text-xs">
            Add an order note
            <Icon name="chevron" className="disclosure-chevron" width={15} />
          </summary>
          <form
            {...note.formProps({ afterSubmit: () => setNoteSubmitted(true) })}
            className="mt-4 flex flex-col gap-3"
          >
            <textarea
              {...note.register('note', { value: draftNote })}
              onChange={(event) => {
                setDraftNote(event.target.value);
                setNoteSubmitted(false);
              }}
              aria-label="Order note"
              placeholder="Anything we should know?"
              maxLength={1000}
              rows={3}
              className="text-xs"
            />
            <button
              {...note.register('note-update')}
              className="button button-outline justify-center"
              disabled={notePending}
            >
              {notePending ? 'SAVING…' : 'SAVE NOTE'}
            </button>
            {noteSubmitted && !notePending && !noteErrors.length && savedNote === draftNote ? (
              <p role="status" className="text-xs text-emerald-700">
                Your note has been saved.
              </p>
            ) : null}
            {noteErrors.length ? (
              <p role="alert" className="error-message">
                {noteErrors.map((error) => error.message).join(' ')}
              </p>
            ) : null}
          </form>
        </details>
      ) : null}
    </div>
  );
}

function DiscountCode({ code }: { code: string }) {
  const { formProps, register } = useCartForm();
  const pending = useCart((state) => state.pending.discountCodes.has(code));
  return (
    <form {...formProps()} className="mt-3 flex items-center justify-between gap-3 text-xs">
      <input type="hidden" {...register('discountCode', { value: code })} />
      <p role="status" className="text-emerald-700">
        {code}: Applied
      </p>
      <button
        {...register('discount-remove')}
        disabled={pending}
        className="icon-button shrink-0"
        aria-label={`Remove discount ${code}`}
      >
        <Icon name="close" width={15} height={15} />
      </button>
    </form>
  );
}

type CartLineData = import('@shopify/hydrogen').CartLine;

function CartLine({ line }: { line: CartLineData }) {
  const { formProps, register } = useCartForm();
  const pending = useCart((state) => state.pending.lines.has(line.id));
  const errors = useCart((state) => state.errors.lines.get(line.id)?.userErrors);
  const errorId = useId();
  const item = line.merchandise;
  const saving = cartSavings({
    cost: { subtotalAmount: line.cost.subtotalAmount },
    lines: { nodes: [line] },
  });
  return (
    <li className="cart-line">
      <div className="cart-line-image">
        {item?.image ? (
          <Image
            src={item.image.url}
            alt={item.image.altText ?? item.product?.title ?? 'Product'}
            fill
            sizes="100px"
          />
        ) : null}
      </div>
      <div className="cart-line-details">
        <Link href={`/products/${item?.product?.handle ?? ''}`}>
          {item?.product?.title ?? item?.title ?? 'Product'}
        </Link>
        <p className="muted small">
          {item?.selectedOptions
            ?.filter((option) => option.value !== 'Default Title')
            .map((option) => option.value)
            .join(' / ')}
        </p>
        <div className="cart-unit-price">
          <Price price={line.cost.amountPerQuantity} compareAt={line.cost.compareAtAmountPerQuantity} />
          <span className="text-[10px] text-neutral-500">each</span>
        </div>
        <form {...formProps()} className="quantity-form">
          <button {...register('set')} />
          <input type="hidden" {...register('lineId', { value: line.id })} />
          <button
            {...register('decrease')}
            aria-label={`Decrease ${item?.product?.title ?? 'item'} quantity`}
          >
            −
          </button>
          <input
            {...register('quantity', { value: line.quantity, interactive: true })}
            aria-label={`Quantity for ${item?.product?.title ?? 'item'}`}
            aria-invalid={!!errors?.length}
            aria-describedby={errors?.length ? errorId : undefined}
            style={{ opacity: pending ? 0.45 : 1 }}
          />
          <button
            {...register('increase')}
            aria-label={`Increase ${item?.product?.title ?? 'item'} quantity`}
          >
            +
          </button>
          <button {...register('remove')} className="remove-button">
            REMOVE
          </button>
        </form>
        {errors?.length ? (
          <p id={errorId} role="alert" className="error-message">
            {errors.map((error) => error.message).join(' ')}
          </p>
        ) : null}
      </div>
      <span
        className={`small flex flex-col items-end gap-1 ${saving?.hasSavings ? 'text-[#c65300]' : ''}`}
        style={{ opacity: pending ? 0.45 : 1 }}
      >
        {saving?.hasSavings ? (
          <del className="text-xs font-normal text-neutral-500">{formatPrice(saving.original)}</del>
        ) : null}
        {formatPrice(line.cost.totalAmount)}
        {saving?.hasSavings ? (
          <span className="cart-savings-pill">SAVE {formatPrice(saving.total)}</span>
        ) : null}
      </span>
    </li>
  );
}
