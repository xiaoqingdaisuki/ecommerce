import Swiper from 'swiper';
import { A11y, Keyboard, Navigation, Pagination, Thumbs, Zoom } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

export function createGallery(element: HTMLElement, options: SwiperOptions) {
  return new Swiper(element, { ...options, modules: [A11y, Keyboard, Navigation, Pagination, Thumbs, Zoom] });
}

export function createThumbnails(element: HTMLElement, options: SwiperOptions) {
  return new Swiper(element, { ...options, modules: [A11y] });
}
