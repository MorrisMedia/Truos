export default function NotMemberPage() {
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
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Not a member
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
          Your account is not part of the HomeLife Media AI training program.
          Contact your administrator for an invitation.
        </p>
      </div>
    </div>
  );
}
