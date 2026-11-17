'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type Swiper from 'swiper';
import Link from 'next/link';
import { Icon } from './icons';
import { afterLoadIdle } from '@/lib/utils/idle';

/** Static server-rendered slides are enhanced by Swiper when visible or requested. */
export function ProgressiveSwiper({
  children,
  mode,
  count,
  title,
  eyebrow,
  href = '/collections/all',
}: {
  children: ReactNode;
  mode: 'hero' | 'products';
  count: number;
  title?: string;
  eyebrow?: string;
  href?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const pagination = useRef<HTMLDivElement>(null);
  const instance = useRef<Swiper | null>(null);
  const pending = useRef<Promise<Swiper | undefined> | null>(null);
  const [edges, setEdges] = useState({ start: true, end: count <= 1 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const ensure = useCallback(() => {
    if (instance.current && !instance.current.destroyed) return Promise.resolve(instance.current);
    if (pending.current) return pending.current;
    pending.current = import('@/lib/utils/swiper-engine')
      .then(({ createProductSwiper }) => {
        if (!container.current?.isConnected) return;
        const update = (swiper: Swiper) =>
          setEdges({ start: swiper.isBeginning, end: swiper.isEnd || swiper.isLocked });
        const swiper = createProductSwiper(container.current, {
          slidesPerView: mode === 'hero' ? 1 : 1.35,
          spaceBetween: mode === 'hero' ? 0 : 14,
          breakpoints: mode === 'products' ? { 1024: { slidesPerView: 4, spaceBetween: 20 } } : undefined,
          keyboard: { enabled: true, onlyInViewport: true },
          speed: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450,
          pagination: mode === 'hero' ? { el: pagination.current, clickable: true } : false,
          autoplay:
            mode === 'hero' && count > 1
              ? {
                  delay: 5000,
                  waitForTransition: false,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false,
          a11y: { enabled: true, containerMessage: title || 'Featured collection' },
          on: { init: update, slideChange: update, resize: update, lock: update, unlock: update },
        });
        instance.current = swiper;
        if (mode === 'hero' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          swiper.autoplay.stop();
          setAutoplayPaused(true);
        }
        return swiper;
      })
      .finally(() => {
        pending.current = null;
      });
    return pending.current;
  }, [mode, title, count]);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let cancelIdle = () => {};
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          cancelIdle = afterLoadIdle(() => {
            void ensure().catch(() => {});
          });
        }
      },
      { rootMargin: '240px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelIdle();
      instance.current?.destroy(true, true);
      instance.current = null;
    };
  }, [ensure]);
  const move = async (direction: 'prev' | 'next') => {
    setBusy(true);
    setError('');
    try {
      const swiper = await ensure();
      if (direction === 'next') swiper?.slideNext();
      else swiper?.slidePrev();
    } catch {
      setError('Unable to load slide controls. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const controls = (
    <div className={mode === 'hero' ? 'hero-controls' : 'flex gap-2'} aria-busy={busy}>
      <button
        ref={previous}
        type="button"
        className="round-button"
        aria-label={mode === 'hero' ? 'Previous slide' : `Previous ${title}`}
        disabled={edges.start}
        onClick={() => void move('prev')}
      >
        <Icon name="arrow" className="rotate-180" width={18} />
      </button>
      <button
        ref={next}
        type="button"
        className="round-button"
        aria-label={mode === 'hero' ? 'Next slide' : `Next ${title}`}
        disabled={edges.end}
        onClick={() => void move('next')}
      >
        <Icon name="arrow" width={18} />
      </button>
    </div>
  );
  return (
    <>
      {mode === 'products' ? (
        <div className="section-heading mb-7">
          <div>
            {eyebrow ? <p className="eyebrow mb-3 text-emerald-700">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <div className="flex items-center gap-5">
            <Link href={href} prefetch={false} className="text-link hidden lg:flex">
              View all <Icon name="arrow" width={16} />
            </Link>
            {controls}
          </div>
        </div>
      ) : null}
      <div
        ref={container}
        className={`swiper ${mode === 'hero' ? 'hero-swiper' : 'product-carousel'} progressive-swiper`}
        onPointerEnter={() => void ensure().catch(() => {})}
      >
        <div className="swiper-wrapper">{children}</div>
        {mode === 'hero' ? (
          <>
            <div ref={pagination} className="swiper-pagination" />
            {controls}
            {count > 1 ? (
              <button
                type="button"
                className="hero-playback round-button"
                aria-label={autoplayPaused ? 'Play slideshow' : 'Pause slideshow'}
                onClick={() => {
                  void ensure()
                    .then((swiper) => {
                      if (!swiper) return;
                      if (swiper.autoplay.running) {
                        swiper.autoplay.stop();
                        setAutoplayPaused(true);
                      } else {
                        swiper.autoplay.start();
                        setAutoplayPaused(false);
                      }
                    })
                    .catch(() => setError('Unable to change slideshow playback. Please try again.'));
                }}
              >
                <Icon name={autoplayPaused ? 'play' : 'pause'} width={16} />
              </button>
            ) : null}
          </>
        ) : null}
      </div>
      {error ? (
        <p role="status" className="error-message">
          {error}
        </p>
      ) : null}
    </>
  );
}
