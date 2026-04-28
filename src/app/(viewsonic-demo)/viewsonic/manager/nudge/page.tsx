import { NudgeComposer } from '../../_components/NudgeComposer';

export default function ManagerNudge() {
  return (
    <div>
      <div style={{ maxWidth: 1100, margin: '0 auto', marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Re-engage</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Nudge stragglers</h1>
      </div>
      <NudgeComposer />
    </div>
  );
}
