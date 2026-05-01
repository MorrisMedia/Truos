import Link from 'next/link';
import { ActivityEntry } from '@/lib/league';

function timeAgo(ms: number): string {
  const s = (Date.now() - ms) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function ActivityFeed({ feed }: { feed: ActivityEntry[] }) {
  if (feed.length === 0) {
    return <div className="hl-empty">No completions yet — first cert wins MVP automatically.</div>;
  }
  return (
    <ul className="hl-feed">
      {feed.map(e => (
        <li key={e.id} className="hl-feed-row" style={{ borderLeftColor: e.divisionColor ?? 'var(--accent)' }}>
          <span className="hl-feed-dot">{e.divisionEmoji ?? '🟢'}</span>
          <span className="hl-feed-name">{e.userDisplayName}</span>
          {e.divisionName && (
            <span className="hl-feed-div" style={{ color: e.divisionColor ?? undefined }}>({e.divisionName})</span>
          )}
          <span className="hl-feed-action">finished</span>
          <Link href={`/certificates/${e.courseId}`} className="hl-feed-course">
            <b>{e.courseCode}</b> {e.courseTitle}
          </Link>
          <span className="hl-feed-pts">+{e.basePoints} PTS</span>
          {e.speedRun && <span className="hl-feed-bonus">⚡ +{e.bonusPoints} SPEED RUN</span>}
          <span className="hl-feed-time">{timeAgo(e.issuedAtMs)}</span>
        </li>
      ))}
    </ul>
  );
}
