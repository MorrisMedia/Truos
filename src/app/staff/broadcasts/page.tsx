import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';
import { ALL_COURSES } from '@/content/courses';
import { sendEmail, isEmailConfigured, emailFromLine } from '@/lib/email';
import { broadcastEmail } from '@/lib/emails/templates';

export const dynamic = 'force-dynamic';

type Audience = 'all_subscribed' | 'has_any_entitlement' | 'course_entitlement' | 'org_members' | 'staff_only';

async function resolveRecipients(audience: Audience, courseId?: number, orgId?: string) {
  const baseWhere = { emailSubscribed: true };
  switch (audience) {
    case 'all_subscribed':
      return prisma.user.findMany({ where: baseWhere, select: { id: true, email: true, name: true } });
    case 'has_any_entitlement': {
      const userIds = await prisma.courseEntitlement.findMany({
        distinct: ['userId'],
        select: { userId: true },
      });
      return prisma.user.findMany({
        where: { ...baseWhere, id: { in: userIds.map(x => x.userId) } },
        select: { id: true, email: true, name: true },
      });
    }
    case 'course_entitlement': {
      if (!courseId) return [];
      const userIds = await prisma.courseEntitlement.findMany({
        where: { courseId },
        distinct: ['userId'],
        select: { userId: true },
      });
      return prisma.user.findMany({
        where: { ...baseWhere, id: { in: userIds.map(x => x.userId) } },
        select: { id: true, email: true, name: true },
      });
    }
    case 'org_members': {
      if (!orgId) return [];
      return prisma.user.findMany({
        where: { ...baseWhere, orgId },
        select: { id: true, email: true, name: true },
      });
    }
    case 'staff_only': {
      const { STAFF_EMAILS } = await import('@/lib/config');
      return prisma.user.findMany({
        where: { email: { in: STAFF_EMAILS } },
        select: { id: true, email: true, name: true },
      });
    }
  }
}

async function previewAction(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const params = extractParams(formData);
  const url = new URL('http://x/staff/broadcasts');
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') url.searchParams.set(k, String(v)); });
  url.searchParams.set('preview', '1');
  redirect(url.pathname + url.search);
}

async function sendBroadcast(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const p = extractParams(formData);
  if (!p.subject || !p.headline || !p.body) {
    redirect('/staff/broadcasts?err=' + encodeURIComponent('Subject, headline, and body are required'));
  }

  const recipients = await resolveRecipients(p.audience, p.courseId, p.orgId);
  if (recipients.length === 0) {
    redirect('/staff/broadcasts?err=' + encodeURIComponent('Audience resolved to 0 recipients'));
  }

  let sent = 0, failed = 0;
  for (const u of recipients) {
    const res = await sendEmail({
      to: u.email,
      userId: u.id,
      kind: 'broadcast',
      payload: broadcastEmail({
        name: u.name,
        userId: u.id,
        subject: p.subject,
        headline: p.headline,
        body: p.body,
        ctaLabel: p.ctaLabel || undefined,
        ctaUrl: p.ctaUrl || undefined,
      }),
    });
    if (res.ok) sent++; else failed++;
  }

  redirect(`/staff/broadcasts?ok=${encodeURIComponent(`Sent ${sent} / ${recipients.length}${failed ? ` (${failed} failed)` : ''}`)}`);
}

function extractParams(fd: FormData) {
  return {
    audience: (String(fd.get('audience') ?? 'all_subscribed')) as Audience,
    courseId: fd.get('courseId') ? Number(fd.get('courseId')) : undefined,
    orgId: String(fd.get('orgId') ?? '').trim() || undefined,
    subject: String(fd.get('subject') ?? '').trim(),
    headline: String(fd.get('headline') ?? '').trim(),
    body: String(fd.get('body') ?? '').trim(),
    ctaLabel: String(fd.get('ctaLabel') ?? '').trim(),
    ctaUrl: String(fd.get('ctaUrl') ?? '').trim(),
  };
}

