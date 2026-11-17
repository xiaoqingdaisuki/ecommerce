'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const QuickBuy = dynamic(() => import('@/components/product/quick-buy').then((module) => module.QuickBuy), {
  ssr: false,
});
const CommerceContext = createContext<{
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  openQuickBuy: (handle: string) => void;
} | null>(null);
const CommerceActionsContext = createContext<{
  setCartOpen: (open: boolean) => void;
  openQuickBuy: (handle: string) => void;
} | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [quickHandle, setQuickHandle] = useState<string | null>(null);
  const actions = useMemo(() => ({ setCartOpen, openQuickBuy: setQuickHandle }), []);
  return (
    <CommerceActionsContext.Provider value={actions}>
      <CommerceContext.Provider value={{ cartOpen, ...actions }}>
        {children}
        {quickHandle ? (
          <QuickBuy key={quickHandle} handle={quickHandle} onClose={() => setQuickHandle(null)} />
        ) : null}
      </CommerceContext.Provider>
    </CommerceActionsContext.Provider>
  );
}

export function useCommerceActions() {
  const value = useContext(CommerceActionsContext);
  if (!value) throw new Error('CommerceProvider is required');
  return value;
}

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) throw new Error('CommerceProvider is required');
  return value;
}
