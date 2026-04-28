export default function PendingPage() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <h1 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Invitation pending
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
          Your invitation to the HomeLife Media training program is pending.
          Check your email for an invite link, or contact your administrator.
        </p>
      </div>
    </div>
  );
}
