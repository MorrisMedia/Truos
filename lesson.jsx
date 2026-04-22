/* =============================================================
   ACTIVE LESSON — read, engage, quiz
   ============================================================= */

function Lesson({ onNav, courseId = 101, moduleIdx = 0, lessonIdx = 0 }) {
  const lesson = getLesson(courseId, moduleIdx, lessonIdx) || SAMPLE_LESSON;
  const [stepIdx, setStepIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [hearts, setHearts] = React.useState(5);

  // Reset when lesson changes
  React.useEffect(() => {
    setStepIdx(0);
    setSelected(null);
    setSubmitted(false);
  }, [courseId, moduleIdx, lessonIdx]);

  const step = lesson.steps[stepIdx];
  const progress = ((stepIdx + (submitted ? 1 : 0.3)) / lesson.steps.length) * 100;

  const advance = () => {
    setSelected(null);
    setSubmitted(false);
    if (stepIdx < lesson.steps.length - 1) setStepIdx(stepIdx + 1);
    else onNav('lesson-complete', { courseId, moduleIdx, lessonIdx, lessonTitle: lesson.title });
  };

  const submit = () => {
    if (selected == null) return;
    setSubmitted(true);
    if (step.options && !step.options[selected].correct) setHearts(h => Math.max(0, h - 1));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Lesson chrome */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNav('course', { courseId: lesson.courseId || courseId })} aria-label="Exit">
          {icons.x}
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
            <span style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}/>
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            {stepIdx + 1} / {lesson.steps.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--danger)' }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ opacity: i < hearts ? 1 : 0.2 }}>♥</span>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ padding: '24px 24px 0', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {lesson.courseCode} &nbsp;/&nbsp; {lesson.moduleName.toUpperCase()} &nbsp;/&nbsp; LESSON {String(lesson.lessonIndex).padStart(2,'0')}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, padding: '40px 24px 120px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        {step.type === 'read' && <ReadStep step={step}/>}
        {step.type === 'engage' && <EngageStep step={step} selected={selected} setSelected={setSelected} submitted={submitted}/>}
        {step.type === 'quiz' && <QuizStep step={step} selected={selected} setSelected={setSelected} submitted={submitted}/>}
      </div>

      {/* Footer nav */}
      <div style={{
        position: 'sticky', bottom: 0,
        borderTop: '1px solid var(--border)',
        background: 'color-mix(in oklab, var(--bg) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            {step.type === 'read' ? '3 MIN READ' : step.type === 'engage' ? 'INTERACTIVE' : 'QUICK CHECK'}
          </div>
          {step.type === 'read' ? (
            <button className="btn btn-primary btn-lg" onClick={advance}>Continue {icons.arrow}</button>
          ) : !submitted ? (
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={selected == null}
              style={{ opacity: selected == null ? 0.4 : 1, pointerEvents: selected == null ? 'none' : 'auto' }}>
              Check answer
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={advance}>
              {stepIdx < lesson.steps.length - 1 ? 'Next step' : 'Finish lesson'} {icons.arrow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadStep({ step }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>READ</div>
      <h1 style={{ fontSize: 40, marginBottom: 32, letterSpacing: '-0.03em' }}>{step.title}</h1>
      {step.body.map((p, i) => (
        <p key={i} style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 20 }}>{p}</p>
      ))}
      {step.callout && (
        <div style={{ marginTop: 32, padding: 24, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid var(--accent)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{step.callout.label}</div>
          <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.4 }}>{step.callout.text}</div>
        </div>
      )}
    </div>
  );
}

function EngageStep({ step, selected, setSelected, submitted }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>ENGAGE</div>
      <h1 style={{ fontSize: 36, marginBottom: 16, letterSpacing: '-0.03em' }}>{step.title}</h1>
      <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.5 }}>{step.prompt}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = submitted && opt.correct;
          const showWrong = submitted && isSelected && !opt.correct;
          return (
            <button key={i}
              onClick={() => !submitted && setSelected(i)}
              style={{
                textAlign: 'left', padding: 20, borderRadius: 12,
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
                background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'transparent',
                fontSize: 15, lineHeight: 1.5,
                transition: 'all 0.15s',
                cursor: submitted ? 'default' : 'pointer',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border-strong)'),
                background: showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'transparent',
                display: 'grid', placeItems: 'center',
                fontSize: 12, color: 'var(--accent-ink)',
                flexShrink: 0, marginTop: 1,
              }}>
                {showCorrect ? '✓' : showWrong ? '✕' : isSelected ? '●' : ''}
              </span>
              <span style={{ flex: 1 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && selected != null && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: step.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
            {step.options[selected].correct ? 'CORRECT' : 'NOT QUITE'}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>{step.options[selected].feedback}</div>
        </div>
      )}
    </div>
  );
}

