import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'How Truos courses are built — Methodology',
  description:
    'Every Truos lesson is built on Merrill\'s First Principles of Instruction, Cognitive Load Theory, and Retrieval Practice. Here\'s what that means and why it matters.',
};

export default function MethodologyPage() {
  return (
    <>
      <Nav />
      <main className="container" style={{ padding: '64px 32px 96px', maxWidth: 880 }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 14 }}>
          METHODOLOGY
        </div>
        <h1 style={{ fontSize: 56, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.05 }}>
          How Truos courses are built
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 680, marginBottom: 56 }}>
          Every lesson you take on Truos rests on three well-studied ideas from learning science.
          None of them are new. All three are load-bearing.
        </p>

        <section style={{ marginBottom: 56 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
            ONE
          </div>
          <h2 style={{ fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Merrill&rsquo;s First Principles of Instruction
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>
            David Merrill&rsquo;s 2002 paper is a meta-synthesis — he read a generation of instructional
            design research and asked what all of it agreed on. The answer was five phases, in order,
            organized around a real problem:
          </p>
          <ol style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text)', paddingLeft: 20, marginBottom: 20 }}>
            <li><strong>Activation</strong> — surface what the learner already knows (or doesn&rsquo;t).</li>
            <li><strong>Demonstration</strong> — show the concept, don&rsquo;t just describe it.</li>
            <li><strong>Application</strong> — have the learner use the concept on a realistic task.</li>
            <li><strong>Integration</strong> — check that it sticks.</li>
            <li><strong>Problem-centered</strong> — all four steps orbit a concrete problem, not an abstract topic.</li>
          </ol>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>
            Every Truos lesson has five steps in this exact order — <strong>Think → Understand → Learn → Apply → Quiz</strong>. The step names are ours; the spine is Merrill&rsquo;s.
          </p>
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px 28px',
              fontSize: 14,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Merrill, M. D. (2002). First principles of instruction.
            <em> Educational Technology Research and Development</em>, 50(3), 43–59.
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
            TWO
          </div>
          <h2 style={{ fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Cognitive Load Theory
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>
            John Sweller&rsquo;s work, still a cornerstone of educational psychology, says the same
            thing every good editor knows: a reader has a fixed amount of working memory. Spend it
            on the lesson, not on parsing the lesson.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>
            This is what shapes our writing rules: short sentences, one analogy per lesson, no
            split-attention (no footnotes you have to chase). The voice guide is a load-management
            spec.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>
            The practical effect: Truos lessons are deliberately 2–3 minutes, not 20. Short enough
            to finish in the gaps between meetings, dense enough to teach something real.
          </p>
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px 28px',
              fontSize: 14,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Sweller, J. (1988). Cognitive load during problem solving.
            <em> Cognitive Science</em>, 12(2), 257–285.
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
            THREE
          </div>
          <h2 style={{ fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Retrieval Practice
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>
            Reading a thing is not remembering a thing. Recalling it is. Roediger &amp; Karpicke
            ran a now-famous 2006 study showing that learners who were <em>tested</em> on material
            retained 40–60% more of it weeks later than learners who simply re-read it.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>
            Every third Truos lesson opens with a <strong>Quick Recall</strong> — one question from
            two or three lessons ago. Every module ends with a <strong>Module Recap</strong> that
            interleaves questions across the lessons in that module. We do this because it works,
            not because it looks thorough.
          </p>
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px 28px',
              fontSize: 14,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Roediger, H. L., &amp; Karpicke, J. D. (2006). Test-enhanced learning.
            <em> Psychological Science</em>, 17(3), 249–255.
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            See it in action
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text)', marginBottom: 24 }}>
            The first lesson of AI·101 is free, no sign-in required. The five phases are labeled
            inside the player so you can see the scaffold as you go.
          </p>
          <Link
            href="/courses/101/0/0"
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 24px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Take lesson 1 free →
          </Link>
        </section>

        <section
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 40,
            color: 'var(--text-muted)',
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          <p>
            None of this is marketing fluff: if you look at the lesson schema in our codebase, the
            step types are named after Merrill&rsquo;s phases. The voice rules are written as a
            style guide every writer checks against. The recall cadence is hard-coded into the
            lesson player. We built the rails so the content couldn&rsquo;t drift.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
