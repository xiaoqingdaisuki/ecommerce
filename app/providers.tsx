'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/lib/shopify/cart.client';
import type { cartHandlers } from '@/lib/shopify/cart.server';

type CartData = Awaited<ReturnType<typeof cartHandlers.get>>['data'];

export function Providers({ children, cartData }: { children: ReactNode; cartData: Promise<CartData> }) {
  return <CartProvider initialData={cartData}>{children}</CartProvider>;
}
