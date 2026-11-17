type Money = { amount: string; currencyCode: string };
type Allocation = { __typename?: string; targetType?: string; discountedAmount: Money };
type Line = {
  quantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money; compareAtAmountPerQuantity: Money | null };
  discountAllocations?: readonly Allocation[];
};

/** Merchandise savings exclude delivery/tax and count code allocations only once. */
export function cartSavings(cart: {
  cost: { subtotalAmount: Money };
  lines: { nodes: readonly Line[] };
  discountAllocations?: readonly Allocation[];
}) {
  const currencyCode = cart.cost.subtotalAmount.currencyCode;
  // Hydrogen's empty/optimistic cart may not have resolved its currency yet.
  if (!/^[A-Z]{3}$/.test(currencyCode)) return null;
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).resolvedOptions()
    .maximumFractionDigits;
  const factor = 10 ** (digits ?? 2);
  const minor = (money: Money) => Math.round(Number(money.amount) * factor);
  const money = (amount: number): Money => ({ amount: (amount / factor).toFixed(digits), currencyCode });
  const allocations = [
    ...(cart.discountAllocations ?? []),
    ...cart.lines.nodes.flatMap((line) => line.discountAllocations ?? []),
  ];
  const amounts = [
    cart.cost.subtotalAmount,
    ...allocations.map((a) => a.discountedAmount),
    ...cart.lines.nodes.flatMap((line) => [
      line.cost.subtotalAmount,
      line.cost.totalAmount,
      ...(line.cost.compareAtAmountPerQuantity ? [line.cost.compareAtAmountPerQuantity] : []),
    ]),
  ];
  if (
    amounts.some(
      (value) =>
        value.currencyCode !== currencyCode ||
        !Number.isFinite(Number(value.amount)) ||
        Number(value.amount) < 0,
    )
  )
    return null;
  let original = 0;
  let lineSavings = 0;
  let lineCodes = 0;
  for (const line of cart.lines.nodes) {
    const baseline = Math.max(
      minor(line.cost.subtotalAmount),
      line.cost.compareAtAmountPerQuantity ? minor(line.cost.compareAtAmountPerQuantity) * line.quantity : 0,
    );
    original += baseline;
    // The modern allocation list includes order-level discounts. Sum its
    // amounts once, rather than inferring savings from tax-inclusive cart totals.
    const allocated = line.discountAllocations
      ?.filter((a) => a.targetType !== 'SHIPPING_LINE')
      .reduce((sum, a) => sum + minor(a.discountedAmount), 0);
    lineSavings +=
      Math.max(0, baseline - minor(line.cost.subtotalAmount)) +
      (allocated ?? Math.max(0, minor(line.cost.subtotalAmount) - minor(line.cost.totalAmount)));
    lineCodes += (line.discountAllocations ?? [])
      .filter((a) => a.__typename === 'CartCodeDiscountAllocation' && a.targetType !== 'SHIPPING_LINE')
      .reduce((sum, a) => sum + minor(a.discountedAmount), 0);
  }
  const cartCodes = (cart.discountAllocations ?? [])
    .filter((a) => a.__typename === 'CartCodeDiscountAllocation' && a.targetType !== 'SHIPPING_LINE')
    .reduce((sum, a) => sum + minor(a.discountedAmount), 0);
  const order = (cart.discountAllocations ?? [])
    .filter((a) => a.__typename !== 'CartCodeDiscountAllocation' && a.targetType !== 'SHIPPING_LINE')
    .reduce((sum, a) => sum + minor(a.discountedAmount), 0);
  const item = Math.max(0, lineSavings - lineCodes);
  const code = lineCodes + cartCodes;
  const total = item + code + order;
  if (lineCodes > lineSavings || total > original) return null;
  return {
    original: money(original),
    item: money(item),
    code: money(code),
    order: money(order),
    total: money(total),
    hasSavings: total > 0,
    percent: original > 0 ? Math.floor((total / original) * 100) : 0,
  };
}