function QuizStep({ step, selected, setSelected, submitted }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>QUICK CHECK</div>
      <h1 style={{ fontSize: 32, marginBottom: 32, letterSpacing: '-0.025em', lineHeight: 1.2 }}>{step.prompt}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = submitted && opt.correct;
          const showWrong = submitted && isSelected && !opt.correct;
          return (
            <button key={i}
              onClick={() => !submitted && setSelected(i)}
              style={{
                textAlign: 'left', padding: 20, borderRadius: 12, minHeight: 100,
                border: '1.5px solid ' + (showCorrect ? 'var(--accent)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--text)' : 'var(--border)'),
                background: showCorrect ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : showWrong ? 'color-mix(in oklab, var(--danger) 10%, transparent)' : isSelected ? 'var(--bg-panel)' : 'var(--bg-elevated)',
                fontSize: 15, lineHeight: 1.5,
                transition: 'all 0.15s',
                cursor: submitted ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--bg-panel)', borderLeft: '2px solid ' + (step.options[selected].correct ? 'var(--accent)' : 'var(--warn)') }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: step.options[selected].correct ? 'var(--accent)' : 'var(--warn)' }}>
            {step.options[selected].correct ? 'CORRECT' : 'LEARN'}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>{step.answerNote}</div>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   LESSON COMPLETE — celebration / certificate screens
   ============================================================= */

function LessonComplete({ onNav, courseId = 101, lessonTitle = 'What is AI?' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 24 }}>LESSON COMPLETE</div>
        <h1 style={{ fontSize: 48, marginBottom: 20 }}>
          Nicely done, <span className="serif" style={{ fontStyle: 'italic' }}>Avery</span>.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, marginBottom: 40, lineHeight: 1.5 }}>
          You finished "{lessonTitle}" in 4:12. 2 of 3 checks on the first try.
        </p>
        <div className="panel" style={{ padding: 24, marginBottom: 32, textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>XP</div>
            <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>+40</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>STREAK</div>
            <div style={{ fontSize: 28, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              14 <span style={{ color: 'var(--warn)', fontSize: 20 }}>🔥</span>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>ACCURACY</div>
            <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>67%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => onNav('course', { courseId })}>Back to course</button>
          <button className="btn btn-primary" onClick={() => onNav('certificate', { courseId })}>See certificate {icons.arrow}</button>
        </div>
      </div>
    </div>
  );
}

function Certificate({ onNav, courseId = 101 }) {
  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('course', { courseId })}>{icons.arrowLeft} Back</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm">{icons.download} Download PDF</button>
            <button className="btn btn-ghost btn-sm">{icons.external} Verify</button>
            <button className="btn btn-primary btn-sm">Share on LinkedIn {icons.arrow}</button>
          </div>
        </div>

        {/* Cert */}
        <div style={{
          background: 'var(--paper)',
          color: '#0A0B0D',
          borderRadius: 4,
          padding: '80px 72px',
          aspectRatio: '1.414 / 1',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(10,11,13,0.04))',
        }}>
          <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(10,11,13,0.15)', pointerEvents: 'none' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#0A0B0D', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>T</div>
              <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>Truos</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textAlign: 'right' }}>
              <div>CERT · 0x8A4F-{course.id}C2</div>
              <div style={{ color: '#5B5F68', marginTop: 4 }}>ISSUED 2026·04·22</div>
            </div>
          </div>

          <div className="eyebrow" style={{ color: '#5B5F68', marginBottom: 24 }}>CERTIFICATE OF COMPLETION</div>
          <div className="serif" style={{ fontSize: 16, fontStyle: 'italic', color: '#5B5F68', marginBottom: 12 }}>This certifies that</div>
          <div style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.035em', marginBottom: 24, lineHeight: 1 }}>Avery Chen</div>
          <div className="serif" style={{ fontSize: 20, fontStyle: 'italic', color: '#5B5F68', marginBottom: 12, maxWidth: 560 }}>
            has completed the requirements for
          </div>
          <div style={{ fontSize: 32, letterSpacing: '-0.02em', marginBottom: 8 }}>{course.code} — {course.title}</div>
          <div style={{ fontSize: 15, color: '#5B5F68', maxWidth: 560, lineHeight: 1.5 }}>
            {course.subtitle} {course.lessons} lessons, {course.modules.length} modules, final assessment passed at 92%.
          </div>

          <div style={{ position: 'absolute', bottom: 72, left: 72, right: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <div>
              <div style={{ borderTop: '1px solid #0A0B0D', paddingTop: 8, width: 200 }}>
                <div className="serif" style={{ fontSize: 22, fontStyle: 'italic' }}>M. Okonkwo</div>
                <div style={{ fontSize: 11, color: '#5B5F68', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Dean, Truos</div>
              </div>
            </div>
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid #0A0B0D', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textAlign: 'center', lineHeight: 1.2 }}>
              TRUOS<br/>VERIFIED<br/>·<br/>{course.id}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <span>Verify at</span>
          <span className="mono" style={{ color: 'var(--text)' }}>truos.ai/verify/0x8A4F-{course.id}C2</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Lesson, LessonComplete, Certificate });
