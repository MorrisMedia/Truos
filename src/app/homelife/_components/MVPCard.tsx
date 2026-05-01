import { MVP } from '@/lib/league';

export function MVPCard({ mvp }: { mvp: MVP | null }) {
  if (!mvp) {
    return (
      <div className="hl-mvp hl-mvp-empty">
        <div className="hl-mvp-eyebrow">MVP OF THE WEEK</div>
        <div className="hl-mvp-empty-body">No certs yet this week — be the first.</div>
      </div>
    );
  }
  return (
    <div className="hl-mvp" style={{ borderColor: mvp.divisionColor ?? 'var(--accent)' }}>
      <div className="hl-mvp-eyebrow">⭐ MVP OF THE WEEK</div>
      <div className="hl-mvp-body">
        <div className="hl-mvp-name">{mvp.displayName}</div>
        <div className="hl-mvp-div">
          <span className="hl-emoji">{mvp.divisionEmoji ?? '•'}</span>
          <span style={{ color: mvp.divisionColor ?? undefined }}>{mvp.divisionName ?? 'Unassigned'}</span>
        </div>
        <div className="hl-mvp-pts" style={{ color: mvp.divisionColor ?? 'var(--accent)' }}>+{mvp.pointsThisWeek} <span className="hl-pts-label">PTS</span></div>
        <div className="hl-mvp-meta">{mvp.certsThisWeek} {mvp.certsThisWeek === 1 ? 'cert' : 'certs'} this week · top: <b>{mvp.topCourseCode}</b></div>
      </div>
    </div>
  );
}
