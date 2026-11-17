import { variantParam } from './shopify-routes';

/** Resolve one purchase variant for images, prices, stock labels and cart inputs. */
export function initialVariant<T extends { id: string; availableForSale: boolean }>(
  variants: readonly T[],
  requestedId?: string,
): T | undefined {
  return (
    (requestedId
      ? variants.find((variant) => variantParam(variant.id) === variantParam(requestedId))
      : undefined) ??
    variants.find((variant) => variant.availableForSale) ??
    variants[0]
  );
}
