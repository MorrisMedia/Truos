import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDivisionLedBy, getOrgBySlug } from '@/lib/org';

async function updateDivisionTrashTalk(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.id) return;
  const division = await getDivisionLedBy(session.user.id);
  if (!division) return;
  const text = String(formData.get('trashTalk') ?? '').trim().slice(0, 200);
  await prisma.orgDivision.update({
    where: { id: division.id },
    data: { trashTalk: text || null, trashTalkAt: text ? new Date() : null },
  });
  const hlm = await getOrgBySlug('hlm');
  if (hlm) revalidateTag(`league:${hlm.id}`);
  revalidatePath('/homelife');
  revalidatePath('/homelife/team/trash-talk');
}

export default async function TeamTrashTalkPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const division = await getDivisionLedBy(session.user.id);
  if (!division) return null;

  return (
    <>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>{division.emoji} {division.name} trash-talk</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        ≤200 chars. Shown on the public scoreboard under your division row, in your division color, italic.
      </p>
      <form action={updateDivisionTrashTalk} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
        <textarea
          name="trashTalk"
          defaultValue={division.trashTalk ?? ''}
          maxLength={200}
          rows={3}
          placeholder={`e.g. ${division.name} sweeping the leaderboard this week 👑`}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 6,
            border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
            color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
          }}
        />
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 6, borderLeft: `3px solid ${division.color ?? 'var(--accent)'}` }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live preview</div>
          <div style={{ fontStyle: 'italic', color: division.color ?? 'var(--accent)' }}>
            {division.trashTalk || `[your message here]`}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </>
  );
}
