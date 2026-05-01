import { ActivityEntry, DivisionStanding } from '@/lib/league';

function timeAgo(ms: number): string {
  const s = (Date.now() - ms) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Ticker({ feed, standings }: { feed: ActivityEntry[]; standings: DivisionStanding[] }) {
  const items: string[] = [];
  if (standings.length > 0 && standings[0].points > 0) {
    items.push(`👑 ${standings[0].name} leads with ${standings[0].points} pts`);
  }
  for (const e of feed.slice(0, 12)) {
    const bonus = e.bonusPoints > 0 ? ` +${e.bonusPoints} BONUS` : '';
    items.push(`${e.divisionEmoji ?? '🟢'} ${e.userDisplayName} +${e.basePoints + e.bonusPoints} · ${e.courseCode}${bonus} · ${timeAgo(e.issuedAtMs)}`);
  }
  for (const s of standings) {
    if (s.onFire) items.push(`🎯 ${s.name} ON FIRE — ${s.pointsToday} pts today`);
  }
  if (items.length === 0) {
    items.push('🏆 TRUOS LEAGUE · SEASON 1 · STARTED MAY 2026', '👑 STANDINGS RESET AUG 1', '🔥 FINISH A LESSON 5 DAYS IN A ROW FOR THE STREAK FLAME');
  }
  // Repeat the list so the marquee never appears empty
  const doubled = [...items, ...items];
  return (
    <div className="hl-ticker">
      <div className="hl-ticker-track">
        {doubled.map((it, i) => <span key={i}>{it}</span>)}
      </div>
    </div>
  );
}
