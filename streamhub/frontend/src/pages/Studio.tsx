import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Stream } from '../types';

const RTMP_SERVER_URL = 'rtmp://your-streamhub-server.example.com/live';

export default function Studio() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get('/streams/mine/list');
    setStreams(data.streams);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createStream = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.post('/streams', { title: title.trim(), description: description.trim() || undefined });
      setTitle('');
      setDescription('');
      await load();
    } finally {
      setCreating(false);
    }
  };

  const regenerateKey = async (streamId: string) => {
    if (!confirm('Regenerate this stream key? Your current OBS setup will stop working until updated.')) return;
    await api.post(`/streams/${streamId}/regenerate-key`);
    await load();
  };

  const deleteStream = async (streamId: string) => {
    if (!confirm('Delete this stream permanently?')) return;
    await api.delete(`/streams/${streamId}`);
    await load();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink-100">Streamer studio</h1>
      <p className="mt-1 text-sm text-ink-500">Create a stream, then point OBS at your unique stream key.</p>

      <form onSubmit={createStream} className="card mt-6 space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold text-ink-100">New stream</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Stream title"
          className="input-field"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="input-field resize-none"
        />
        <button type="submit" disabled={creating} className="btn-primary">
          {creating ? 'Creating…' : 'Create stream'}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {streams.map((stream) => (
          <div key={stream.id} className="card animate-fade-up p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-sm font-semibold text-ink-100">{stream.title}</h3>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    stream.status === 'live'
                      ? 'bg-live-500/15 text-live-400'
                      : 'bg-surface-800 text-ink-500'
                  }`}
                >
                  {stream.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => deleteStream(stream.id)} className="btn-secondary !px-3 !py-1.5 text-xs">
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-surface-800 bg-surface-950/60 p-3.5 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-700">RTMP server URL</span>
              </div>
              <p className="mt-0.5 select-all break-all text-ink-300">{RTMP_SERVER_URL}</p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-ink-700">Stream key</span>
                <button
                  onClick={() => setRevealedKeyId(revealedKeyId === stream.id ? null : stream.id)}
                  className="text-signal-400 hover:text-signal-300"
                >
                  {revealedKeyId === stream.id ? 'Hide' : 'Reveal'}
                </button>
              </div>
              <p className="mt-0.5 select-all break-all text-ink-300">
                {revealedKeyId === stream.id ? stream.stream_key : '•'.repeat(24)}
              </p>
            </div>

            <button onClick={() => regenerateKey(stream.id)} className="mt-3 text-xs text-ink-500 hover:text-ink-300">
              Regenerate stream key
            </button>

            <p className="mt-4 text-xs text-ink-700">
              In OBS: Settings → Stream → Service: Custom → paste the server URL and stream key above, then click
              Start Streaming. Never share your stream key — anyone with it can broadcast to your channel.
            </p>
          </div>
        ))}

        {streams.length === 0 && (
          <div className="card py-12 text-center text-sm text-ink-700">You haven't created a stream yet.</div>
        )}
      </div>
    </div>
  );
}
