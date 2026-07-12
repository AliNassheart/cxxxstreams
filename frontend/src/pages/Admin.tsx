import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Stream, User, UserRole } from '../types';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'streams'>('users');

  const load = async () => {
    const [usersRes, streamsRes] = await Promise.all([api.get('/users'), api.get('/streams')]);
    setUsers(usersRes.data.users);
    setStreams(streamsRes.data.streams);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId: string, role: UserRole) => {
    await api.patch(`/users/${userId}/role`, { role });
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink-100">Admin panel</h1>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setTab('users')}
          className={tab === 'users' ? 'btn-primary !px-3 !py-1.5 text-xs' : 'btn-secondary !px-3 !py-1.5 text-xs'}
        >
          Users
        </button>
        <button
          onClick={() => setTab('streams')}
          className={tab === 'streams' ? 'btn-primary !px-3 !py-1.5 text-xs' : 'btn-secondary !px-3 !py-1.5 text-xs'}
        >
          All streams
        </button>
      </div>

      {tab === 'users' && (
        <div className="card mt-5 divide-y divide-surface-800">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-body text-sm font-medium text-ink-100">@{u.username}</p>
                <p className="text-xs text-ink-500">{u.email}</p>
              </div>
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                className="input-field w-auto !py-1.5 text-xs"
              >
                <option value="viewer">Viewer</option>
                <option value="streamer">Streamer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === 'streams' && (
        <div className="card mt-5 divide-y divide-surface-800">
          {streams.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-body text-sm font-medium text-ink-100">{s.title}</p>
                <p className="text-xs text-ink-500">{s.viewer_count} watching</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  s.status === 'live' ? 'bg-live-500/15 text-live-400' : 'bg-surface-800 text-ink-500'
                }`}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
