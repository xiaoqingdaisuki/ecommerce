import Link from 'next/link';
import { pageHref, type ShopifySearchParams } from '@/lib/utils/shopify-routes';

export function Pagination({
  pathname,
  params,
  page,
  hasNextPage,
}: {
  pathname: string;
  params: ShopifySearchParams;
  page: number;
  hasNextPage: boolean;
}) {
  if (page === 1 && !hasNextPage) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link className="button button-outline" href={pageHref(pathname, params, page - 1)}>
          ← Previous
        </Link>
      ) : null}
      <span className="muted small" aria-current="page">
        {' '}
        Page {page}{' '}
      </span>
      {hasNextPage ? (
        <Link className="button button-outline" href={pageHref(pathname, params, page + 1)}>
          Next page →
        </Link>
      ) : null}
    </nav>
  );
}
