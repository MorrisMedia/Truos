import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Logo } from '@/components/Logo';
import { getPartnerBySlug, computePartnerPrice, formatCents } from '@/lib/affiliate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const partner = await getPartnerBySlug(params.slug);
  if (!partner) return { title: 'Truos' };
  return {
    title: `${partner.name} × Truos — AI fluency, ${partner.couponPercentOff ? `${partner.couponPercentOff}% off` : 'special pricing'}`,
    robots: { index: false, follow: true },
  };
}

export default async function PartnerLandingPage({ params, searchParams }: { params: { slug: string }; searchParams: { canceled?: string; err?: string } }) {
  const partner = await getPartnerBySlug(params.slug);
  if (!partner || !partner.active) notFound();

  const price = computePartnerPrice(partner);
  const checkoutHref = `/api/p/${partner.slug}/checkout`;
  const canceled = searchParams.canceled === '1';

  return (
    <>
      {/* Minimal partner-branded nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', borderBottom: '1px solid var(--border)',
        background: 'color-mix(in oklab, var(--bg) 80%, transparent)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="eyebrow" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--accent)' }}>×</span>
            <span>{partner.name.toUpperCase()}</span>
          </span>
          <Link className="btn btn-primary btn-sm" href={checkoutHref}>Get the bundle {Icons.arrow}</Link>
        </div>
      </nav>

      {canceled && (
        <div style={{ padding: '14px 24px', background: 'color-mix(in oklab, var(--warn) 12%, var(--bg-panel))', borderBottom: '1px solid var(--warn)', textAlign: 'center', fontSize: 14 }}>
          Checkout canceled — no charge. <Link href={checkoutHref} style={{ color: 'var(--accent)' }}>Try again →</Link>
        </div>
      )}

      <Hero partner={partner} price={price} checkoutHref={checkoutHref} />
      <TrustStrip />
      <WhatYouGet checkoutHref={checkoutHref} />
      <Outcomes />
      <Credibility />
      <PriceBlock partner={partner} price={price} checkoutHref={checkoutHref} />
      <Faq />
      <FinalCTA partner={partner} price={price} checkoutHref={checkoutHref} />
      <PartnerFooter partner={partner} />
    </>
  );
}

function Hero({ partner, price, checkoutHref }: any) {
  const headline = partner.heroHeadline ?? `${partner.name}'s readers get the full Truos credential stack at a special price.`;
  return (
    <section className="home-hero" style={{ padding: '72px 0 48px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        opacity: 0.55,
      }} />
      <div className="container" style={{ position: 'relative' }}>
        <div className="home-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 22 }}>
              <span style={{ color: 'var(--accent)' }}>●</span>
              <span>SPECIAL OFFER · {partner.name.toUpperCase()} × TRUOS</span>
            </div>
            <h1 className="home-h1" style={{ marginBottom: 22 }}>
              {headline}
            </h1>
            {partner.bio && (
              <p className="home-lead" style={{ fontSize: 19, color: 'var(--text-muted)', maxWidth: 560, marginBottom: 28, lineHeight: 1.5 }}>
                {partner.bio}
              </p>
            )}
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 14, padding: '14px 18px',
              background: 'var(--bg-panel)', borderRadius: 10, border: '1px solid var(--border-strong)',
              marginBottom: 22,
            }}>
              <span style={{ fontSize: 15, color: 'var(--text-dim)', textDecoration: 'line-through' }}>{formatCents(price.regularCents)}</span>
              <span style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', color: 'var(--text)' }}>{formatCents(price.finalCents)}</span>
              {price.discountLabel && (
                <span className="badge accent" style={{ fontSize: 11 }}>{price.discountLabel.toUpperCase()}</span>
              )}
            </div>
            <div style={{ marginBottom: 22, fontSize: 13, color: 'var(--text-muted)' }}>
              Code <span className="mono" style={{ color: 'var(--text)', background: 'var(--bg-panel)', padding: '3px 8px', borderRadius: 6, fontWeight: 600, letterSpacing: '0.05em' }}>{partner.couponCode}</span> auto-applied at checkout.
            </div>
            <div className="home-hero-ctas" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <Link className="btn btn-primary btn-lg" href={checkoutHref}>Get the bundle — {formatCents(price.finalCents)} {Icons.arrow}</Link>
              <a className="btn btn-ghost btn-lg" href="#what">See what's inside</a>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              30-day money-back guarantee · Lifetime access · No coding required
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {partner.heroImageUrl ? (
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '4 / 5', background: 'var(--bg-panel)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.heroImageUrl} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ) : (
              <div style={{
                aspectRatio: '4 / 5', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)', background: 'linear-gradient(160deg, #16181C, #1a1d14)',
                display: 'grid', placeItems: 'center',
              }}>
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 64, color: 'var(--accent)', fontWeight: 600, letterSpacing: '-0.03em' }}>
                    {partner.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                  </div>
                  <div className="eyebrow" style={{ marginTop: 12 }}>{partner.name.toUpperCase()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section style={{ padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
      <div className="container" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--accent)' }}>{Icons.check}</span> 4 credentials</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--accent)' }}>{Icons.check}</span> 116 lessons · ~7 hours</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--accent)' }}>{Icons.check}</span> Lifetime access</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: 'var(--accent)' }}>{Icons.check}</span> 30-day guarantee</span>
      </div>
    </section>
  );
}

function WhatYouGet({ checkoutHref }: { checkoutHref: string }) {
  const courses = [
    { code: 'AI·101', name: 'AI Foundations',         lessons: 20, hours: 1,   desc: 'Plain-English fundamentals. From "what even is an LLM" to confident first prompts.' },
    { code: 'AI·102', name: 'AI Prompt Mastery',      lessons: 24, hours: 1.5, desc: 'The exact prompting patterns that produce useful work — not toy demos.' },
    { code: 'AI·103', name: 'Applied AI at Work',     lessons: 32, hours: 2,   desc: 'Memos, decks, briefs, summaries. Use AI for the work your job actually requires.' },
    { code: 'AI·104', name: 'AI Workflow Mastery',    lessons: 40, hours: 2.5, desc: 'Capstone. Design, ship, and defend a real AI workflow inside your team.', featured: true },
  ];
  return (
    <section id="what" className="home-section" style={{ padding: '88px 0' }}>
      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>WHAT YOU GET</div>
          <h2 className="home-h2" style={{ maxWidth: 720 }}>Four credentials. <span className="serif" style={{ fontStyle: 'italic' }}>Designed to be finished.</span></h2>
        </div>
        <div className="home-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {courses.map((c) => (
            <div key={c.code} className="panel" style={{
              padding: 26,
              background: c.featured ? 'linear-gradient(140deg, #16181C, #0f100f 60%, #1a1d14)' : 'var(--bg-panel)',
              borderColor: c.featured ? 'rgba(212,245,71,0.3)' : 'var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div className="mono" style={{ fontSize: 11, color: c.featured ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.08em' }}>{c.code}</div>
                {c.featured && <span className="badge accent">CAPSTONE</span>}
              </div>
              <h3 style={{ fontSize: 24, marginBottom: 8, letterSpacing: '-0.02em' }}>{c.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 18, lineHeight: 1.55 }}>{c.desc}</p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>{c.lessons} LESSONS · ~{c.hours}H</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Link className="btn btn-primary" href={checkoutHref}>Get all four credentials {Icons.arrow}</Link>
        </div>
      </div>
    </section>
  );
}

function Outcomes() {
  const items = [
    { img: '/start/sandra-k.jpg', name: 'Sandra K.',  role: 'RN · Houston, TX',           quote: 'Zero tech background. Now I’m the person my hospital calls about AI.' },
    { img: '/start/priya-m.jpg',  name: 'Priya M.',   role: 'Ops Manager · Chicago, IL',  quote: '$50k on an MBA taught me less than this did. Promoted in 60 days.' },
    { img: '/start/marcus-t.jpg', name: 'Marcus T.',  role: 'Consultant · Finance',       quote: 'Capstone alone opened 3 client conversations. ROI is genuinely insane.' },
  ];
  return (
    <section className="home-section" style={{ padding: '88px 0', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>OUTCOMES</div>
          <h2 className="home-h2" style={{ maxWidth: 720 }}>What changes when you actually <span className="serif" style={{ fontStyle: 'italic' }}>finish</span>.</h2>
        </div>
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {items.map((t) => (
            <div key={t.name} className="panel" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg)' }}>
              <p style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--text)' }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.img} alt={t.name} width={44} height={44} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credibility() {
  const fw = [
    { num: 'FRAMEWORK 01', title: 'Merrill’s First Principles', body: 'Every lesson follows a 5-phase scaffold: think → understand → learn → apply → quiz, organized around a real problem.', used: ['Harvard Business School', 'U.S. Military training', 'Wharton Exec Ed'] },
    { num: 'FRAMEWORK 02', title: 'Cognitive Load Theory',      body: 'Working memory is finite. Lessons are deliberately short and chunked — every sentence earns its keep.', used: ['MITx · MIT OpenCourseWare', 'Stanford Online', 'Carnegie Mellon OLI'] },
    { num: 'FRAMEWORK 03', title: 'Retrieval Practice',         body: 'Active recall beats re-reading by 40–60% in long-term retention. Quick Recall every third lesson; module-end interleaved review.', used: ['Yale Medical School', 'Khan Academy', 'Wash. U.'] },
  ];
  return (
    <section className="home-section" style={{ padding: '88px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>WHY IT WORKS</div>
          <h2 className="home-h2" style={{ maxWidth: 760, margin: '0 auto 12px' }}>
            The same learning science<br /><span className="serif" style={{ fontStyle: 'italic' }}>used at Harvard, MIT, and Yale.</span>
          </h2>
        </div>
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {fw.map((f) => (
            <div key={f.num} className="panel" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-panel)' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em' }}>{f.num}</div>
              <h3 style={{ fontSize: 18, letterSpacing: '-0.015em', lineHeight: 1.25 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.55 }}>{f.body}</p>
              <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>USED AT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13 }}>
                  {f.used.map((u) => <span key={u}>{u}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceBlock({ partner, price, checkoutHref }: any) {
  return (
    <section className="home-section" style={{ padding: '88px 0', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>YOUR PRICE</div>
          <h2 className="home-h2" style={{ maxWidth: 720, margin: '0 auto' }}>
            {partner.name}&rsquo;s code is <span className="serif" style={{ fontStyle: 'italic' }}>already on it.</span>
          </h2>
        </div>
        <div className="home-bundle" style={{
          padding: 36, maxWidth: 880, margin: '0 auto',
          background: 'color-mix(in oklab, var(--accent) 8%, var(--bg))',
          border: '1px solid rgba(212,245,71,0.3)',
          borderRadius: 'var(--radius-lg)',
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center',
        }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 10 }}>ALL 4 CREDENTIALS · LIFETIME ACCESS</div>
            <div style={{ fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>AI·101 + AI·102 + AI·103 + AI·104</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}>
              116 lessons. ~7 hours. Includes the capstone project. Yours forever.
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.check}</span> 30-day money back</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.check}</span> Verifiable certs</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.check}</span> Free updates forever</span>
            </div>
          </div>
          <div className="home-bundle-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: 'var(--text-dim)', textDecoration: 'line-through' }}>{formatCents(price.regularCents)}</div>
              <div style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{formatCents(price.finalCents)}</div>
              {price.discountLabel && (
                <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>with code {partner.couponCode} · {price.discountLabel}</div>
              )}
            </div>
            <Link className="btn btn-primary btn-lg" href={checkoutHref} style={{ width: '100%', justifyContent: 'center' }}>
              Get instant access {Icons.arrow}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    { q: 'Do I need a coding background?', a: 'No. Truos is built for the 90% of professionals who aren\'t engineers. AI·101 starts at zero.' },
    { q: 'How long do I have access?', a: 'Forever. One purchase, lifetime access — including all future course updates.' },
    { q: 'What if I don\'t like it?', a: '30-day money-back guarantee. Email hello@truos.ai for a full refund.' },
    { q: 'Are the certificates real?', a: 'Each credential issues a verifiable certificate. Add to LinkedIn, share with employers — every cert has a public verification URL on truos.ai/verify.' },
  ];
  return (
    <section className="home-section" style={{ padding: '72px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>QUESTIONS</div>
        <h2 className="home-h2" style={{ marginBottom: 28 }}>Common questions.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {items.map((it, i) => (
            <details key={i} style={{ borderTop: i ? '1px solid var(--border)' : 'none', background: 'var(--bg-panel)' }}>
              <summary style={{ padding: '18px 24px', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15.5, fontWeight: 500 }}>
                {it.q}
                <span style={{ color: 'var(--accent)' }}>+</span>
              </summary>
              <div style={{ padding: '0 24px 18px', color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.6 }}>{it.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ partner, price, checkoutHref }: any) {
  return (
    <section className="home-section" style={{ padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
        <h2 className="home-h2" style={{ marginBottom: 18 }}>
          {partner.name}&rsquo;s readers are <span className="serif" style={{ fontStyle: 'italic' }}>moving early.</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, marginBottom: 28, lineHeight: 1.55 }}>
          You can join them in the next 60 seconds.
        </p>
        <div className="home-final-ctas" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary btn-lg" href={checkoutHref}>Get the bundle — {formatCents(price.finalCents)} {Icons.arrow}</Link>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-dim)' }}>
          Code <span className="mono" style={{ color: 'var(--text-muted)' }}>{partner.couponCode}</span> auto-applied · 30-day guarantee · Lifetime access
        </div>
      </div>
    </section>
  );
}

function PartnerFooter({ partner }: any) {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '36px 0 28px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Truos.ai</Link>
          <Link href="/methodology" style={{ color: 'var(--text-muted)' }}>Methodology</Link>
          <Link href="/verify" style={{ color: 'var(--text-muted)' }}>Verify a cert</Link>
          <a href="mailto:hello@truos.ai" style={{ color: 'var(--text-muted)' }}>Contact</a>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>© 2026 TRUOS · Special offer for {partner.name}&rsquo;s audience</div>
      </div>
    </footer>
  );
}
