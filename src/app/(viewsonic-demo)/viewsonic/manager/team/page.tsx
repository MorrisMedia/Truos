import { PeopleMatrix } from '../../_components/PeopleMatrix';

export default function ManagerTeam() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Sales — Americas</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>My 263 reps</h1>
      </div>
      <PeopleMatrix scope="sales-amer" />
    </div>
  );
}
