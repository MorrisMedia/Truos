import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getOrgContext } from '@/lib/org';
import { Logo } from './Logo';
import { Icons } from './icons';

export async function Nav({ variant = 'home' }: { variant?: 'home' | 'course' | 'plus' | 'minimal' }) {
  const session = await auth();
  const ctx = session?.user?.id ? await getOrgContext(session.user.id) : null;
  const showHLMAdmin = ctx?.orgSlug === 'hlm' && ctx.isOwner;

  return (
    <nav className="nav">
      <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
      <div className="nav-links">
        {variant === 'home' && (
          <>
            <a className="nav-link" href="#courses">Courses</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <Link className="nav-link" href="/plus" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Truos<span style={{ color: 'var(--accent)', fontWeight: 600 }}>+</span>
            </Link>
          </>
        )}
        {variant === 'course' || variant === 'plus' ? (
          <>
            <Link className="nav-link" href="/dashboard">Dashboard</Link>
            <Link className="nav-link" href="/plus" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Truos<span style={{ color: 'var(--accent)', fontWeight: 600 }}>+</span>
            </Link>
          </>
        ) : null}
        {showHLMAdmin && <Link className="nav-link" href="/homelife/admin" style={{ color: 'var(--accent)' }}>HLM admin</Link>}
        {session?.user?.isStaff && <Link className="nav-link" href="/staff" style={{ color: 'var(--accent)' }}>Staff</Link>}
        {session?.user ? (
          <>
            <Link className="nav-link" href="/account">Account</Link>
            <Link className="btn btn-primary btn-sm" href="/dashboard">Dashboard {Icons.arrow}</Link>
          </>
        ) : (
          <>
            <Link className="nav-link" href="/sign-in">Sign in</Link>
            <Link className="btn btn-primary btn-sm" href="/sign-up">Start free {Icons.arrow}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
