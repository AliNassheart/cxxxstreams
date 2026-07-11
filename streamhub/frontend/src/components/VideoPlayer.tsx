import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string | null;
  poster?: string | null;
  isLive: boolean;
}

export function VideoPlayer({ src, poster, isLive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, backBufferLength: 30 });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          setError('Stream unavailable. It may have ended or not started yet.');
        }
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari / iOS)
      video.src = src;
    } else {
      setError('Your browser does not support HLS playback.');
    }
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-surface-800 bg-black">
      {src ? (
        <video
          ref={videoRef}
          poster={poster ?? undefined}
          controls
          autoPlay
          muted
          playsInline
          className="h-full w-full"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-900 text-ink-500">
          <span className="font-display text-sm">Stream is offline</span>
          <span className="text-xs text-ink-700">Check back when the broadcaster goes live.</span>
        </div>
      )}

      {isLive && src && (
        <div className="live-badge absolute left-3 top-3 shadow-lg">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-live-500" />
          Live
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-950/90 px-6 text-center text-sm text-ink-300">
          {error}
        </div>
      )}
    </div>
  );
}
