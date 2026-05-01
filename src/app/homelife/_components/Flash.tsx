export function Flash({ type, children }: { type: 'success' | 'error' | 'info'; children: React.ReactNode }) {
  const colors = {
    success: { bg: 'rgba(196, 244, 57, 0.1)', border: '#84a824', fg: '#c4f439' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', fg: '#fca5a5' },
    info: { bg: 'rgba(56, 189, 248, 0.1)', border: '#38bdf8', fg: '#7dd3fc' },
  }[type];
  return (
    <div style={{
      padding: '12px 16px',
      marginBottom: 16,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderLeft: `3px solid ${colors.border}`,
      borderRadius: 6,
      color: colors.fg,
      fontSize: 14,
    }}>{children}</div>
  );
}
