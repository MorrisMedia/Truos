import { DivisionStanding } from '@/lib/league';
import { Sparkline } from './Sparkline';

export function Standings({ rows }: { rows: DivisionStanding[] }) {
  if (rows.length === 0) {
    return <div className="hl-empty">No divisions yet — Marshall, head to <code>/homelife/admin/divisions</code>.</div>;
  }
  return (
    <div className="hl-standings">
      {rows.map((r, idx) => (
        <div key={r.divisionId} className="hl-row" style={{ borderLeftColor: r.color ?? 'var(--accent)' }}>
          <div className="hl-rank">{idx === 0 ? <span className="hl-crown">👑</span> : <span className="hl-mono">#{idx + 1}</span>}</div>
          <div className="hl-div">
            <div className="hl-div-line">
              <span className="hl-emoji">{r.emoji ?? '•'}</span>
              <span className="hl-div-name">{r.name}</span>
              {r.onFire && <span className="hl-fire-badge">ON FIRE</span>}
            </div>
            {r.trashTalk && r.trashTalkAt && (Date.now() - r.trashTalkAt.getTime()) < 7 * 24 * 36e5 && (
              <div className="hl-trashtalk" style={{ color: r.color ?? undefined }}>{r.trashTalk}</div>
            )}
          </div>
          <div className="hl-meta">
            <div className="hl-mono hl-dim">{r.members} {r.members === 1 ? 'member' : 'members'}</div>
            {r.pointsToday > 0 && <div className="hl-mono hl-up">▲ {r.pointsToday} today</div>}
          </div>
          <div className="hl-spark"><Sparkline data={r.spark} color={r.color ?? '#c4f439'} /></div>
          <div className="hl-points">
            <span className="hl-pts-num">{r.points}</span>
            <span className="hl-pts-label">PTS</span>
          </div>
        </div>
      ))}
    </div>
  );
}
