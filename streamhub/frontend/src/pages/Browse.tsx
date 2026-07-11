import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StreamCard } from '../components/StreamCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Stream } from '../types';

export default function Browse() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: number;
    const fetchStreams = async () => {
      try {
        const { data } = await api.get('/streams/live');
        setStreams(data.streams);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
    interval = window.setInterval(fetchStreams, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-100">Live now</h1>
        <p className="mt-1 text-sm text-ink-500">Streams currently broadcasting from authorized StreamHub creators.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={32} />
        </div>
      ) : streams.length === 0 ? (
        <div className="card flex flex-col items-center gap-1.5 py-20 text-center">
          <p className="font-display text-sm font-medium text-ink-300">Nothing live right now</p>
          <p className="text-xs text-ink-700">Check back soon, or start your own broadcast from the Studio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {streams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}
    </div>
  );
}
