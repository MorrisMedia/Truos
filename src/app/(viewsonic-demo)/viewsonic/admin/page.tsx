import Link from 'next/link';
import { SEED, activationByDept } from '../_data/seed';
import { MetricCard } from '../_components/MetricCard';
import { DepartmentBar } from '../_components/DepartmentBar';

export default function AdminPulse() {
  const totals = activationByDept();
  const totalActivated = totals.reduce((s, t) => s + t.activated, 0);
  const totalPeople = SEED.people.length;
  const orgPct = Math.round((totalActivated / totalPeople) * 100);
  const certsEarned = SEED.progress.filter((p) => p.status === 'completed').length;

  const sortedTotals = [...totals].sort((a, b) => b.pct - a.pct);
  const riskDepts = totals.filter((t) => t.pct < 20);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>This quarter</div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Org pulse</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          LIVE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <MetricCard label="Active learners"         value={totalActivated.toLocaleString()} delta={{ direction: 'up', magnitude: '14%' }} />
        <MetricCard label="Org-wide activation"     value={`${orgPct}%`}                    delta={{ direction: 'up', magnitude: '8 pts' }} />
        <MetricCard label="Certificates earned"     value={certsEarned.toLocaleString()}    delta={{ direction: 'up', magnitude: '47' }} />
        <MetricCard label="Training hours saved"    value="$148K"                            sublabel="Estimated based on hours-to-certify benchmark" />
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>Activation by department</h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Last 30 days
          </span>
        </div>
        <div>
          {sortedTotals.map((t) => (
            <DepartmentBar
              key={t.department.id}
              name={t.department.name}
              pct={t.pct}
              count={t.activated}
              total={t.total}
              flag={t.pct >= 75 ? 'win' : t.pct < 20 ? 'risk' : undefined}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500 }}>Risk list</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>({riskDepts.length})</span>
          </div>
          {riskDepts.map((d) => (
            <Link key={d.department.id} href="/viewsonic/admin/people" style={{ display: 'block', padding: '8px 0', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--danger)' }}>▸</span>{' '}
              {d.total - d.activated} in {d.department.name} — {d.pct}% activation
            </Link>
          ))}
          <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--warn)' }}>▸</span>{' '}
            Q2 deadline at 38 days, {totalPeople - totalActivated} not started
          </div>
        </div>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Top learners this week</h3>
          {[
            { name: 'Jordan Kim',   hours: 18 },
            { name: 'Aisha Diop',   hours: 14 },
            { name: 'Tom Schaefer', hours: 12 },
            { name: 'Wei-Ling Hsu', hours: 11 },
            { name: 'Mei Tanaka',   hours: 9 },
          ].map((p, i) => (
            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <span><span style={{ color: 'var(--text-dim)', marginRight: 8, fontFamily: 'var(--font-mono)' }}>{i + 1}</span>{p.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.hours} hrs</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Seat utilization</div>
          <div style={{ fontSize: 22, marginTop: 4 }}>
            <span style={{ fontWeight: 600 }}>{SEED.org.seatsActive.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}> / {SEED.org.seatsContracted.toLocaleString()} seats</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            ${SEED.org.monthlySpendUsd.toLocaleString()}/mo  ·  Contract through {new Date(SEED.org.contractEnd).toLocaleDateString()}
          </div>
        </div>
        <Link href="#" style={{ fontSize: 13, color: 'var(--accent)' }}>Activate remaining {SEED.org.seatsContracted - SEED.org.seatsActive} seats →</Link>
      </div>
    </div>
  );
}
