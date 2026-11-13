'use client';

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container page-section empty-state">
      <p className="eyebrow">A brief pause</p>
      <h1>We couldn’t load this page.</h1>
      <p className="muted">Please try again in a moment.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
