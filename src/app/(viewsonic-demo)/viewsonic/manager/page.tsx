import Link from 'next/link';
import { SEED } from '../_data/seed';
import { MetricCard } from '../_components/MetricCard';

export default function ManagerPulse() {
  const myTeam = SEED.people.filter((p) => p.departmentId === 'sales-amer');
  const completed = myTeam.filter((p) =>
    SEED.progress.some((pr) => pr.personId === p.id && pr.status === 'completed')
  );
  const inProgress = myTeam.filter((p) =>
    !completed.includes(p) && SEED.progress.some((pr) => pr.personId === p.id && pr.status === 'in_progress')
  );
  const notStarted = myTeam.length - completed.length - inProgress.length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>My team — Sales Americas</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Team pulse</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Team size"       value={myTeam.length} />
        <MetricCard label="Certified"       value={completed.length} delta={{ direction: 'up', magnitude: '6' }} />
        <MetricCard label="In progress"     value={inProgress.length} />
        <MetricCard label="Not started"     value={notStarted} delta={{ direction: 'down', magnitude: '4', positive: true }} />
      </div>

      <div style={{
        background: 'linear-gradient(135deg, var(--bg-panel), var(--bg-hover))',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius)',
        padding: '24px 28px',
      }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 8 }}>QUICK WIN</div>
        <h2 style={{ fontSize: 20, letterSpacing: '-0.02em', marginBottom: 8 }}>
          12 reps haven&apos;t started AI Foundations.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
          One-click nudge with personalized auto-emails. Average response: 47% start within 24 hours.
        </p>
        <Link
          href="/viewsonic/manager/nudge"
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: 600,
          }}
        >
          Nudge 12 reps →
        </Link>
      </div>
    </div>
  );
}
