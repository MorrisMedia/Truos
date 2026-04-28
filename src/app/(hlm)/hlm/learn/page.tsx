import Link from 'next/link';
import { requireHlmRole } from '../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { findCourse } from '@/content/courses';

export const dynamic = 'force-dynamic';

const BASE_COURSE_IDS = [101, 102, 103, 104];

export default async function LearnerHome() {
  const { user } = await requireHlmRole();

  const [progress, certs, entitlements] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.certificate.findMany({
      where: { userId: user.id },
      orderBy: { issuedAt: 'desc' },
    }),
    prisma.courseEntitlement.findMany({ where: { userId: user.id } }),
  ]);

  const certCourseIds = new Set(certs.map((c) => c.courseId));
  const entitledIds = new Set(entitlements.map((e) => e.courseId));

  // Find last in-progress course (has progress but no cert)
  const inProgressEntry = progress.find((p) => !certCourseIds.has(p.courseId));
  const inProgressCourseId = inProgressEntry?.courseId ?? null;
  const inProgressCourse = inProgressCourseId ? findCourse(inProgressCourseId) : null;

  // Lesson count for in-progress
  const inProgressLessonCount = inProgressCourseId
    ? progress.filter((p) => p.courseId === inProgressCourseId).length
    : 0;
  const totalLessons = inProgressCourse?.lessons ?? 20;
  const progressPct = inProgressCourseId
    ? Math.min(100, Math.round((inProgressLessonCount / totalLessons) * 100))
    : 0;

  // "Up next" — courses not started and not certified
  const startedIds = new Set(progress.map((p) => p.courseId));
  const upNext = BASE_COURSE_IDS.filter(
    (id) => !startedIds.has(id) && !certCourseIds.has(id),
  )
    .slice(0, 3)
    .map((id) => findCourse(id))
    .filter(Boolean);

  const firstName = user.name?.split(' ')[0] ?? 'there';

  // Month stats
  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const monthlyLessons = progress.filter((p) => new Date(p.completedAt) >= monthAgo).length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Welcome */}
      <div
        className="serif"
        style={{
          fontSize: 32,
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        ✦ Welcome back, {firstName}
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: 'Lessons completed', value: progress.length },
          { label: 'This month', value: monthlyLessons },
          { label: 'Certificates', value: certs.length },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Resume card */}
      {inProgressCourse ? (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px 32px',
            marginBottom: 32,
          }}
        >
          <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
            Pick up where you left off
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                letterSpacing: '0.08em',
              }}
            >
              {inProgressCourse.code}
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4 }}>
            {inProgressCourse.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {inProgressLessonCount} of {totalLessons} lessons completed
          </div>
          <div
            style={{
              marginTop: 16,
              height: 6,
              background: 'var(--bg-hover)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent)' }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 14,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {progressPct}%
            </span>
            <Link
              href={`/courses/${inProgressCourseId}/0/0`}
              style={{
                padding: '8px 16px',
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Resume →
            </Link>
          </div>
        </div>
      ) : progress.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px 32px',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
            Ready to start your AI training?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            AI·101 is free and unlocked — 20 lessons, about an hour.
          </div>
          <Link
            href="/courses/101/0/0"
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Start AI·101 →
          </Link>
        </div>
      ) : null}

      {/* Earned certs */}
      {certs.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 500 }}>Earned credentials</h2>
            <Link
              href="/hlm/learn/certificates"
              style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {certs.slice(0, 3).map((cert) => {
              const course = findCourse(cert.courseId);
              return (
                <Link
                  key={cert.id}
                  href={`/certificates/${cert.courseId}`}
                  style={{
                    display: 'block',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '16px 18px',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      letterSpacing: '0.1em',
                      marginBottom: 6,
                    }}
                  >
                    {course?.code ?? `#${cert.courseId}`}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}
                  >
                    {course?.title ?? 'Certificate'}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--success)',
                      marginTop: 8,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ✓{' '}
                    {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Up next */}
      {upNext.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 14 }}>Up next</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {upNext.map((course) => (
              <div
                key={course!.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      letterSpacing: '0.08em',
                      marginBottom: 4,
                    }}
                  >
                    {course!.code}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{course!.title}</div>
                </div>
                <Link
                  href={
                    entitledIds.has(course!.id) || course!.tier === 'free'
                      ? `/courses/${course!.id}/0/0`
                      : `/hlm/learn/courses`
                  }
                  style={{
                    padding: '6px 14px',
                    background:
                      entitledIds.has(course!.id) || course!.tier === 'free'
                        ? 'var(--accent)'
                        : 'var(--bg-hover)',
                    color:
                      entitledIds.has(course!.id) || course!.tier === 'free'
                        ? 'var(--accent-ink)'
                        : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {entitledIds.has(course!.id) || course!.tier === 'free'
                    ? 'Start'
                    : 'Unlock'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
