type Money = { amount: string; currencyCode: string };

/** Shared product-media labels; availability and promotion are independent. */
export function ProductBadges({
  availableForSale,
  price,
  compareAt,
}: {
  availableForSale: boolean;
  price: Money;
  compareAt?: Money | null;
}) {
  const sale =
    compareAt?.currencyCode === price.currencyCode && Number(compareAt.amount) > Number(price.amount);
  const discount = sale ? Math.floor((1 - Number(price.amount) / Number(compareAt.amount)) * 100) : 0;
  if (availableForSale && !sale) return null;
  return (
    <div className="product-badges pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider">
      {!availableForSale ? (
        <span className="rounded bg-white px-2.5 py-1 text-neutral-600">SOLD OUT</span>
      ) : null}
      {sale ? (
        <span className="rounded bg-[#fff0e5] px-2.5 py-1 text-[#c65300]">
          {discount > 0 ? `${discount}% OFF` : 'SALE'}
        </span>
      ) : null}
    </div>
  );
}
