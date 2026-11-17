import { ProductSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <div className="store-container page-section min-h-screen" role="status" aria-busy="true">
      <div className="skeleton skeleton-title" />
      <ProductSkeleton />
      <span className="sr-only">Loading products…</span>
    </div>
  );
}
