import Link from 'next/link';
import { GLOSSARY, type GlossaryCategory, type GlossaryEntry } from '@/content/glossary';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Glossary — Truos',
  description: 'Plain-language definitions for the AI and technical terms used across the Truos courses.',
};

const CATEGORY_ORDER: GlossaryCategory[] = ['concept', 'prompt', 'model', 'data', 'tool', 'ops'];

const CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  concept: 'Core concepts',
  prompt: 'Prompting',
  model: 'Models & memory',
  data: 'Data & formats',
  tool: 'Tools & integrations',
  ops: 'Operations',
};

export default function GlossaryPage() {
  const byCategory = new Map<GlossaryCategory, GlossaryEntry[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const entry of GLOSSARY) byCategory.get(entry.category)!.push(entry);
  for (const list of byCategory.values()) list.sort((a, b) => a.term.localeCompare(b.term));

  const alphabetical = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <>
      <Nav />
      <main className="container" style={{ padding: '64px 32px 80px', maxWidth: 960 }}>
        <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 14 }}>REFERENCE</div>
        <h1 style={{ fontSize: 56, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.05 }}>Glossary</h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 640, marginBottom: 40 }}>
          Plain-language definitions for the technical words you&rsquo;ll run into in the lessons.
          If it&rsquo;s underlined in a lesson, it&rsquo;s in here.
        </p>

        {/* A–Z quick-jump */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            padding: '16px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            marginBottom: 48,
          }}
        >
          {alphabetical.map(e => (
            <a
              key={e.id}
              href={`#${e.id}`}
              className="mono"
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                letterSpacing: '0.02em',
                background: 'var(--bg-elevated)',
              }}
            >
              {e.term}
            </a>
          ))}
        </div>

        {CATEGORY_ORDER.map(cat => {
          const entries = byCategory.get(cat)!;
          if (entries.length === 0) return null;
          return (
            <section key={cat} style={{ marginBottom: 64 }}>
              <div
                className="eyebrow"
                style={{ color: 'var(--text-muted)', marginBottom: 20, letterSpacing: '0.1em' }}
              >
                {CATEGORY_LABEL[cat]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {entries.map(entry => (
                  <article
                    key={entry.id}
                    id={entry.id}
                    style={{
                      padding: '24px 28px',
                      borderRadius: 12,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      scrollMarginTop: 96,
                    }}
                  >
                    <header
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 12,
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 24,
                          margin: 0,
                          letterSpacing: '-0.02em',
                          color: 'var(--text)',
                        }}
                      >
                        {entry.term}
                      </h2>
                      {entry.aliases && entry.aliases.length > 0 && (
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                          also: {entry.aliases.join(', ')}
                        </span>
                      )}
                    </header>
                    <p
                      style={{
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: 'var(--text)',
                        margin: '0 0 12px',
                      }}
                    >
                      {entry.long}
                    </p>
                    {entry.example && (
                      <p
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.55,
                          color: 'var(--text-muted)',
                          margin: 0,
                          borderLeft: '2px solid var(--accent)',
                          paddingLeft: 14,
                        }}
                      >
                        <span
                          className="eyebrow"
                          style={{ color: 'var(--accent)', marginRight: 8, fontSize: 10 }}
                        >
                          EXAMPLE
                        </span>
                        {entry.example}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <div
          style={{
            marginTop: 48,
            padding: '28px 32px',
            borderRadius: 12,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <div className="eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 10 }}>
            MISSING A TERM?
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Email <a href="mailto:hello@truos.ai" style={{ color: 'var(--accent)' }}>hello@truos.ai</a> and we&rsquo;ll add it.
          </p>
          <Link className="btn btn-ghost btn-sm" href="/#courses">← Back to courses</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
