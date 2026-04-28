'use client';

import { useMemo, useState } from 'react';

type Props = { orgId: string; orgName: string };

export function OnboardWizard({ orgId, orgName }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paste, setPaste] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const parsed = useMemo(() => {
    return paste
      .trim()
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.includes('@') && s.includes('.'));
  }, [paste]);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/hlm/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, emails: parsed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Send failed');
      }
      const data = await res.json();
      setSentCount(data.sent ?? parsed.length);
      setDone(true);
    } catch (e: any) {
      alert(`Error sending invites: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 600, margin: '64px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>✦</div>
        <h2 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 16 }}>
          {sentCount} invite{sentCount !== 1 ? 's' : ''} sent.
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
          Each person will receive an email with a link to join the{' '}
          <strong style={{ color: 'var(--text)' }}>{orgName}</strong> AI training program.
          Once they accept, they&apos;ll appear in the People tab.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setPaste('');
            setStep(1);
          }}
          style={{
            marginTop: 24,
            padding: '10px 20px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            cursor: 'pointer',
            color: 'var(--text)',
          }}
        >
          Invite more people
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        {([1, 2, 3] as const).map((n) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: step >= n ? 'var(--accent)' : 'var(--bg-hover)',
                color: step >= n ? 'var(--accent-ink)' : 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {n}
            </div>
            <div style={{ fontSize: 13, color: step >= n ? 'var(--text)' : 'var(--text-muted)' }}>
              {n === 1 ? 'Paste emails' : n === 2 ? 'Preview list' : 'Send invites'}
            </div>
            {n < 3 && (
              <div style={{ width: 32, height: 1, background: 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
            Paste email addresses — one per line, or comma-separated.
          </p>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder={
              'jane@homelifemedia.com\nbob@homelifemedia.com\nalice@homelifemedia.com'
            }
            style={{
              width: '100%',
              minHeight: 200,
              padding: 14,
              fontSize: 13,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {parsed.length} valid email{parsed.length !== 1 ? 's' : ''} detected
            </span>
            <button
              onClick={() => setStep(2)}
              disabled={parsed.length === 0}
              style={{
                padding: '10px 20px',
                background: parsed.length > 0 ? 'var(--accent)' : 'var(--bg-hover)',
                color: parsed.length > 0 ? 'var(--accent-ink)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 600,
                cursor: parsed.length > 0 ? 'pointer' : 'default',
                border: 'none',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>
            Preview — {parsed.length} people
          </h3>
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 16,
              maxHeight: 320,
              overflowY: 'auto',
              marginBottom: 20,
            }}
          >
            {parsed.map((email, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 0',
                  fontSize: 13,
                  borderBottom: i < parsed.length - 1 ? '1px solid var(--border)' : 'none',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {email}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: 'transparent',
                color: 'var(--text)',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              style={{
                padding: '10px 20px',
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Review & Send →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '20px 24px',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 500 }}>
              Ready to send {parsed.length} invite{parsed.length !== 1 ? 's' : ''}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              Each person will receive an email from Truos with a personal link to join{' '}
              <strong style={{ color: 'var(--text)' }}>{orgName}</strong>&apos;s AI training
              program. Once accepted, they&apos;ll appear in your People tab.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: 'transparent',
                color: 'var(--text)',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: '12px 24px',
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 600,
                cursor: sending ? 'default' : 'pointer',
                opacity: sending ? 0.7 : 1,
                border: 'none',
              }}
            >
              {sending
                ? 'Sending…'
                : `Send ${parsed.length} invite${parsed.length !== 1 ? 's' : ''} →`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
