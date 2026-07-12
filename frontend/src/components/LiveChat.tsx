import { useEffect, useRef, useState } from 'react';
import { connectSocket, getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import type { ChatMessage } from '../types';

export function LiveChat({ streamId }: { streamId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit('stream:join', { streamId });

    const onMessage = (msg: ChatMessage) => setMessages((prev) => [...prev.slice(-199), msg]);
    const onViewerCount = (payload: { streamId: string; count: number }) => {
      if (payload.streamId === streamId) setViewerCount(payload.count);
    };

    socket.on('chat:message', onMessage);
    socket.on('stream:viewerCount', onViewerCount);

    return () => {
      socket.emit('stream:leave', { streamId });
      socket.off('chat:message', onMessage);
      socket.off('stream:viewerCount', onViewerCount);
    };
  }, [streamId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !user) return;
    getSocket().emit('chat:message', { streamId, body });
    setDraft('');
  };

  return (
    <div className="card flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-surface-800 px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-ink-100">Live chat</h3>
        <div className="flex items-center gap-1.5 font-mono text-xs text-ink-500">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
            <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          </svg>
          {viewerCount.toLocaleString()} watching
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="pt-6 text-center text-xs text-ink-700">No messages yet — say hello.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fade-up text-sm leading-snug">
            <span
              className={
                msg.role === 'admin'
                  ? 'font-semibold text-live-400'
                  : msg.role === 'streamer'
                  ? 'font-semibold text-signal-400'
                  : 'font-semibold text-ink-300'
              }
            >
              {msg.username}
            </span>
            <span className="ml-1.5 text-ink-100">{msg.body}</span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-surface-800 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!user}
          maxLength={500}
          placeholder={user ? 'Send a message' : 'Sign in to chat'}
          className="input-field !py-2"
        />
        <button type="submit" disabled={!user || !draft.trim()} className="btn-primary !px-3 !py-2 text-xs">
          Send
        </button>
      </form>
    </div>
  );
}
