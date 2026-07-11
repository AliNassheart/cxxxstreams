import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card animate-fade-up p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-500/15 font-display text-lg font-semibold text-signal-400">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink-100">@{user.username}</h1>
            <p className="text-xs text-ink-500">
              {user.email} · <span className="capitalize text-signal-400">{user.role}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link to="/" className="card animate-fade-up p-5 transition-colors hover:border-surface-700">
          <h2 className="font-display text-sm font-semibold text-ink-100">Browse streams</h2>
          <p className="mt-1 text-xs text-ink-500">See who's live right now.</p>
        </Link>

        {(user.role === 'streamer' || user.role === 'admin') && (
          <Link to="/studio" className="card animate-fade-up p-5 transition-colors hover:border-surface-700">
            <h2 className="font-display text-sm font-semibold text-ink-100">Streamer studio</h2>
            <p className="mt-1 text-xs text-ink-500">Manage your streams, keys, and metadata.</p>
          </Link>
        )}

        {user.role === 'admin' && (
          <Link to="/admin" className="card animate-fade-up p-5 transition-colors hover:border-surface-700">
            <h2 className="font-display text-sm font-semibold text-ink-100">Admin panel</h2>
            <p className="mt-1 text-xs text-ink-500">Manage users, roles, and all streams.</p>
          </Link>
        )}

        {user.role === 'viewer' && (
          <div className="card animate-fade-up p-5">
            <h2 className="font-display text-sm font-semibold text-ink-100">Want to broadcast?</h2>
            <p className="mt-1 text-xs text-ink-500">Ask a StreamHub admin to upgrade your account to streamer access.</p>
          </div>
        )}
      </div>
    </div>
  );
}
