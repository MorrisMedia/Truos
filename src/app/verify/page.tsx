import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

async function verifyAction(formData: FormData) {
  'use server';
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  if (!code) return;
  redirect(`/verify/${encodeURIComponent(code)}`);
}

export default function VerifyIndexPage() {
  return (
    <>
      <Nav variant="minimal" />
      <div style={{ minHeight: '60vh', padding: '72px 24px', maxWidth: 520, margin: '0 auto' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>VERIFY A CERTIFICATE</div>
        <h1 style={{ fontSize: 36, marginBottom: 16, letterSpacing: '-0.025em' }}>Enter a verification code.</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>
          Real Truos certificates look like <span className="mono">0x8A4F-11C2</span>.
        </p>
        <form action={verifyAction} style={{ display: 'flex', gap: 10 }}>
          <input name="code" required placeholder="0xXXXX-XXXX" style={{
            flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-strong)',
            background: 'var(--bg-panel)', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font-mono)',
          }} />
          <button type="submit" className="btn btn-primary">Verify {Icons.arrow}</button>
        </form>
        <Link className="btn btn-ghost" style={{ marginTop: 20 }} href="/">{Icons.arrowLeft} Back to home</Link>
      </div>
      <Footer />
    </>
  );
}
