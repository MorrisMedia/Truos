import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';
import { Logo } from '@/components/Logo';

export const dynamic = 'force-dynamic';

async function resubscribe(formData: FormData) {
  'use server';
  const userId = String(formData.get('userId'));
  const token = String(formData.get('token'));
  if (!verifyUnsubscribeToken(userId, token)) return;
  await prisma.user.update({ where: { id: userId }, data: { emailSubscribed: true } });
  revalidatePath(`/unsubscribe/${userId}-${token}`);
}

export default async function UnsubscribePage({ params }: { params: { token: string } }) {
  // token shape: {userId}-{hmac}
  const dash = params.token.indexOf('-');
  if (dash < 1) return invalid();
  const userId = params.token.slice(0, dash);
  const token = params.token.slice(dash + 1);

  if (!verifyUnsubscribeToken(userId, token)) return invalid();

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailSubscribed: true } });
  if (!user) return invalid();

  // Unsubscribe on first view (idempotent)
  if (user.emailSubscribed) {
    await prisma.user.update({ where: { id: userId }, data: { emailSubscribed: false } });
  }

  const wasSubscribed = user.emailSubscribed; // value before the update

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        </div>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.025em', marginBottom: 12 }}>
          {wasSubscribed ? 'Unsubscribed.' : "You're unsubscribed."}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 28 }}>
          <span className="mono" style={{ color: 'var(--text)' }}>{user.email}</span> won't receive Truos announcements anymore.
          You'll still get essential account emails (purchase receipts, certificates, access grants).
        </p>
        <form action={resubscribe} style={{ display: 'inline-block' }}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="token" value={token} />
          <button type="submit" className="btn btn-ghost">Change your mind? Resubscribe</button>
        </form>
      </div>
    </div>
  );
}

function invalid() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Invalid unsubscribe link</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          This link is expired or malformed. If you want to stop receiving announcements, email{' '}
          <a href="mailto:hello@truos.ai" style={{ color: 'var(--accent)' }}>hello@truos.ai</a>.
        </p>
      </div>
    </div>
  );
}
