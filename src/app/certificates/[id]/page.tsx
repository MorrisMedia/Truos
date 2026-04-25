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
  const issued = new Date(cert.issuedAt).toISOString().slice(0, 10).replace(/-/g, '·');
  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Link className="btn btn-ghost btn-sm" href={`/courses/${course.id}`}>{Icons.arrowLeft} Back</Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="btn btn-ghost btn-sm" href={`/verify/${cert.verificationHash}`}>{Icons.external} Verify</Link>
          </div>
        </div>

        <div style={{
          background: 'var(--paper)', color: '#0A0B0D', borderRadius: 4,
          padding: '80px 72px', aspectRatio: '1.414 / 1', position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(10,11,13,0.04))',
        }}>
          <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(10,11,13,0.15)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#0A0B0D', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>T</div>
              <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>Truos</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textAlign: 'right' }}>
              <div>CERT · {cert.verificationHash}</div>
              <div style={{ color: '#5B5F68', marginTop: 4 }}>ISSUED {issued}</div>
            </div>
          </div>

          <div className="eyebrow" style={{ color: '#5B5F68', marginBottom: 24 }}>CERTIFICATE OF COMPLETION</div>
          <div className="serif" style={{ fontSize: 16, fontStyle: 'italic', color: '#5B5F68', marginBottom: 12 }}>This certifies that</div>
          <div style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.035em', marginBottom: 24, lineHeight: 1 }}>{userName ?? 'Learner'}</div>
          <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', color: '#5B5F68', marginBottom: 12, maxWidth: 560 }}>
            has completed the requirements for
          </div>
          <div style={{ fontSize: 40, letterSpacing: '-0.02em', marginBottom: 6, fontWeight: 600 }}>{course.title}</div>
          <div style={{ fontSize: 12, color: '#5B5F68', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
            {course.code} · {course.lessons} lessons · {course.modules.length} modules
          </div>
          <div style={{ fontSize: 15, color: '#5B5F68', maxWidth: 560, lineHeight: 1.5 }}>
            {course.subtitle}
          </div>

          <div style={{ position: 'absolute', bottom: 72, left: 72, right: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <div>
              <div style={{ borderTop: '1px solid #0A0B0D', paddingTop: 8, width: 200 }}>
                <div className="serif" style={{ fontSize: 22, fontStyle: 'italic' }}>M. Okonkwo</div>
                <div style={{ fontSize: 11, color: '#5B5F68', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Dean, Truos</div>
              </div>
            </div>
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid #0A0B0D', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textAlign: 'center', lineHeight: 1.2 }}>
              TRUOS<br />VERIFIED<br />·<br />{course.id}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <span>Verify at</span>
          <Link className="mono" style={{ color: 'var(--text)' }} href={`/verify/${cert.verificationHash}`}>truos.ai/verify/{cert.verificationHash}</Link>
        </div>
      </div>
    </div>
  );
}
