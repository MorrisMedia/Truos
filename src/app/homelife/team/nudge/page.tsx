import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getDivisionLedBy } from '@/lib/org';
import { findCourse, ALL_COURSES } from '@/content/courses';
import { revalidatePath } from 'next/cache';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://truos.ai';

async function sendNudge(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.id) return;
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } });
  const division = await getDivisionLedBy(session.user.id);
  if (!division) return;

  const subject = String(formData.get('subject') ?? `Quick nudge from ${me?.name ?? 'your manager'}`);
  const body = String(formData.get('body') ?? '');
  const recipientIds = formData.getAll('recipient').map(String);

  const recipients = await prisma.user.findMany({
    where: { id: { in: recipientIds }, divisionId: division.id },
    select: { id: true, email: true, name: true, certificates: { select: { courseId: true } } },
  });

  for (const r of recipients) {
    const completed = new Set(r.certificates.map(c => c.courseId));
    const next = ALL_COURSES.find(c => !completed.has(c.id));
    const firstName = (r.name ?? r.email.split('@')[0]).split(' ')[0];
    const personalized = body
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{nextCourseCode\}\}/g, next?.code ?? 'AI·101')
      .replace(/\{\{divisionName\}\}/g, division.name);
    const html = `
      <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#111;">
        <p style="font-size:15px;line-height:1.6;white-space:pre-wrap;">${personalized.replace(/[<>]/g, '')}</p>
        <p style="margin:28px 0;text-align:center;">
          <a href="${APP_URL}/homelife" style="background:#c4f439;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;">Open TRUOS LEAGUE →</a>
        </p>
        <p style="font-size:12px;color:#999;">— ${me?.name ?? me?.email ?? 'your manager'} · ${division.emoji} ${division.name}</p>
      </div>
    `.trim();
    try {
      await sendEmail({
        to: r.email, userId: r.id, kind: 'broadcast',
        payload: { subject, html, text: personalized },
      });
    } catch {}
  }
  revalidatePath('/homelife/team/nudge');
}

export default async function NudgePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const division = await getDivisionLedBy(session.user.id);
  if (!division) return null;

  const teammates = await prisma.user.findMany({
    where: { divisionId: division.id, id: { not: session.user.id } },
    select: { id: true, name: true, email: true, _count: { select: { certificates: true } } },
  });
  // Sort fewest certs first — those are the ones to nudge
  teammates.sort((a, b) => a._count.certificates - b._count.certificates);
  const top5 = teammates.slice(0, 5);

  const defaultBody = `Hey {{firstName}},\n\nQuick nudge — ${division.name} could use your points on the board. Your next course is {{nextCourseCode}} and it'll take an hour or so.\n\nLet's lock in a win this week.`;

  return (
    <>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Nudge incomplete teammates</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        Defaults to the 5 lowest-completion teammates in your division. Tokens supported: <code>{'{{firstName}}'}</code>, <code>{'{{nextCourseCode}}'}</code>, <code>{'{{divisionName}}'}</code>.
      </p>

      <form action={sendNudge} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Recipients</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {teammates.map(t => {
            const isTop5 = top5.includes(t);
            return (
              <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, padding: '6px 8px', borderRadius: 4, background: isTop5 ? 'var(--bg-hover)' : 'transparent' }}>
                <input type="checkbox" name="recipient" value={t.id} defaultChecked={isTop5} />
                <span style={{ flex: 1 }}>{t.name ?? t.email} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>· {t._count.certificates} cert{t._count.certificates === 1 ? '' : 's'}</span></span>
              </label>
            );
          })}
          {teammates.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No teammates yet — Marshall needs to assign people to {division.name} in admin.</div>}
        </div>

        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Subject</label>
        <input
          name="subject"
          defaultValue={`Quick nudge from your ${division.name} lead`}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 6,
            border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
            color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14,
          }}
        />

        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Message</label>
        <textarea
          name="body"
          defaultValue={defaultBody}
          rows={8}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 6,
            border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
            color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button type="submit" className="btn btn-primary" disabled={teammates.length === 0}>Send nudge</button>
        </div>
      </form>
    </>
  );
}
