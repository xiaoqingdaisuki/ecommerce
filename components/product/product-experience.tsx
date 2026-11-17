'use client';

import { useMemo, useState } from 'react';
import type { PurchaseProduct } from '@/lib/shopify/queries/catalog';
import { ProductPurchase } from './product-purchase';
import { ProductGallery } from './product-gallery';
import { Icon } from '@/components/ui/icons';
import { variantParam } from '@/lib/utils/shopify-routes';
import { ProductBadges } from './product-badges';

export function ProductExperience({
  product,
  initialVariantId,
}: {
  product: PurchaseProduct;
  initialVariantId?: string;
}) {
  const initialImage = product.variants.nodes.find((variant) => variantParam(variant.id) === initialVariantId)
    ?.image?.url;
  const [selectedUrl, setSelectedUrl] = useState(initialImage);
  const [selectedVariant, setSelectedVariant] = useState(
    () =>
      product.variants.nodes.find((variant) => variantParam(variant.id) === initialVariantId) ??
      product.variants.nodes.find((variant) => variant.availableForSale) ??
      product.variants.nodes[0],
  );
  const images = useMemo(() => {
    const list = [...product.images.nodes];
    for (const variant of product.variants.nodes)
      if (variant.image && !list.some((image) => image.url === variant.image?.url)) list.push(variant.image);
    if (!list.length && product.featuredImage) list.push(product.featuredImage);
    // Emit the selected image first in HTML, before the enhancement loads.
    const selected = list.findIndex((image) => image.url === initialImage);
    if (selected > 0) list.unshift(...list.splice(selected, 1));
    return list;
  }, [product.images.nodes, product.variants.nodes, product.featuredImage, initialImage]);
  return (
    <div className="product-detail-grid">
      <div className="product-gallery">
        <ProductGallery
          images={images}
          title={product.title}
          selectedUrl={selectedUrl}
          badges={
            <ProductBadges
              availableForSale={product.availableForSale && (selectedVariant?.availableForSale ?? true)}
              price={selectedVariant?.price ?? product.priceRange.minVariantPrice}
              compareAt={
                selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPriceRange.minVariantPrice
              }
            />
          }
        />
      </div>
      <div className="product-information">
        <ProductPurchase
          product={product}
          initialVariantId={initialVariantId}
          onVariantChange={(variant) => {
            setSelectedUrl(variant.image?.url);
            setSelectedVariant(variant);
          }}
        />
        <div className="mt-7 grid grid-cols-3 gap-3 border-y border-neutral-200 py-6 text-center text-[11px] text-neutral-500">
          {[
            ['truck', 'Delivery at checkout'],
            ['return', 'Returns information'],
            ['shield', 'Secure payment'],
          ].map(([icon, text]) => (
            <div key={icon} className="flex flex-col items-center gap-2">
              <Icon name={icon as 'truck' | 'return' | 'shield'} />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-neutral-500">
          {images.length > 1 ? 'Swipe through the product images. ' : ''}Double tap a product image to zoom.
        </p>
      </div>
    </div>
  );
}
