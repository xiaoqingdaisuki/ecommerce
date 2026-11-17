'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { PurchaseProduct } from '@/lib/shopify/queries/catalog';
import { ProductPurchase } from './product-purchase';
import { Icon } from '@/components/ui/icons';
import { ProductBadges } from './product-badges';

export function QuickBuy({ handle, onClose }: { handle: string; onClose: () => void }) {
  const [product, setProduct] = useState<PurchaseProduct>();
  const [selectedVariant, setSelectedVariant] = useState<PurchaseProduct['variants']['nodes'][number]>();
  const activeVariant =
    selectedVariant ??
    product?.variants.nodes.find((variant) => variant.availableForSale) ??
    product?.variants.nodes[0];
  const selectedImage = activeVariant?.image ?? product?.featuredImage;
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(handle)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load product. Please try again.');
        setProduct(await response.json());
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setError(error.message);
      });
    return () => controller.abort();
  }, [handle, attempt]);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Viewport className="dialog-viewport">
          <Dialog.Popup className="quick-popup">
            <div className="panel-heading">
              <Dialog.Title className="text-lg font-semibold">QUICK SHOP</Dialog.Title>
              <Dialog.Close className="icon-button" aria-label="Close quick shop">
                <Icon name="close" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              Select a product option and add it to your cart.
            </Dialog.Description>
            {product ? (
              <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="relative flex aspect-square items-center justify-center rounded-xl bg-neutral-100">
                    <ProductBadges
                      availableForSale={product.availableForSale && (activeVariant?.availableForSale ?? true)}
                      price={activeVariant?.price ?? product.priceRange.minVariantPrice}
                      compareAt={
                        activeVariant
                          ? activeVariant.compareAtPrice
                          : product.compareAtPriceRange.minVariantPrice
                      }
                    />
                    {selectedImage || product.featuredImage ? (
                      <Image
                        src={(selectedImage ?? product.featuredImage)!.url}
                        alt={(selectedImage ?? product.featuredImage)!.altText ?? product.title}
                        fill
                        sizes="(max-width: 1023px) 85vw, 400px"
                        className="object-contain p-8 mix-blend-multiply"
                      />
                    ) : (
                      <Icon name="mountain" width={64} height={64} />
                    )}
                  </div>
                  <Link className="text-link self-start" href={`/products/${handle}`} onClick={onClose}>
                    View full details <Icon name="arrow" width={16} />
                  </Link>
                </div>
                <ProductPurchase
                  product={product}
                  compact
                  onAdded={onClose}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            ) : error ? (
              <div className="empty-state">
                <p role="alert">{error}</p>
                <button
                  className="button mt-5"
                  onClick={() => {
                    setError('');
                    setAttempt((value) => value + 1);
                  }}
                >
                  TRY AGAIN
                </button>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2" role="status" aria-label="Loading product">
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton min-h-64 rounded-xl" />
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
