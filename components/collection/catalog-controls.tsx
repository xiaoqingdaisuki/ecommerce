'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useId, type ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons';
import { COLLECTION_SORT_OPTIONS, type CollectionSort } from '@/lib/utils/shopify-routes';
import type { CatalogFilters } from '@/lib/utils/catalog-filters';

type Props = { pathname: string; filters: CatalogFilters; sort: CollectionSort; types: string[] };

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="filter-group">
      <summary>
        {title} <Icon name="chevron" className="disclosure-chevron" width={14} />
      </summary>
      <fieldset className="mt-5 flex flex-col gap-3">
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}

function FilterForm({ pathname, filters, sort, types }: Props) {
  const id = useId();
  return (
    <form
      action={pathname}
      method="get"
      className="flex flex-col gap-6"
      onChange={(event) => {
        const field = event.target;
        if (
          field instanceof HTMLSelectElement ||
          (field instanceof HTMLInputElement && field.type === 'radio')
        )
          event.currentTarget.requestSubmit();
      }}
    >
      <input type="hidden" name="sort_by" value={sort} />
      <FilterGroup title="Availability">
        {[
          ['', 'All products'],
          ['in-stock', 'Available to order'],
          ['sold-out', 'Sold out'],
        ].map(([value, label]) => (
          <label key={value} className="flex cursor-pointer items-center gap-3 text-xs text-neutral-600">
            <input
              type="radio"
              name="availability"
              value={value}
              defaultChecked={
                value ===
                (filters.availability === undefined ? '' : filters.availability ? 'in-stock' : 'sold-out')
              }
              className="h-4 w-4 accent-neutral-800"
            />
            {label}
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Price (USD)">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${id}-min`} className="text-xs text-neutral-500">
              From
            </label>
            <input
              id={`${id}-min`}
              name="min"
              type="number"
              min={0}
              max={1000000}
              step="0.01"
              defaultValue={filters.min ?? ''}
              placeholder="0"
              className="w-full"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${id}-max`} className="text-xs text-neutral-500">
              To
            </label>
            <input
              id={`${id}-max`}
              name="max"
              type="number"
              min={0}
              max={1000000}
              step="0.01"
              defaultValue={filters.max ?? ''}
              placeholder="Any"
              className="w-full"
            />
          </div>
        </div>
      </FilterGroup>
      {types.length ? (
        <FilterGroup title="Product type">
          <select
            name="product_type"
            aria-label="Filter by product type"
            defaultValue={filters.productType ?? ''}
            className="w-full"
          >
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FilterGroup>
      ) : null}
      <button className="button justify-center" type="submit">
        Apply filters <Icon name="arrow" width={16} />
      </button>
      <Link href={pathname} className="text-link self-center text-neutral-500">
        Clear all filters
      </Link>
    </form>
  );
}

export function CatalogSidebar(props: Props) {
  return (
    <aside className="hidden lg:sticky lg:top-28 lg:flex lg:flex-col lg:self-start">
      <div className="mb-6 flex min-h-12 items-center justify-between border-b border-neutral-200 pb-4">
        <h2 className="text-base font-semibold">Filters</h2>
        <Icon name="filter" width={18} />
      </div>
      <FilterForm {...props} />
    </aside>
  );
}

export function CatalogToolbar({
  count,
  withSidebar = false,
  ...props
}: Props & { count: number; withSidebar?: boolean }) {
  const activeCount =
    Number(props.filters.availability !== undefined) +
    Number(props.filters.min !== undefined || props.filters.max !== undefined) +
    Number(Boolean(props.filters.productType));
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex items-center gap-4">
        <Dialog.Root>
          <Dialog.Trigger className={`catalog-filter-trigger ${withSidebar ? 'lg:hidden' : ''}`}>
            <Icon name="filter" width={16} /> Filters
            {activeCount > 0 ? (
              <span className="rounded-full bg-neutral-100 px-1.5 text-[10px]">{activeCount}</span>
            ) : null}
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="dialog-backdrop" />
            <Dialog.Popup className="cart-popup">
              <div className="panel-heading">
                <Dialog.Title>Filter products</Dialog.Title>
                <Dialog.Close className="icon-button" aria-label="Close filters">
                  <Icon name="close" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">
                Refine products by availability and price
              </Dialog.Description>
              <FilterForm {...props} />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
        <p className="text-xs text-neutral-500">
          {count} {count === 1 ? 'product' : 'products'} shown
        </p>
      </div>
      <form action={props.pathname} method="get" className="flex items-center gap-2">
        <input
          type="hidden"
          name="availability"
          value={
            props.filters.availability === undefined
              ? ''
              : props.filters.availability
                ? 'in-stock'
                : 'sold-out'
          }
        />
        <input type="hidden" name="min" value={props.filters.min ?? ''} />
        <input type="hidden" name="max" value={props.filters.max ?? ''} />
        <input type="hidden" name="product_type" value={props.filters.productType ?? ''} />
        <label htmlFor="catalog-sort" className="shrink-0 text-xs text-neutral-500">
          Sort by
        </label>
        <select
          id="catalog-sort"
          name="sort_by"
          defaultValue={props.sort}
          className="max-w-44 border-0 bg-transparent py-2 pl-0 text-xs"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {COLLECTION_SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <noscript>
          <button type="submit" className="button">
            Sort
          </button>
        </noscript>
      </form>
    </div>
  );
}
