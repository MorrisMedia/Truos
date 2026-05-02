import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { getOrgBySlug } from '@/lib/org';
import { prisma } from '@/lib/prisma';
import { SaveButton } from '../../_components/SaveButton';
import { Flash } from '../../_components/Flash';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://truos.ai';

async function sendInvites(formData: FormData) {
  'use server';
  const raw = String(formData.get('emails') ?? '');
  const message = String(formData.get('message') ?? '').trim();
  const list = Array.from(new Set(
    raw.split(/[\n,;\s]+/g)
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
      .filter(e => /.+@.+\..+/.test(e))
  ));
  if (list.length === 0) {
    redirect('/homelife/admin/invite?error=no-emails');
  }
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) redirect('/homelife/admin/invite?error=no-org');

  let sent = 0;
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const email of list) {
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) { skipped.push(email); continue; }
    const link = `${APP_URL}/sign-up?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent('/homelife')}`;
    const safeMsg = message.replace(/[<>]/g, '');
    const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#111;">
  <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#5a7f00;margin:0 0 12px;font-weight:700;">Truos AI Training · HomeLife Media</p>
  <h1 style="font-size:24px;letter-spacing:-0.02em;margin:0 0 16px;line-height:1.25;">Free AI training, on the company.</h1>
  <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 14px;">
    HomeLife Media is rolling out <strong>Truos AI Training</strong> to the team. Eight courses, from "what is AI?" to building a real workflow your team will use — designed for working pros, not engineers.
  </p>
  <ul style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;padding-left:20px;">
    <li><strong>All courses free</strong> for HLM employees</li>
    <li><strong>Verifiable certificates</strong> for every course you finish (LinkedIn-shareable)</li>
    <li>Your progress scores points for your division on the <span style="color:#5a7f00;font-weight:600;">TRUOS LEAGUE</span> scoreboard</li>
  </ul>
  ${safeMsg ? `<blockquote style="border-left:3px solid #c4f439;padding:12px 16px;color:#222;font-size:14px;background:#fafafa;margin:16px 0;border-radius:4px;">${safeMsg}</blockquote>` : ''}
  <p style="margin:28px 0;text-align:center;">
    <a href="${link}" style="background:#c4f439;color:#000;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block;">Start training →</a>
  </p>
  <p style="font-size:12px;color:#666;margin:0 0 8px;">Or paste this link:</p>
  <p style="font-size:11px;color:#888;word-break:break-all;font-family:monospace;margin:0;">${link}</p>
  <p style="font-size:12px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">— Marshall · Truos AI Training · ${APP_URL}/homelife</p>
</div>`.trim();
    try {
      const result = await sendEmail({
        to: email,
        kind: 'broadcast',
        payload: {
          subject: 'Truos AI Training — free for HomeLife employees',
          html,
          text: `Truos AI Training — free for HomeLife employees.\n\nHomeLife Media is rolling out Truos AI Training to the team. Eight courses, all free for HLM, verifiable certificates, and your progress scores points for your division on the TRUOS LEAGUE scoreboard.\n\n${message ? `"${message}"\n\n` : ''}Start training: ${link}`,
        },
      });
      if (result.ok) sent++;
      else failed.push(email);
    } catch {
      failed.push(email);
    }
  }
  const params = new URLSearchParams({
    sent: String(sent),
    skipped: String(skipped.length),
    failed: String(failed.length),
  });
  if (skipped.length) params.set('skippedList', skipped.slice(0, 5).join(','));
  if (failed.length) params.set('failedList', failed.slice(0, 5).join(','));
  redirect(`/homelife/admin/invite?${params.toString()}`);
}

export default function InviteAdminPage({ searchParams }: { searchParams: { sent?: string; skipped?: string; failed?: string; skippedList?: string; failedList?: string; error?: string } }) {
  const sent = parseInt(searchParams.sent ?? '0', 10);
  const skipped = parseInt(searchParams.skipped ?? '0', 10);
  const failed = parseInt(searchParams.failed ?? '0', 10);
  const error = searchParams.error;

  return (
    <>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Invite HLM teammates</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        Paste any number of emails (commas, spaces, or newlines). They&rsquo;ll get a link to create their Truos account; once signed up,
        they&rsquo;re auto-enrolled in HomeLife Media with all 8 courses free.
      </p>

      {error === 'no-emails' && <Flash type="error">Couldn&rsquo;t find any valid email addresses in what you pasted.</Flash>}
      {error === 'no-org' && <Flash type="error">HomeLife org missing — re-run <code>npm run seed:hlm</code>.</Flash>}
      {sent > 0 && (
        <Flash type="success">
          ✅ Sent {sent} invitation{sent === 1 ? '' : 's'}.
          {skipped > 0 && <> Skipped {skipped} (already a Truos user{searchParams.skippedList ? `: ${searchParams.skippedList}${skipped > 5 ? '…' : ''}` : ''}).</>}
          {failed > 0 && <> {failed} failed to send{searchParams.failedList ? `: ${searchParams.failedList}` : ''}.</>}
        </Flash>
      )}
      {sent === 0 && (skipped > 0 || failed > 0) && (
        <Flash type="info">
          No new invites sent. {skipped > 0 && <>{skipped} already a user.</>} {failed > 0 && <>{failed} failed.</>}
        </Flash>
      )}

      <form action={sendInvites} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
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
          <SaveButton pendingLabel="Sending…">Send invites</SaveButton>
        </div>
      </form>
    </>
  );
}
