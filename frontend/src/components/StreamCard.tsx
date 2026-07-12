import { Link } from 'react-router-dom';
import type { Stream } from '../types';

export function StreamCard({ stream }: { stream: Stream }) {
  const isLive = stream.status === 'live';

  return (
    <Link
      to={`/watch/${stream.id}`}
      className="card group animate-fade-up overflow-hidden transition-transform hover:-translate-y-0.5 hover:border-surface-700"
    >
      <div className="relative aspect-video overflow-hidden bg-surface-800">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-700">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current opacity-40">
              <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm5.5 3.6v6.8l6-3.4-6-3.4Z" />
            </svg>
          </div>
        )}
        {isLive && (
          <div className="live-badge absolute left-2.5 top-2.5">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-live-500" />
            Live
          </div>
        )}
        {isLive && (
          <div className="absolute bottom-2.5 right-2.5 rounded-md bg-surface-950/80 px-2 py-0.5 font-mono text-xs text-ink-100">
            {stream.viewer_count.toLocaleString()} watching
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="truncate font-display text-sm font-semibold text-ink-100">{stream.title}</h3>
        {stream.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-500">{stream.description}</p>
        )}
      </div>
    </Link>
  );
}
