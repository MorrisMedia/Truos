import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findCourse } from '@/content/courses';
import { maybeIssueCertificate } from '@/lib/certificate';
import { Icons } from '@/components/icons';

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const course = findCourse(courseId);
  if (!course) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  let cert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!cert) cert = await maybeIssueCertificate(session.user.id, courseId);
  if (!cert) return <CertPending course={course} />;

  return <CertCard course={course} cert={cert} userName={session.user.name ?? session.user.email} />;
}

function CertPending({ course }: { course: ReturnType<typeof findCourse> }) {
  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <h1 style={{ fontSize: 36, marginBottom: 16, letterSpacing: '-0.025em' }}>Not quite there yet.</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, lineHeight: 1.5 }}>
          Your certificate for <strong>{course?.code} — {course?.title}</strong> will be issued once you&apos;ve finished every lesson, including the final quiz.
        </p>
        <Link className="btn btn-primary" style={{ marginTop: 24 }} href={`/courses/${course?.id}`}>
          Back to course {Icons.arrow}
        </Link>
      </div>
    </div>
  );
}

function CertCard({ course, cert, userName }: { course: ReturnType<typeof findCourse>; cert: { verificationHash: string; issuedAt: Date }; userName: string | null }) {
  if (!course) notFound();
  const issuedDate = new Date(cert.issuedAt);
  const issuedLong = issuedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const issuedIso = issuedDate.toISOString().slice(0, 10);

  const ink = '#0A0B0D';
  const inkSoft = '#5B5F68';
  const paper = '#F5F1EA';
  const accent = '#D4F547';

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Link className="btn btn-ghost btn-sm" href={`/courses/${course.id}`}>{Icons.arrowLeft} Back</Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="btn btn-ghost btn-sm" href={`/verify/${cert.verificationHash}`}>{Icons.external} Verify</Link>
          </div>
        </div>

        <div style={{
          background: paper,
          color: ink,
          borderRadius: 6,
          padding: '64px 72px 72px',
          aspectRatio: '1.414 / 1',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          backgroundImage: `
            radial-gradient(ellipse 90% 60% at 50% 50%, transparent 55%, rgba(10,11,13,0.05) 100%),
            repeating-linear-gradient(45deg, rgba(10,11,13,0.025) 0 1px, transparent 1px 14px),
            repeating-linear-gradient(-45deg, rgba(10,11,13,0.025) 0 1px, transparent 1px 14px)
          `,
        }}>
          {/* Engraved double border */}
          <div aria-hidden style={{ position: 'absolute', inset: 20, border: `1px solid ${ink}`, opacity: 0.85, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', inset: 26, border: `1px solid ${ink}`, opacity: 0.18, pointerEvents: 'none' }} />

          {/* Corner ornaments */}
          {[
            { top: 26, left: 26 }, { top: 26, right: 26 },
            { bottom: 26, left: 26 }, { bottom: 26, right: 26 },
          ].map((pos, i) => (
            <div key={i} aria-hidden style={{
              position: 'absolute', width: 18, height: 18,
              borderTop: pos.top !== undefined ? `1px solid ${ink}` : 'none',
              borderBottom: pos.bottom !== undefined ? `1px solid ${ink}` : 'none',
              borderLeft: pos.left !== undefined ? `1px solid ${ink}` : 'none',
              borderRight: pos.right !== undefined ? `1px solid ${ink}` : 'none',
              ...pos,
              opacity: 0.6,
            }} />
          ))}

          {/* Watermark */}
          <div aria-hidden style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
            color: ink,
            opacity: 0.035,
            fontFamily: 'var(--font-serif)',
            fontSize: 360,
            fontStyle: 'italic',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            userSelect: 'none',
          }}>T</div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 56, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: ink, color: accent,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14,
              }}>T</div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>Truos</span>
                <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: inkSoft, fontFamily: 'var(--font-mono)' }}>Institute</span>
              </div>
            </div>

            <div className="eyebrow" style={{ color: inkSoft, fontSize: 10, letterSpacing: '0.32em' }}>
              ✦ &nbsp; CERTIFICATE OF COMPLETION &nbsp; ✦
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textAlign: 'right', color: inkSoft }}>
              <div style={{ color: ink, fontWeight: 500 }}>{cert.verificationHash}</div>
              <div style={{ marginTop: 4 }}>ISSUED · {issuedIso}</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <div className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: inkSoft, marginBottom: 18 }}>
              This is to certify that
            </div>
            <div className="serif" style={{
              fontSize: 64, letterSpacing: '-0.025em', lineHeight: 1.05,
              fontStyle: 'italic', fontWeight: 400, marginBottom: 8,
            }}>
              {userName ?? 'Learner'}
            </div>
            <div aria-hidden style={{
              width: 120, height: 1, background: ink, opacity: 0.35, margin: '0 auto 28px',
            }} />
            <div className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: inkSoft, marginBottom: 14 }}>
              has successfully completed the curriculum and final assessment for
            </div>
            <div style={{ fontSize: 30, letterSpacing: '-0.02em', fontWeight: 600, marginBottom: 10 }}>
              {course.title}
            </div>
            <div style={{
              display: 'inline-flex', gap: 14, alignItems: 'center',
              fontSize: 10, color: inkSoft, letterSpacing: '0.18em',
              textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
              padding: '6px 14px',
              border: `1px solid rgba(10,11,13,0.18)`,
              borderRadius: 999,
              marginBottom: 16,
            }}>
              <span>{course.code}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{course.lessons} lessons</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{course.modules.length} modules</span>
            </div>
            <div style={{ fontSize: 13, color: inkSoft, maxWidth: 600, margin: '0 auto', lineHeight: 1.55, fontStyle: 'italic' }}>
              {course.subtitle}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute', bottom: 56, left: 72, right: 72,
            display: 'flex', justifyContent: 'space-between', alignItems: 'end',
          }}>
            {/* Issued date */}
            <div style={{ flex: '0 0 200px' }}>
              <div style={{ borderTop: `1px solid ${ink}`, paddingTop: 10 }}>
                <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', lineHeight: 1.1 }}>{issuedLong}</div>
                <div style={{ fontSize: 9, color: inkSoft, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4, fontFamily: 'var(--font-mono)' }}>Date of Issue</div>
              </div>
            </div>

            {/* Seal — center */}
            <div style={{ position: 'relative', width: 108, height: 108, display: 'grid', placeItems: 'center', flex: '0 0 108px' }}>
              <div aria-hidden style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${ink}`,
              }} />
              <div aria-hidden style={{
                position: 'absolute', inset: 6, borderRadius: '50%',
                border: `1px solid ${ink}`, opacity: 0.4,
              }} />
              <div aria-hidden style={{
                position: 'absolute', inset: -2, borderRadius: '50%',
                background: `conic-gradient(from 0deg, ${ink} 0 1deg, transparent 1deg 12deg)`,
                WebkitMaskImage: 'radial-gradient(circle, transparent 48%, black 48%, black 50%, transparent 50%)',
                maskImage: 'radial-gradient(circle, transparent 48%, black 48%, black 50%, transparent 50%)',
                opacity: 0.55,
              }} />
              <div style={{
                textAlign: 'center', fontFamily: 'var(--font-mono)',
                fontSize: 8, letterSpacing: '0.18em', lineHeight: 1.4, color: ink,
              }}>
                <div style={{ fontSize: 9, fontWeight: 600 }}>TRUOS</div>
                <div style={{ fontSize: 16, margin: '2px 0', letterSpacing: 0 }}>✦</div>
                <div>VERIFIED</div>
                <div style={{ marginTop: 2, color: inkSoft }}>№ {course.id}</div>
              </div>
            </div>

            {/* Authority */}
            <div style={{ flex: '0 0 220px', textAlign: 'right' }}>
              <div style={{ borderTop: `1px solid ${ink}`, paddingTop: 10 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: ink, lineHeight: 1.3,
                }}>Truos Certification Team</div>
                <div style={{
                  fontSize: 9, color: inkSoft, letterSpacing: '0.18em',
                  textTransform: 'uppercase', marginTop: 4, fontFamily: 'var(--font-mono)',
                }}>Issuing Authority</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap' }}>
          <span>Verify the authenticity of this certificate at</span>
          <Link className="mono" style={{ color: 'var(--text)' }} href={`/verify/${cert.verificationHash}`}>truos.ai/verify/{cert.verificationHash}</Link>
        </div>
      </div>
    </div>
  );
}
