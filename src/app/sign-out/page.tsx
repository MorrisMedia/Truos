import { signOut } from '@/lib/auth';
import { SignOutAutoSubmit } from './auto-submit';

async function doSignOut() {
  'use server';
  await signOut({ redirectTo: '/' });
}

export default function SignOutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form action={doSignOut} id="signout-form" style={{ textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>SIGNING OUT…</div>
        <button type="submit" className="btn btn-ghost">Click here if you aren&apos;t redirected</button>
        <SignOutAutoSubmit />
      </form>
    </div>
  );
}