export default async function StaffBroadcastsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const sp = searchParams ?? {};
  const okMsg = sp.ok ?? null;
  const errMsg = sp.err ?? null;
  const isPreview = sp.preview === '1';

  const audience = (sp.audience ?? 'all_subscribed') as Audience;
  const courseId = sp.courseId ? Number(sp.courseId) : undefined;
  const orgId = sp.orgId || undefined;
  const subject = sp.subject ?? '';
  const headline = sp.headline ?? '';
  const body = sp.body ?? '';
  const ctaLabel = sp.ctaLabel ?? '';
  const ctaUrl = sp.ctaUrl ?? '';

  // Recipient count preview (no send)
  let recipientCount = 0;
  try {
    const list = await resolveRecipients(audience, courseId, orgId);
    recipientCount = list.length;
  } catch { /* ignore */ }

  // Preview render
  let previewHtml: string | null = null;
  let previewSubject: string | null = null;
  if (isPreview && subject && headline && body) {
    const payload = broadcastEmail({
      name: session.user.name ?? null,
      userId: session.user.id,
      subject,
      headline,
      body,
      ctaLabel: ctaLabel || undefined,
      ctaUrl: ctaUrl || undefined,
    });
    previewHtml = payload.html;
    previewSubject = payload.subject;
  }

  const [recent, orgs] = await Promise.all([
    prisma.emailLog.findMany({ where: { kind: 'broadcast' }, orderBy: { sentAt: 'desc' }, take: 12 }),
    prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' }, take: 50 }),
  ]);

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/staff" className="nav-link" style={{ fontSize: 13, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Icons.arrowLeft} Staff overview
          </Link>
          <h1 style={{ fontSize: 40, letterSpacing: '-0.025em' }}>Broadcasts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
            Send announcements to subscribed users. Sending from <span className="mono">{emailFromLine()}</span>.
            {!isEmailConfigured() && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>RESEND_API_KEY not set — sends will no-op until configured.</span>}
          </p>
        </div>
      </section>

      <section style={{ padding: '32px 0 48px' }}>
        <div className="container" style={{ marginBottom: (okMsg || errMsg) ? 16 : 0 }}>
          {okMsg && <div style={flashOk}>{okMsg}</div>}
          {errMsg && <div style={flashErr}>{errMsg}</div>}
        </div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
          <form action={sendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>AUDIENCE · {recipientCount} RECIPIENT{recipientCount === 1 ? '' : 'S'}</div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>WHO</span>
                <select name="audience" defaultValue={audience} style={fieldStyle}>
                  <option value="all_subscribed">All subscribed users</option>
                  <option value="has_any_entitlement">Users with any course entitlement (paid or comped)</option>
                  <option value="course_entitlement">Users entitled to a specific course</option>
                  <option value="org_members">Members of a specific organization</option>
                  <option value="staff_only">Staff only (test sends)</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>COURSE (FOR "COURSE ENTITLEMENT" AUDIENCE)</span>
                <select name="courseId" defaultValue={courseId?.toString() ?? ''} style={fieldStyle}>
                  <option value="">—</option>
                  {ALL_COURSES.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>ORGANIZATION (FOR "ORG MEMBERS" AUDIENCE)</span>
                <select name="orgId" defaultValue={orgId ?? ''} style={fieldStyle}>
                  <option value="">—</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </label>
            </div>

            <div className="panel" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>MESSAGE</div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>SUBJECT (EMAIL HEADER)</span>
                <input name="subject" defaultValue={subject} placeholder="e.g. New course: Copilot + Excel" required style={fieldStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>HEADLINE (SHOWN AT TOP OF EMAIL)</span>
                <input name="headline" defaultValue={headline} placeholder="Big news for your workday." required style={fieldStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>BODY (PLAIN TEXT — BLANK LINE FOR NEW PARAGRAPH)</span>
                <textarea name="body" defaultValue={body} rows={8} required style={{ ...fieldStyle, fontFamily: 'inherit', resize: 'vertical' }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>CTA LABEL (OPTIONAL)</span>
                  <input name="ctaLabel" defaultValue={ctaLabel} placeholder="Start the course" style={fieldStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>CTA URL (OPTIONAL)</span>
                  <input name="ctaUrl" defaultValue={ctaUrl} placeholder="https://truos.ai/..." style={fieldStyle} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" formAction={previewAction} className="btn btn-ghost">Preview</button>
              <button type="submit" className="btn btn-primary">Send to {recipientCount} recipient{recipientCount === 1 ? '' : 's'} {Icons.arrow}</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              Broadcasts honor unsubscribe. Transactional emails (welcome, cert, access grant) always send.
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {previewHtml ? (
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="eyebrow">PREVIEW</div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{previewSubject}</span>
                </div>
                <iframe srcDoc={previewHtml} style={{ width: '100%', height: 560, border: 'none', background: '#F4F5F7' }} />
              </div>
            ) : (
              <div className="panel" style={{ padding: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>TIPS</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <li>Start with <strong>Staff only</strong> to test your copy before blasting.</li>
                  <li>Keep the headline under 8 words.</li>
                  <li>One CTA per email converts better than two.</li>
                  <li>"Users with any entitlement" is the right audience for course updates.</li>
                </ul>
              </div>
            )}

            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>RECENT BROADCASTS · {recent.length}</div>
              {recent.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No broadcasts sent yet.</div>
              ) : recent.map((log, i) => (
                <div key={log.id} style={{ padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{log.subject}</div>
                  <div style={{ display: 'flex', gap: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                    <span className="mono" style={{ fontSize: 10 }}>{log.toEmail}</span>
                    <span className="mono" style={{ fontSize: 10, color: log.status === 'sent' ? 'var(--accent)' : 'var(--danger)' }}>{log.status}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>{new Date(log.sentAt).toISOString().slice(0, 16).replace('T', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 6,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-elevated)', color: 'var(--text)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
};

const flashOk: React.CSSProperties = {
  background: 'color-mix(in oklab, var(--accent) 10%, var(--bg-panel))',
  border: '1px solid var(--accent)', borderRadius: 8,
  padding: '12px 16px', fontSize: 14,
};

const flashErr: React.CSSProperties = {
  background: 'color-mix(in oklab, var(--danger) 10%, var(--bg-panel))',
  border: '1px solid var(--danger)', borderRadius: 8,
  padding: '12px 16px', fontSize: 14,
};
