'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  token: string;
  userName: string;
};

export function JoinClient({ token, userName }: Props) {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch('/api/hlm/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Failed to accept invite');
      }
      router.push('/hlm');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
      setJoining(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
        Accepting as{' '}
        <strong style={{ color: 'var(--text)' }}>{userName}</strong>
      </div>
      {error && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: '#ef4444',
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}
      <button
        onClick={handleJoin}
        disabled={joining}
        style={{
          padding: '14px 32px',
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 16,
          fontWeight: 600,
          cursor: joining ? 'default' : 'pointer',
          opacity: joining ? 0.7 : 1,
          border: 'none',
        }}
      >
        {joining ? 'Joining…' : 'Accept invitation →'}
      </button>
    </div>
  );
}
