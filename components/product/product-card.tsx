import Image from 'next/image';
import Link from 'next/link';
import type { ProductCard as ProductCardData } from '@/lib/shopify/queries/catalog';
import { formatPrice } from '@/lib/utils/money';

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.handle}`} className="product-image" aria-label={`View ${product.title}`}>
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          <span>No image available</span>
        )}
        {!product.availableForSale ? <span className="product-badge">Sold out</span> : null}
        <span className="product-quick" aria-hidden="true">
          Explore product ↗
        </span>
      </Link>
      <div className="product-caption">
        <h3>
          <Link href={`/products/${product.handle}`}>{product.title}</Link>
        </h3>
        <span>{formatPrice(product.priceRange.minVariantPrice)}</span>
      </div>
      <p className="muted product-vendor">{product.vendor}</p>
    </article>
  );
}
