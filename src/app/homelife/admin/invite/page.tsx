import { sendEmail } from '@/lib/email';
import { getOrgBySlug } from '@/lib/org';
import { prisma } from '@/lib/prisma';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://truos.ai';

async function sendInvites(formData: FormData): Promise<{ sent: number; skipped: string[] }> {
  'use server';
  const raw = String(formData.get('emails') ?? '');
  const message = String(formData.get('message') ?? '').trim();
  const list = Array.from(new Set(
    raw.split(/[\n,;\s]+/g)
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
      .filter(e => /.+@.+\..+/.test(e))
  ));
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return { sent: 0, skipped: list };

  let sent = 0;
  const skipped: string[] = [];
  for (const email of list) {
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) { skipped.push(`${email} (already a user)`); continue; }
    const link = `${APP_URL}/sign-up?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent('/homelife')}`;
    const html = `
      <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#111;">
        <h1 style="font-size:22px;letter-spacing:-0.02em;">You&rsquo;re invited to join the TRUOS LEAGUE</h1>
        <p style="font-size:15px;color:#444;line-height:1.6;">
          HomeLife Media is rolling out Truos AI training to the team. Every course is free for HLM employees,
          and every cert you earn scores points for your division.
        </p>
        ${message ? `<blockquote style="border-left:3px solid #c4f439;padding:8px 16px;color:#222;font-size:14px;background:#fafafa;">${message.replace(/[<>]/g, '')}</blockquote>` : ''}
        <p style="margin:28px 0;text-align:center;">
          <a href="${link}" style="background:#c4f439;color:#000;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:700;">Create your account →</a>
        </p>
        <p style="font-size:12px;color:#666;">Or paste this link: ${link}</p>
        <p style="font-size:12px;color:#999;margin-top:32px;">— Marshall · TRUOS LEAGUE · ${APP_URL}/homelife</p>
      </div>
    `.trim();
    try {
      await sendEmail({
        to: email,
        kind: 'broadcast',
        payload: {
          subject: 'You&rsquo;re invited to TRUOS LEAGUE',
          html,
          text: `You're invited to join the TRUOS LEAGUE — Truos AI training for HomeLife Media.\n\n${message ? `"${message}"\n\n` : ''}Create your account: ${link}`,
        },
      });
      sent++;
    } catch (err) {
      skipped.push(`${email} (send failed)`);
    }
  }
  return { sent, skipped };
}

export default function InviteAdminPage() {
  return (
    <>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Invite HLM teammates</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        Paste any number of emails (commas, spaces, or newlines). They&rsquo;ll get a link to create their Truos account; once signed up,
        they&rsquo;re auto-enrolled in HomeLife Media with all 8 courses free.
      </p>
      <form action={async (fd) => {
        'use server';
        await sendInvites(fd);
      }} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Emails</label>
        <textarea
          name="emails"
          rows={6}
          placeholder="alice@homelifemedia.com, bob@homelifemedia.com, carol@homelifemedia.com"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 6,
            border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
            color: 'var(--text)', fontSize: 14, fontFamily: 'monospace', outline: 'none', resize: 'vertical',
            marginBottom: 14,
          }}
          required
        />
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Personal note (optional, included in the email)</label>
        <textarea
          name="message"
          rows={3}
          placeholder="A note from Marshall about why we're rolling this out..."
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 6,
            border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
            color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button type="submit" className="btn btn-primary">Send invites</button>
        </div>
      </form>
    </>
  );
}
