export function ProductSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="overflow-hidden rounded-xl border border-neutral-100" key={index}>
          <div className="skeleton aspect-square" />
          <div className="flex flex-col gap-4 p-5">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-5 w-4/5 rounded" />
            <div className="skeleton h-8 rounded" />
            <div className="skeleton h-10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="product-detail-grid" role="status" aria-label="Loading product options">
      <div className="skeleton aspect-square rounded-xl" />
      <div className="flex flex-col gap-5 py-4">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-20 rounded" />
        <div className="skeleton h-10 w-32 rounded" />
        <div className="skeleton h-24 rounded" />
        <div className="skeleton h-36 rounded" />
      </div>
    </div>
  );
}
