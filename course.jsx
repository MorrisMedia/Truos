/* =============================================================
   COURSE HOME — module tree + progress
   ============================================================= */

function CourseHome({ courseId, onNav }) {
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const progress = { 101: 100, 102: 62, 103: 0, 104: 0 }[course.id] || 22;
  const [focused, setFocused] = React.useState(course.id === 102 ? 1 : 0);

  return (
    <div>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Logo />
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span className="nav-link" onClick={() => onNav('landing')} style={{ cursor: 'pointer' }}>Courses</span>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span className="mono" style={{ color: 'var(--accent)', fontSize: 13 }}>{course.code}</span>
        </div>
        <div className="nav-links">
          <div style={{ display: 'flex', gap: 20, color: 'var(--text-muted)', fontSize: 13, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{icons.flame} <span className="mono">14</span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{icons.sparkle} <span className="mono">2,840 XP</span></span>
          </div>
          <Avatar name="Avery Chen" size={32}/>
        </div>
      </nav>

      {/* Header */}
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
                <span className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{progress}%</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 16 }}><span style={{ width: `${progress}%` }}/></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{Math.round(course.lessons * progress / 100)} of {course.lessons} lessons</span>
                <span>~{Math.round(course.hours * (1 - progress/100) * 10)/10}h left</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => onNav('lesson', { courseId: course.id, moduleIdx: 0, lessonIdx: 0 })}>
                {progress === 0 ? 'Start course' : 'Continue'} {icons.arrow}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Module tree */}
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
              const isOpen = focused === i;
              const done = i < Math.floor(course.modules.length * progress / 100);
              const active = i === Math.floor(course.modules.length * progress / 100);
              return (
                <div key={i} style={{ borderTop: i === 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)' }}>
                  <div
                    onClick={() => setFocused(isOpen ? -1 : i)}
                    style={{ padding: '24px 0', display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }}
                  >
                    <div className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', width: 24 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: '1.5px solid ' + (done ? 'var(--accent)' : active ? 'var(--text-muted)' : 'var(--border-strong)'),
                      background: done ? 'var(--accent)' : 'transparent',
                      color: done ? 'var(--accent-ink)' : 'var(--text-muted)',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      {done ? <span style={{ fontSize: 13 }}>✓</span> : active ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, letterSpacing: '-0.015em' }}>{m.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        {m.lessons.length} lesson{m.lessons.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    {active && <span className="badge accent">IN PROGRESS</span>}
                    <span style={{ color: 'var(--text-dim)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>{icons.arrow}</span>
                  </div>
                  {isOpen && (
                    <div style={{ paddingBottom: 24, paddingLeft: 68 }}>
                      {m.lessons.map((l, j) => {
                        const lessonDone = done || (active && j < 1);
                        return (
                          <div key={j}
                            onClick={() => onNav('lesson', { courseId: course.id, moduleIdx: i, lessonIdx: j })}
                            style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12, color: lessonDone ? 'var(--text-muted)' : 'var(--text)', cursor: 'pointer', fontSize: 14 }}
                          >
                            <span style={{ color: 'var(--text-dim)', width: 20 }}>{lessonDone ? '✓' : '○'}</span>
                            <span style={{ flex: 1 }}>{l}</span>
                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>5 MIN</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { CourseHome });
