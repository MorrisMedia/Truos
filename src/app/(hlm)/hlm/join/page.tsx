import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JoinClient } from './_components/JoinClient';

type Props = {
  searchParams: { token?: string };
};

export default async function JoinPage({ searchParams }: Props) {
  const token = searchParams.token;

  if (!token) {
    redirect('/hlm');
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/hlm/join?token=${token}`)}`);
  }

  const membership = await prisma.orgMembership.findUnique({
    where: { inviteToken: token },
    include: { org: true },
  });

  if (!membership) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 32,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Invalid or expired invite link
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
            This invitation link is not valid. It may have already been used or expired.
            Contact your administrator for a new invite.
          </p>
        </div>
      </div>
    );
  }

  // Already joined — just redirect
  if (membership.joinedAt) {
    redirect('/hlm');
  }

  const org = membership.org;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 32,
        background: 'var(--bg)',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {/* Truos badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 32,
            padding: '6px 14px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 10,
            }}
          >
            T
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Truos</span>
        </div>

        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
          You&apos;ve been invited to
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          {org.name}
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40 }}>
          AI Training Program on Truos
        </div>

        {/* What they get */}
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px 24px',
            marginBottom: 32,
            textAlign: 'left',
          }}
        >
          {[
            '4 AI courses, self-paced',
            'Verifiable certificates on LinkedIn',
            'Your team dashboard and progress tracker',
          ].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 0',
                fontSize: 14,
                color: 'var(--text)',
              }}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
              {item}
            </div>
          ))}
        </div>

        <JoinClient
          token={token}
          userName={session.user.name ?? session.user.email}
        />
      </div>
    </div>
  );
}
