import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Icons } from '@/components/icons';

function safeCallback(raw: string | undefined | null): string {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

async function doSignIn(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = safeCallback(String(formData.get('callbackUrl') ?? ''));
  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch {
    const q = new URLSearchParams({ error: '1' });
    if (callbackUrl !== '/dashboard') q.set('callbackUrl', callbackUrl);
    redirect(`/sign-in?${q.toString()}`);
  }
  redirect(callbackUrl);
}

export default function SignInPage({ searchParams }: { searchParams: { error?: string; callbackUrl?: string } }) {
  const callbackUrl = safeCallback(searchParams.callbackUrl);
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        <h1 style={{ fontSize: 36, marginTop: 32, marginBottom: 8, letterSpacing: '-0.025em' }}>Welcome back</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>
          Sign in to continue your courses.
        </p>

        {searchParams.error && (
          <div style={{ padding: 14, borderRadius: 8, border: '1px solid var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', marginBottom: 16, fontSize: 14 }}>
            That email and password combo didn&apos;t work. Try again or <Link href="/sign-up" style={{ color: 'var(--accent)' }}>create an account</Link>.
          </div>
        )}

        <form action={doSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="eyebrow">EMAIL</span>
            <input name="email" type="email" required placeholder="you@company.com" style={fieldStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="eyebrow">PASSWORD</span>
            <input name="password" type="password" required style={fieldStyle} />
          </label>
          <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 12 }}>
            Sign in {Icons.arrow}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          No account? <Link href={`/sign-up${searchParams.callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} style={{ color: 'var(--accent)' }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-panel)',
  color: 'var(--text)',
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
};
