import type { ProductCard as ProductCardData } from '@/lib/shopify/queries/catalog';
import { ProductCard } from '@/components/product/product-card';

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length)
    return (
      <div className="empty-state">
        <h2>No products found.</h2>
        <p>Try another search or explore a different collection.</p>
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 3} />
      ))}
    </div>
  );
}
