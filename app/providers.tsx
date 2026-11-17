'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/lib/shopify/cart.client';
import { CommerceProvider } from '@/components/ui/commerce-provider';
import { WebVitals } from '@/components/performance/web-vitals';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <CommerceProvider>
        {children}
        <WebVitals />
      </CommerceProvider>
    </CartProvider>
  );
}
