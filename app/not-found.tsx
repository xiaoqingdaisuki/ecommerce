import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container page-section empty-state">
      <p className="eyebrow">404 / Not found</p>
      <h1>A little off the beaten path.</h1>
      <p className="muted">This page may have moved or is no longer available.</p>
      <Link href="/collections/all" className="button">
        Explore the collection ↗
      </Link>
    </section>
  );
}
