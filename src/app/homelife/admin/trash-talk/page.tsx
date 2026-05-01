import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrgBySlug } from '@/lib/org';

async function updateTrashTalk(formData: FormData) {
  'use server';
  const text = String(formData.get('trashTalk') ?? '').trim().slice(0, 200);
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return;
  await prisma.organization.update({
    where: { id: hlm.id },
    data: { trashTalk: text || null, trashTalkAt: text ? new Date() : null },
  });
  revalidateTag(`league:${hlm.id}`);
  revalidatePath('/homelife');
  revalidatePath('/homelife/admin/trash-talk');
}

export default async function TrashTalkAdminPage() {
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return null;

  return (
    <>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Org-level trash-talk</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        One line, ≤200 chars. Drops into the ticker for 24h, stays on the standings for 7 days.
      </p>
      <form action={updateTrashTalk} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
        <textarea
          name="trashTalk"
          defaultValue={hlm.trashTalk ?? ''}
          maxLength={200}
          rows={3}
          placeholder="e.g. May challenge: first division to 100 pts wins lunch on me 🍔"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 6,
            border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
            color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {hlm.trashTalkAt ? `Last updated ${hlm.trashTalkAt.toISOString().slice(0, 16).replace('T', ' ')} UTC` : 'No banner set yet'}
          </span>
          <button type="submit" className="btn btn-primary">Save banner</button>
        </div>
      </form>
    </>
  );
}
