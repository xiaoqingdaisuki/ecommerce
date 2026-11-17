'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import type Swiper from 'swiper';
import type { Product } from '@/lib/shopify/queries/catalog';
import { afterLoadIdle } from '@/lib/utils/idle';
import { Icon } from '@/components/ui/icons';

type ImageData = Product['images']['nodes'][number];

export function ProductGallery({
  images,
  title,
  selectedUrl,
  badges,
}: {
  images: ImageData[];
  title: string;
  selectedUrl?: string;
  badges?: ReactNode;
}) {
  const main = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const gallery = useRef<Swiper | null>(null);
  const thumbnails = useRef<Swiper | null>(null);
  const pending = useRef<Promise<Swiper | undefined> | null>(null);
  const [error, setError] = useState('');
  const ensure = useCallback(() => {
    if (gallery.current && !gallery.current.destroyed) return Promise.resolve(gallery.current);
    if (pending.current) return pending.current;
    pending.current = import('@/lib/utils/gallery-engine')
      .then(({ createGallery, createThumbnails }) => {
        if (!main.current?.isConnected) return;
        if (thumbs.current)
          thumbnails.current = createThumbnails(thumbs.current, {
            slidesPerView: 4.5,
            spaceBetween: 10,
            watchSlidesProgress: true,
            breakpoints: { 1024: { slidesPerView: 6, spaceBetween: 12 } },
          });
        gallery.current = createGallery(main.current, {
          slidesPerView: 1,
          keyboard: { enabled: true, onlyInViewport: true },
          navigation: {
            prevEl: main.current.querySelector<HTMLButtonElement>('.gallery-prev'),
            nextEl: main.current.querySelector<HTMLButtonElement>('.gallery-next'),
          },
          pagination: { el: main.current.querySelector<HTMLElement>('.swiper-pagination'), clickable: true },
          thumbs: { swiper: thumbnails.current },
          zoom: { maxRatio: 2 },
          a11y: { containerMessage: `${title} gallery` },
          speed: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
        });
        return gallery.current;
      })
      .finally(() => {
        pending.current = null;
      });
    return pending.current;
  }, [title]);
  useEffect(() => {
    // A single image needs no carousel code until the shopper requests zoom.
    const cancel =
      images.length > 1
        ? afterLoadIdle(() => {
            void ensure().catch(() => {});
          })
        : () => {};
    return () => {
      cancel();
      gallery.current?.destroy(true, true);
      thumbnails.current?.destroy(true, true);
      gallery.current = null;
      thumbnails.current = null;
    };
  }, [ensure, images.length]);
  useEffect(() => {
    const index = images.findIndex((image) => image.url === selectedUrl);
    if (index > -1 && images.length > 1)
      void ensure()
        .then((swiper) => swiper?.slideTo(index))
        .catch(() => setError('Image navigation is unavailable. Please try again.'));
  }, [selectedUrl, images, ensure]);
  if (!images.length)
    return (
      <div className="detail-image flex flex-col items-center justify-center gap-3 text-neutral-400">
        {badges}
        <Icon name="mountain" width={64} height={64} />
      </div>
    );
  return (
    <>
      <div
        ref={main}
        className="swiper gallery-main progressive-swiper"
        onPointerEnter={() => {
          if (images.length > 1) void ensure().catch(() => {});
        }}
        onDoubleClick={() => {
          if (!gallery.current)
            void ensure()
              .then((swiper) => swiper?.zoom.in())
              .catch(() => setError('Zoom is unavailable. Please try again.'));
        }}
      >
        <div className="swiper-wrapper">
          {images.map((image, index) => (
            <div key={image.url} className="swiper-slide">
              <div className="swiper-zoom-container">
                <div className="detail-image">
                  <Image
                    src={image.url}
                    alt={image.altText ?? `${title} — view ${index + 1}`}
                    fill
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    quality={70}
                    sizes="(max-width: 1023px) calc(100vw - 40px), (min-width: 1496px) 720px, 50vw"
                    className="object-contain p-5 mix-blend-multiply lg:p-10"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {badges}
        {images.length > 1 ? (
          <>
            <button
              className="swiper-button-prev gallery-prev"
              aria-label="Previous product image"
              type="button"
              onClick={() => {
                if (!gallery.current) void ensure().then((swiper) => swiper?.slidePrev());
              }}
            />
            <button
              className="swiper-button-next gallery-next"
              aria-label="Next product image"
              type="button"
              onClick={() => {
                if (!gallery.current) void ensure().then((swiper) => swiper?.slideNext());
              }}
            />
            <div className="swiper-pagination" />
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div ref={thumbs} className="swiper gallery-thumbs">
          <div className="swiper-wrapper">
            {images.map((image, index) => (
              <div key={image.url} className="swiper-slide">
                <button
                  className="thumbnail-button"
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  onClick={() => void ensure().then((swiper) => swiper?.slideTo(index))}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="100px"
                    quality={70}
                    className="object-contain p-2"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {error ? (
        <p role="status" className="error-message">
          {error}
        </p>
      ) : null}
    </>
  );
}
