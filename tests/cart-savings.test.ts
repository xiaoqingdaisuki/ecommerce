import assert from 'node:assert/strict';
import test from 'node:test';
import { cartSavings } from '../lib/utils/cart-savings';

const usd = (amount: string) => ({ amount, currencyCode: 'USD' });
const allocation = (amount: string, type = 'CartCodeDiscountAllocation', targetType = 'LINE_ITEM') => ({
  __typename: type,
  targetType,
  discountedAmount: usd(amount),
});
const line = (quantity: number, subtotal: string, paid: string, compare: string | null) => ({
  quantity,
  cost: {
    subtotalAmount: usd(subtotal),
    totalAmount: usd(paid),
    compareAtAmountPerQuantity: compare ? usd(compare) : null,
  },
});

test('markdown savings scale with quantity using integer minor units', () => {
  const result = cartSavings({
    cost: { subtotalAmount: usd('59.97') },
    lines: { nodes: [line(3, '59.97', '59.97', '24.99')] },
  });
  assert.equal(result?.original.amount, '74.97');
  assert.equal(result?.total.amount, '15.00');
  assert.equal(result?.percent, 20);
});

test('line codes are not counted twice; cart codes and automatic discounts remain separate', () => {
  const result = cartSavings({
    cost: { subtotalAmount: usd('80') },
    lines: { nodes: [{ ...line(1, '90', '80', '100'), discountAllocations: [allocation('10')] }] },
    discountAllocations: [
      allocation('5'),
      allocation('3', 'CartAutomaticDiscountAllocation'),
      allocation('12', 'CartCodeDiscountAllocation', 'SHIPPING_LINE'),
    ],
  });
  assert.equal(result?.item.amount, '10.00');
  assert.equal(result?.code.amount, '15.00');
  assert.equal(result?.order.amount, '3.00');
  assert.equal(result?.total.amount, '28.00');
});

test('full-price carts have no promotional claim and mixed currencies fail closed', () => {
  const cart = { cost: { subtotalAmount: usd('30') }, lines: { nodes: [line(1, '30', '30', null)] } };
  assert.equal(cartSavings(cart)?.hasSavings, false);
  assert.equal(
    cartSavings({
      ...cart,
      discountAllocations: [{ discountedAmount: { amount: '5', currencyCode: 'EUR' } }],
    }),
    null,
  );
});

test('modern line allocations include order discounts without counting the cost delta again', () => {
  const result = cartSavings({
    cost: { subtotalAmount: usd('90') },
    lines: {
      nodes: [
        {
          ...line(1, '90', '72', '100'),
          discountAllocations: [allocation('15'), allocation('3', 'CartAutomaticDiscountAllocation')],
        },
      ],
    },
  });
  assert.equal(result?.item.amount, '13.00');
  assert.equal(result?.code.amount, '15.00');
  assert.equal(result?.total.amount, '28.00');
});
