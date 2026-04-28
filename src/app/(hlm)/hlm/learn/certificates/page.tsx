import Link from 'next/link';
import { requireHlmRole } from '../../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { findCourse } from '@/content/courses';
import { APP_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function LearnerCertificates() {
  const { user } = await requireHlmRole();

  const certs = await prisma.certificate.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: 'desc' },
  });

  if (certs.length === 0) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', paddingTop: 64 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎓</div>
        <h1 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 12 }}>
          No certificates yet
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
          Complete a course and pass the certification quiz to earn your first credential.
        </p>
        <Link
          href="/hlm/learn/courses"
          style={{
            display: 'inline-block',
            marginTop: 20,
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Browse courses →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
          Your credentials
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>
          Certificates
        </h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {certs.map((cert) => {
          const course = findCourse(cert.courseId);
          const verifyUrl = `${APP_URL}/verify/${cert.verificationHash}`;
          const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(`${course?.title ?? 'AI Course'} — Truos`)}&organizationName=Truos&issueYear=${new Date(cert.issuedAt).getFullYear()}&issueMonth=${new Date(cert.issuedAt).getMonth() + 1}&certUrl=${encodeURIComponent(verifyUrl)}`;

          return (
            <div
              key={cert.id}
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Cert header */}
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 18px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    letterSpacing: '0.12em',
                    marginBottom: 6,
                  }}
                >
                  CERTIFICATE OF COMPLETION
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                  }}
                >
                  {course?.code ?? `#${cert.courseId}`}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {course?.title ?? 'Certificate'}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginTop: 8,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {cert.verificationHash.slice(0, 14)}…
                </div>
              </div>

              {/* Issue date */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Issued{' '}
                {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '7px 12px',
                    background: '#0A66C2',
                    color: '#fff',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  LinkedIn ↗
                </a>
                <Link
                  href={verifyUrl}
                  target="_blank"
                  style={{
                    flex: 1,
                    padding: '7px 12px',
                    background: 'var(--bg-hover)',
                    color: 'var(--text)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                    textAlign: 'center',
                    border: '1px solid var(--border)',
                  }}
                >
                  Verify ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verify another cert */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>
          Need to verify someone else&apos;s certificate?
        </span>
        <Link
          href="/verify"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          Verify a cert →
        </Link>
      </div>
    </div>
  );
}
