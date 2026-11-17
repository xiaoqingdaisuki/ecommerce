'use client';

import { createCartComponents } from '@shopify/hydrogen/react';
import type { cartHandlers } from './cart.server';

export const { CartProvider, useCart, useCartForm, useSuspenseCart } =
  createCartComponents<typeof cartHandlers>();
