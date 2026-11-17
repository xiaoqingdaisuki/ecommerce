import Swiper from 'swiper';
import { A11y, Autoplay, Keyboard, Pagination } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

/** A narrow async entry keeps unused Swiper effects out of storefront chunks. */
export function createProductSwiper(element: HTMLElement, options: SwiperOptions) {
  return new Swiper(element, { ...options, modules: [A11y, Autoplay, Keyboard, Pagination] });
}
