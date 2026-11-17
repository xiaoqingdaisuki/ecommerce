import { formatPrice } from '@/lib/utils/money';

type Money = { amount: string; currencyCode: string };

export function Price({
  price,
  compareAt,
  large = false,
}: {
  price: Money;
  compareAt?: Money | null;
  large?: boolean;
}) {
  const sale =
    compareAt &&
    compareAt.currencyCode === price.currencyCode &&
    Number(compareAt.amount) > Number(price.amount);
  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${large ? 'text-3xl font-semibold tracking-tight' : 'text-base font-semibold'}`}
    >
      <span className={sale ? 'text-[#c65300]' : ''}>{formatPrice(price)}</span>
      {sale ? <del className="text-sm font-normal text-neutral-500">{formatPrice(compareAt)}</del> : null}
    </div>
  );
}
