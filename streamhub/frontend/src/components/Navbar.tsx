import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-800 bg-surface-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal-500" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-signal-400" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-100">StreamHub</span>
        </Link>

        <nav className="hidden items-center gap-6 font-body text-sm text-ink-300 sm:flex">
          <Link to="/" className="transition-colors hover:text-ink-100">
            Browse
          </Link>
          {user && (
            <Link to="/dashboard" className="transition-colors hover:text-ink-100">
              Dashboard
            </Link>
          )}
          {(user?.role === 'streamer' || user?.role === 'admin') && (
            <Link to="/studio" className="transition-colors hover:text-ink-100">
              Studio
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="transition-colors hover:text-ink-100">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden font-mono text-xs text-ink-500 sm:inline">@{user.username}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn-secondary !px-3 !py-1.5 text-xs"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-3 !py-1.5 text-xs">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !px-3 !py-1.5 text-xs">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
