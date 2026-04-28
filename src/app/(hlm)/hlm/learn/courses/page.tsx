import Link from 'next/link';
import { requireHlmRole } from '../../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { BASE_COURSES } from '@/content/courses';

export const dynamic = 'force-dynamic';

export default async function LearnerCourses() {
  const { user } = await requireHlmRole();

  const [progress, certs, entitlements] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId: user.id } }),
    prisma.certificate.findMany({ where: { userId: user.id } }),
    prisma.courseEntitlement.findMany({ where: { userId: user.id } }),
  ]);

  const certSet = new Set(certs.map((c) => c.courseId));
  const entitledSet = new Set(entitlements.map((e) => e.courseId));

  const courses = BASE_COURSES.map((course) => {
    const hasCert = certSet.has(course.id);
    const isUnlocked = course.tier === 'free' || entitledSet.has(course.id);
    const lessonsDone = progress.filter((p) => p.courseId === course.id).length;
    const pct = course.lessons > 0 ? Math.min(100, Math.round((lessonsDone / course.lessons) * 100)) : 0;
    const started = lessonsDone > 0;
    return { course, hasCert, isUnlocked, lessonsDone, pct, started };
  });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
          Curriculum
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>Courses</h1>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {courses.map(({ course, hasCert, isUnlocked, lessonsDone, pct, started }) => (
          <div
            key={course.id}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px 28px',
              opacity: !isUnlocked && !hasCert ? 0.75 : 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {course.code}
                  </span>
                  {hasCert && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 7px',
                        borderRadius: 999,
                        background: 'var(--success)',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      CERTIFIED
                    </span>
                  )}
                  {!isUnlocked && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 7px',
                        borderRadius: 999,
                        background: 'var(--bg-hover)',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      LOCKED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{course.title}</div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {course.subtitle}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    marginTop: 8,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {course.lessons} lessons · ~{course.hours}h
                </div>

                {/* Progress bar */}
                {isUnlocked && started && !hasCert && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        height: 4,
                        background: 'var(--bg-hover)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'var(--accent)',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 4,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {lessonsDone}/{course.lessons} lessons · {pct}%
                    </div>
                  </div>
                )}
              </div>

              <div style={{ flexShrink: 0 }}>
                {hasCert ? (
                  <Link
                    href={`/certificates/${course.id}`}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--success)',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    View cert
                  </Link>
                ) : isUnlocked ? (
                  <Link
                    href={`/courses/${course.id}/0/0`}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--accent)',
                      color: 'var(--accent-ink)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    {started ? 'Continue' : 'Start'}
                  </Link>
                ) : (
                  <Link
                    href={`/checkout?plan=${course.code}`}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--bg-hover)',
                      color: 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                      display: 'inline-block',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Unlock
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
