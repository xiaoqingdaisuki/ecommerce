'use client';

import { useCommerceActions } from '@/components/ui/commerce-provider';
import { Icon } from '@/components/ui/icons';

export function QuickBuyButton({ handle, title }: { handle: string; title: string }) {
  const { openQuickBuy } = useCommerceActions();
  return (
    <button
      type="button"
      className="button card-quick-shop"
      aria-label={`QUICK SHOP: ${title}`}
      onClick={() => openQuickBuy(handle)}
    >
      QUICK SHOP <Icon name="bag" width={16} />
    </button>
  );
}
