import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDivisionLedBy } from '@/lib/org';
import { pointsForCourse } from '@/lib/league';
import { findCourse, ALL_COURSES } from '@/content/courses';

export default async function TeamRoster() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const division = await getDivisionLedBy(session.user.id);
  if (!division) return <div style={{ color: 'var(--text-muted)' }}>You aren&rsquo;t leading any division yet.</div>;

  const members = await prisma.user.findMany({
    where: { divisionId: division.id },
    select: {
      id: true, name: true, email: true,
      certificates: { select: { courseId: true, issuedAt: true } },
      _count: { select: { progress: true } },
    },
  });

  const ranked = members
    .map(m => {
      const points = m.certificates.reduce((s, c) => s + pointsForCourse(c.courseId), 0);
      const lastCert = m.certificates.reduce<Date | null>((acc, c) => (acc && c.issuedAt < acc ? acc : c.issuedAt), null);
      const completedIds = new Set(m.certificates.map(c => c.courseId));
      return { ...m, points, lastCert, completedIds };
    })
    .sort((a, b) => b.points - a.points || (b.lastCert?.getTime() ?? 0) - (a.lastCert?.getTime() ?? 0));

  const teamPoints = ranked.reduce((s, m) => s + m.points, 0);
  const cellStyle: React.CSSProperties = { padding: '12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  return (
    <>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, minWidth: 160 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team points</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: division.color ?? 'var(--accent)', fontFamily: 'monospace' }}>{teamPoints}</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, minWidth: 160 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Members</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace' }}>{ranked.length}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)' }}>
              {['Member','Points','Courses','Last activity'].map(h => (
                <th key={h} style={{ ...cellStyle, textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map(m => (
              <tr key={m.id}>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 600 }}>{m.name ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                </td>
                <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: division.color ?? 'var(--accent)' }}>{m.points}</td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {ALL_COURSES.map(c => {
                      const done = m.completedIds.has(c.id);
                      return (
                        <span key={c.id} title={c.title} style={{
                          fontSize: 10, fontFamily: 'monospace', padding: '3px 7px', borderRadius: 4,
                          background: done ? (division.color ?? 'var(--accent)') : 'var(--bg-hover)',
                          color: done ? '#000' : 'var(--text-dim)',
                          fontWeight: 700,
                        }}>{c.code}</span>
                      );
                    })}
                  </div>
                </td>
                <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {m.lastCert ? m.lastCert.toISOString().slice(0, 10) : '—'}
                </td>
              </tr>
            ))}
            {ranked.length === 0 && (
              <tr><td colSpan={4} style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                No members in {division.name} yet — Marshall, assign people in <code>/homelife/admin/members</code>.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
