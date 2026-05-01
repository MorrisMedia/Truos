import Link from 'next/link';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signIn } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { welcomeEmail, codeRedeemedEmail } from '@/lib/emails/templates';
import { Logo } from '@/components/Logo';
import { Icons } from '@/components/icons';

function safeCallback(raw: string | undefined | null): string {
  if (!raw) return '/dashboard';
  // Only accept internal absolute paths. Reject protocol-relative (//evil.com) and external URLs.
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

async function createAccount(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const name = String(formData.get('name') ?? '').trim() || null;
  const password = String(formData.get('password') ?? '');
  const accessCode = String(formData.get('accessCode') ?? '').trim().toUpperCase();
  const callbackUrl = safeCallback(String(formData.get('callbackUrl') ?? ''));

  if (!email || !password) throw new Error('Email and password are required');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('An account with that email already exists — try signing in');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  // Auto-join: if the email domain matches an Organization.domains entry, attach the user
  // to that org as a learner. Org-level autoGrantAll handles course access — no entitlements needed.
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain) {
    const org = await prisma.organization.findFirst({
      where: { domains: { has: domain } },
      select: { id: true },
    });
    if (org) {
      await prisma.user.update({
        where: { id: user.id },
        data: { orgId: org.id, orgRole: 'learner' },
      });
    }
  }

  // Optional comp code redemption
  let redeemedCourseIds: number[] | null = null;
  let redeemedCodeStr: string | null = null;
  if (accessCode) {
    const code = await prisma.compCode.findUnique({ where: { code: accessCode } });
    if (code && !code.disabledAt && (!code.expiresAt || code.expiresAt > new Date()) && (code.maxUses === null || code.uses < code.maxUses)) {
      const targetCourses = code.courseIds.length > 0 ? code.courseIds : [102, 103, 104, 201, 202];
      await prisma.$transaction([
        prisma.compCodeRedemption.create({ data: { codeId: code.id, userId: user.id } }),
        prisma.compCode.update({ where: { id: code.id }, data: { uses: { increment: 1 } } }),
        ...targetCourses.map(cid =>
          prisma.courseEntitlement.create({
            data: { userId: user.id, courseId: cid, source: 'comp_code', sourceId: code.id },
          })
        ),
      ]);
      redeemedCourseIds = targetCourses;
      redeemedCodeStr = code.code;
    }
  }

  // Transactional email — fire-and-forget so signup never blocks on mail.
  sendEmail({
    to: user.email,
    userId: user.id,
    kind: 'welcome',
    payload: welcomeEmail({ name: user.name, userId: user.id }),
  }).catch(err => console.error('[email] welcome failed', err));

  if (redeemedCodeStr && redeemedCourseIds) {
    sendEmail({
      to: user.email,
      userId: user.id,
      kind: 'code_redeemed',
      payload: codeRedeemedEmail({ name: user.name, userId: user.id, code: redeemedCodeStr, courseIds: redeemedCourseIds }),
    }).catch(err => console.error('[email] code_redeemed failed', err));
  }

  await signIn('credentials', { email, password, redirect: false });
  redirect(callbackUrl);
}

export default function SignUpPage({ searchParams }: { searchParams: { code?: string; callbackUrl?: string } }) {
  const callbackUrl = safeCallback(searchParams.callbackUrl);
  const returningToLesson = callbackUrl.startsWith('/courses/');
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        <h1 style={{ fontSize: 36, marginTop: 32, marginBottom: 8, letterSpacing: '-0.025em' }}>
          {returningToLesson ? 'Create an account to start' : 'Create your account'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>
          {returningToLesson
            ? 'Create an account, then unlock AI·101 for $199 — lifetime access.'
            : 'Create an account to get started. Unlock AI·101 for $199.'}
        </p>

        <form action={createAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Field label="YOUR NAME (OPTIONAL)">
            <input name="name" type="text" placeholder="Avery Chen" style={fieldStyle} />
          </Field>
          <Field label="EMAIL">
            <input name="email" type="email" required placeholder="you@company.com" style={fieldStyle} />
          </Field>
          <Field label="PASSWORD">
            <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" style={fieldStyle} />
          </Field>
          <Field label="ACCESS CODE (OPTIONAL)">
            <input name="accessCode" type="text" defaultValue={searchParams.code ?? ''} placeholder="e.g. BETA2026" style={fieldStyle} />
          </Field>
          <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 12 }}>
            Create account {Icons.arrow}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account? <Link href={`/sign-in${searchParams.callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} style={{ color: 'var(--accent)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="eyebrow">{label}</span>
      {children}
    </label>
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
