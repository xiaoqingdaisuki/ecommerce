export default function Loading() {
  return (
    <div className="container page-section" role="status">
      <div className="skeleton skeleton-title" />
      <div className="product-grid">
        {[1, 2, 3, 4].map((key) => (
          <div className="skeleton skeleton-product" key={key} />
        ))}
      </div>
      <span className="sr-only">Loading products…</span>
    </div>
  );
}
