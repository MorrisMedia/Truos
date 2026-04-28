'use client';

import { useMemo, useState } from 'react';

type Step = 1 | 2 | 3;

const SAMPLE_PASTE = `sarah.chen@viewsonic.com,Sarah Chen,Executive
marcus.reyes@viewsonic.com,Marcus Reyes,Sales — Americas
priya.patel@viewsonic.com,Priya Patel,Marketing
jordan.kim@viewsonic.com,Jordan Kim,Sales — Americas
aisha.diop@viewsonic.com,Aisha Diop,Customer Success
tom.schaefer@viewsonic.com,Tom Schaefer,Channel Partners`;

export function OnboardWizard() {
  const [step, setStep] = useState<Step>(1);
  const [paste, setPaste] = useState('');
  const [launched, setLaunched] = useState(false);

  const parsed = useMemo(() => {
    if (!paste.trim()) return [] as { email: string; name: string; dept: string }[];
    return paste.trim().split(/\n+/).map((line) => {
      const [email, name, dept] = line.split(',').map((s) => s?.trim() ?? '');
      return { email, name, dept };
    }).filter((r) => r.email);
  }, [paste]);

  const fakedCount = paste.trim() ? 847 : 0;

  const grouped = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of parsed) m.set(r.dept || 'Unassigned', (m.get(r.dept || 'Unassigned') ?? 0) + 1);
    if (parsed.length && parsed.length < 847) {
      const pads = [
        ['ColorPro Creator', 145], ['Sales — Americas', 178], ['Sales — EMEA', 122],
        ['Product Engineering', 156], ['Marketing', 73], ['Customer Success', 51],
        ['Channel Partners', 48], ['Operations', 38], ['Finance & Legal', 22], ['HR / People', 14],
      ] as const;
      for (const [dept, n] of pads) m.set(dept as string, (m.get(dept as string) ?? 0) + (n as number));
    }
    return Array.from(m.entries()).map(([dept, count]) => ({ dept, count }));
  }, [parsed]);

  if (launched) {
    return (
      <div style={{ maxWidth: 720, margin: '64px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>✦</div>
        <h2 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 16 }}>847 invites scheduled.</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
          64% of large rollouts hit 70% activation in two weeks — we&apos;ll have you there by{' '}
          <strong style={{ color: 'var(--text)' }}>{new Date(Date.now() + 14 * 86400000).toLocaleDateString()}</strong>.
        </p>
        <div style={{ marginTop: 28, padding: 14, background: 'var(--bg-panel)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-muted)' }}>
          First wave: ColorPro Creator (229)  ·  Sending now
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step >= n ? 'var(--accent)' : 'var(--bg-hover)',
              color: step >= n ? 'var(--accent-ink)' : 'var(--text-muted)',
              display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}>{n}</div>
            <div style={{ fontSize: 13, color: step >= n ? 'var(--text)' : 'var(--text-muted)' }}>
              {n === 1 ? 'Paste roster' : n === 2 ? 'Confirm structure' : 'Pick rollout'}
            </div>
            {n < 3 && <div style={{ width: 32, height: 1, background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 8 }}>Paste your roster</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>
            Emails, names, or your full org CSV (email,name,department per line).
          </p>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder={SAMPLE_PASTE}
            rows={10}
            style={{
              width: '100%',
              padding: 16,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <button
              onClick={() => setPaste(SAMPLE_PASTE)}
              style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Paste sample
            </button>
            <div style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              Detected {fakedCount.toLocaleString()} people
            </div>
          </div>

          <div style={{ marginTop: 32, padding: 16, background: 'var(--bg-panel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Or connect</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              {['Workday', 'Okta', 'BambooHR', 'Google Workspace', 'Microsoft 365'].map((p) => (
                <span key={p} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>{p}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button
              onClick={() => setStep(2)}
              disabled={!parsed.length}
              style={{
                padding: '10px 20px',
                background: parsed.length ? 'var(--accent)' : 'var(--bg-hover)',
                color: parsed.length ? 'var(--accent-ink)' : 'var(--text-dim)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14, fontWeight: 600,
                cursor: parsed.length ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Confirm structure →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 8 }}>Confirm structure</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>
            We grouped these by email pattern. Edit anything that&apos;s wrong.
          </p>
          <div style={{ background: 'var(--accent)', color: 'var(--accent-ink)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 12, marginBottom: 16 }}>
            ✦ AI-suggested groupings — drag people between teams to adjust.
          </div>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {grouped.slice(0, 10).map((g, i) => (
              <div key={g.dept} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < 9 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 14 }}>{g.dept}</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{g.count} people</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setStep(1)} style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>← Back</button>
            <button
              onClick={() => setStep(3)}
              style={{ padding: '10px 20px', background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Next: Pick rollout →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 8 }}>Pick your rollout</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
            How aggressive do you want to be? Most large orgs go with waves.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { id: 'all',   title: 'Invite all today',   sub: '847 emails, send now',                        recommended: false },
              { id: 'wave',  title: 'Wave by department', sub: 'ColorPro first, then Sales, then the rest',   recommended: true },
              { id: 'pilot', title: 'Pilot first 50',     sub: 'Test the experience before full rollout',     recommended: false },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLaunched(true)}
                style={{
                  padding: 20,
                  background: 'var(--bg-panel)',
                  border: opt.recommended ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  color: 'var(--text)',
                }}
              >
                {opt.recommended && (
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, color: 'var(--accent-ink)', background: 'var(--accent)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.1em' }}>
                    RECOMMENDED
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{opt.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button onClick={() => setStep(2)} style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
