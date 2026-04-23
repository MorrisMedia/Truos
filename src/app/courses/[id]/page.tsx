import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findCourse } from '@/content/courses';
import { LESSONS } from '@/content/lessons';
import { canAccessCourse } from '@/lib/access';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export default async function CoursePage({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const course = findCourse(courseId);
  if (!course) notFound();

  const session = await auth();
  const access = await canAccessCourse(session?.user?.id ?? null, session?.user?.email ?? null, courseId);
  if (!access.allowed) {
    redirect(`/checkout?plan=${encodeURIComponent(course.code)}`);
  }

  const userId = session?.user?.id;
  const progress = userId
    ? await prisma.lessonProgress.findMany({
        where: { userId, courseId },
        select: { moduleIdx: true, lessonIdx: true },
      })
    : [];
  const doneSet = new Set(progress.map(p => `${p.moduleIdx}-${p.lessonIdx}`));

  const totalLessons = Object.keys(LESSONS).filter(k => k.startsWith(`${courseId}-`)).length;
  const pct = totalLessons ? Math.round((progress.length / totalLessons) * 100) : 0;

  // Find first incomplete lesson for "Continue" button
  let nextModule = 0, nextLesson = 0;
  outer: for (let m = 0; m < course.modules.length; m++) {
    for (let l = 0; l < course.modules[m].lessons.length; l++) {
      if (!doneSet.has(`${m}-${l}`)) { nextModule = m; nextLesson = l; break outer; }
    }
  }

  return (
    <>
      <Nav variant={course.suite === 'plus' ? 'plus' : 'course'} />
      <section style={{ padding: '56px 0 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48, alignItems: 'end' }}>
            <div>
              <div className="code" style={{ color: 'var(--accent)', marginBottom: 16, fontSize: 13, letterSpacing: '0.08em' }}>{course.code}</div>
              <h1 style={{ fontSize: 52, marginBottom: 16 }}>{course.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 560, lineHeight: 1.5 }}>{course.subtitle}</p>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="eyebrow">YOUR PROGRESS</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{pct}%</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 16 }}><span style={{ width: `${pct}%` }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{progress.length} of {totalLessons} lessons</span>
                <span>~{Math.max(0, Math.round(course.hours * (1 - pct / 100) * 10) / 10)}h left</span>
              </div>
              <Link className="btn btn-primary" style={{ width: '100%', marginTop: 20, display: 'block', textAlign: 'center' }}
                href={`/courses/${courseId}/${nextModule}/${nextLesson}`}>
                {pct === 0 ? 'Start course' : 'Continue'} {Icons.arrow}
              </Link>
              {pct === 100 && (
                <Link className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8, display: 'block', textAlign: 'center' }}
                  href={`/certificates/${courseId}`}>
                  See certificate
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>MODULES</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              {course.modules.length} modules. Earn the certificate after completing the final review.
            </p>
          </div>
          <div>
            {course.modules.map((m, i) => {
              const moduleLessonKeys = m.lessons.map((_, j) => `${i}-${j}`);
              const moduleDoneCount = moduleLessonKeys.filter(k => doneSet.has(k)).length;
              const moduleComplete = moduleDoneCount === m.lessons.length;
              const moduleInProgress = !moduleComplete && moduleDoneCount > 0;
              return (
                <div key={i} style={{ borderTop: i === 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', width: 24 }}>{String(i + 1).padStart(2, '0')}</div>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: '1.5px solid ' + (moduleComplete ? 'var(--accent)' : moduleInProgress ? 'var(--text-muted)' : 'var(--border-strong)'),
                      background: moduleComplete ? 'var(--accent)' : 'transparent',
                      color: moduleComplete ? 'var(--accent-ink)' : 'var(--text-muted)',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      {moduleComplete ? <span style={{ fontSize: 13 }}>✓</span> : moduleInProgress ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} /> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, letterSpacing: '-0.015em' }}>{m.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        {moduleDoneCount} / {m.lessons.length} lesson{m.lessons.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    {moduleInProgress && <span className="badge accent">IN PROGRESS</span>}
                  </div>
                  <div style={{ paddingLeft: 68 }}>
                    {m.lessons.map((title, j) => {
                      const done = doneSet.has(`${i}-${j}`);
                      return (
                        <Link key={j} href={`/courses/${courseId}/${i}/${j}`} style={{
                          padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12,
                          color: done ? 'var(--text-muted)' : 'var(--text)',
                          fontSize: 14, textDecoration: 'none',
                        }}>
                          <span style={{ color: 'var(--text-dim)', width: 20 }}>{done ? '✓' : '○'}</span>
                          <span style={{ flex: 1 }}>{title}</span>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>5 MIN</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
