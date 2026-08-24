import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="font-display text-6xl font-bold text-ink">404</p>
      <p className="mt-3 text-ink-faint">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to Dashboard
      </Link>
    </div>
  );
}
