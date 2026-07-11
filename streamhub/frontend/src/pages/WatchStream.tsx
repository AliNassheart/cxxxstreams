import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket, connectSocket } from '../services/socket';
import { VideoPlayer } from '../components/VideoPlayer';
import { LiveChat } from '../components/LiveChat';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Stream } from '../types';

export default function WatchStream() {
  const { id } = useParams<{ id: string }>();
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/streams/${id}`)
      .then(({ data }) => setStream(data.stream))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const socket = connectSocket();
    const onStatus = (payload: { streamId: string; status: Stream['status']; hlsUrl?: string }) => {
      if (payload.streamId !== id) return;
      setStream((prev) => (prev ? { ...prev, status: payload.status, hls_url: payload.hlsUrl ?? prev.hls_url } : prev));
    };
    getSocket().on('stream:status', onStatus);
    return () => {
      getSocket().off('stream:status', onStatus);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-display text-lg text-ink-300">Stream not found</p>
      </div>
    );
  }

  const isLive = stream.status === 'live';

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
      <div>
        <VideoPlayer src={isLive ? stream.hls_url : null} poster={stream.thumbnail_url} isLive={isLive} />
        <div className="mt-4">
          <h1 className="font-display text-xl font-semibold text-ink-100">{stream.title}</h1>
          {stream.description && <p className="mt-2 text-sm text-ink-500">{stream.description}</p>}
        </div>
      </div>

      <div className="h-[70vh] lg:h-[calc(100vh-6rem)]">
        <LiveChat streamId={stream.id} />
      </div>
    </div>
  );
}
