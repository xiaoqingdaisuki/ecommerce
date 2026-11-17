'use client';

import { Dialog } from '@base-ui/react/dialog';
import {
  PredictiveSearchProvider,
  usePredictiveSearch,
  usePredictiveSearchActions,
  usePredictiveSearchForm,
} from '@shopify/hydrogen/react';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui/icons';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  return (
    <PredictiveSearchProvider limit={4}>
      <SearchOverlay open={open} onOpenChange={setOpen} />
    </PredictiveSearchProvider>
  );
}

function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { clear } = usePredictiveSearchActions();
  const { formProps, register } = usePredictiveSearchForm();
  const { result, status, error } = usePredictiveSearch();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) clear();
        onOpenChange(value);
      }}
    >
      <Dialog.Trigger className="icon-button" aria-label="Search">
        <Icon name="search" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Viewport className="dialog-viewport">
          <Dialog.Popup className="search-popup">
            <div className="panel-heading">
              <Dialog.Title>Find your next favorite.</Dialog.Title>
              <Dialog.Close className="icon-button" aria-label="Close search">
                <Icon name="close" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="muted">Search products from our collection.</Dialog.Description>
            <form {...formProps()} className="search-form">
              <input
                {...register('query')}
                aria-label="Search products"
                placeholder="Search products, collections, possibilities…"
                autoComplete="off"
              />
              <button className="icon-button" type="submit" aria-label="Submit search">
                <Icon name="arrow" />
              </button>
            </form>
            <div className="search-results" aria-live="polite" aria-busy={status === 'loading'}>
              {status === 'loading' ? (
                <p role="status" className="muted">
                  Searching…
                </p>
              ) : null}
              {status === 'error' ? <p role="alert">{error}</p> : null}
              {result.items.products.map((product) => (
                <Link
                  key={product.id}
                  className="search-result"
                  href={`/products/${product.handle}`}
                  onClick={() => onOpenChange(false)}
                >
                  <span>{product.title}</span>
                  <Icon name="arrow" />
                </Link>
              ))}
              {status === 'success' && result.term && !result.total ? (
                <p>No matching products. Try another search.</p>
              ) : null}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
