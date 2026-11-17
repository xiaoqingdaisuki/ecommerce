import Image from 'next/image';
import Link from 'next/link';
import type { ProductCard as ProductCardData } from '@/lib/shopify/queries/catalog';
import { QuickBuyButton } from './quick-buy-button';
import { Icon } from '@/components/ui/icons';
import { Price } from './price';
import { ProductBadges } from './product-badges';

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  return (
    <article className="product-card group flex h-full min-w-0 flex-col">
      <div className="product-media">
        <Link
          href={`/products/${product.handle}`}
          className="product-image"
          aria-label={`View ${product.title}`}
        >
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              sizes="(max-width: 1023px) 50vw, 25vw"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              quality={70}
              className="object-contain px-5 pb-14 pt-4 lg:px-9 lg:pb-16 lg:pt-9"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Icon name="mountain" width={48} height={48} />
            </div>
          )}
        </Link>
        <ProductBadges availableForSale={product.availableForSale} price={price} compareAt={compareAt} />
        <QuickBuyButton handle={product.handle} title={product.title} />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-1 pb-1 pt-4">
        <h3 className="min-h-12 text-sm font-semibold leading-6 lg:text-base">
          <Link href={`/products/${product.handle}`}>{product.title}</Link>
        </h3>
        <div className="mt-auto flex w-full flex-col gap-3">
          <Price price={price} compareAt={compareAt} />
        </div>
      </div>
    </article>
  );
}
