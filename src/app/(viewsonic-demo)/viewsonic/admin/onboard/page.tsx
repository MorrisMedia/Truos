import { OnboardWizard } from '../../_components/OnboardWizard';

export default function AdminOnboard() {
  return (
    <div>
      <div style={{ maxWidth: 1280, margin: '0 auto', marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>Bulk add & invite</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Onboard</h1>
      </div>
      <OnboardWizard />
    </div>
  );
}
