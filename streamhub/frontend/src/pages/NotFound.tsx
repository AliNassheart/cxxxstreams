import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-3xl font-semibold text-ink-100">404</p>
      <p className="text-sm text-ink-500">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to StreamHub
      </Link>
    </div>
  );
}
