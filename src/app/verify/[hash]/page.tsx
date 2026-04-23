import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { findCourse } from '@/content/courses';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export default async function VerifyPage({ params }: { params: { hash: string } }) {
  const cert = await prisma.certificate.findUnique({
    where: { verificationHash: params.hash },
    include: { user: { select: { name: true, email: true } } },
  });

  const course = cert ? findCourse(cert.courseId) : null;
  const issued = cert ? new Date(cert.issuedAt).toISOString().slice(0, 10) : null;

  return (
    <>
      <Nav variant="minimal" />
      <div style={{ minHeight: '60vh', padding: '56px 24px', maxWidth: 720, margin: '0 auto' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>CERTIFICATE VERIFICATION</div>
        {cert && course ? (
          <div>
            <div style={{ padding: 32, borderRadius: 16, background: 'var(--bg-panel)', border: '1px solid var(--accent)', marginBottom: 24 }}>
              <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>VALID · ISSUED BY TRUOS</div>
              <h1 style={{ fontSize: 32, marginBottom: 8, letterSpacing: '-0.025em' }}>
                {cert.user.name ?? cert.user.email}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 16 }}>
                has completed <strong>{course.code} — {course.title}</strong>
              </p>
              <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Issued {issued}</span>
                <span>·</span>
                <span className="mono">{cert.verificationHash}</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55 }}>
              This certificate was issued by Truos on <strong>{issued}</strong> upon completion of all lessons and a final assessment of {course.title}.
              Truos certificates are issued digitally and can be verified at any time by visiting <span className="mono">truos.ai/verify/{cert.verificationHash}</span>.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ padding: 32, borderRadius: 16, background: 'var(--bg-panel)', border: '1px solid var(--danger)', marginBottom: 24 }}>
              <div className="eyebrow" style={{ color: 'var(--danger)', marginBottom: 12 }}>NOT FOUND</div>
              <h1 style={{ fontSize: 28, marginBottom: 8 }}>No certificate matches this code.</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                Double-check the verification code. Real Truos certificates look like <span className="mono">0xXXXX-XXXX</span>.
              </p>
            </div>
            <Link className="btn btn-ghost" href="/">{Icons.arrowLeft} Back to home</Link>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
