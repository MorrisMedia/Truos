import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrgBySlug } from '@/lib/org';
import { SaveButton } from '../../_components/SaveButton';
import { Flash } from '../../_components/Flash';

const PALETTE = ['#6366F1','#EC4899','#F59E0B','#EF4444','#10B981','#D946EF','#0EA5E9','#F97316','#06B6D4','#64748B','#84CC16','#A855F7'];

async function createDivision(formData: FormData) {
  'use server';
  const name = String(formData.get('name') ?? '').trim();
  const color = String(formData.get('color') ?? '#64748B');
  const emoji = String(formData.get('emoji') ?? '🟢').trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return;
  await prisma.orgDivision.create({ data: { orgId: hlm.id, slug, name, color, emoji } });
  revalidateTag(`league:${hlm.id}`);
  revalidatePath('/homelife/admin/divisions');
  revalidatePath('/homelife');
  redirect(`/homelife/admin/divisions?flash=created&n=${encodeURIComponent(name)}`);
}

async function updateDivision(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const color = String(formData.get('color') ?? '');
  const emoji = String(formData.get('emoji') ?? '').trim();
  const leadEmail = String(formData.get('leadEmail') ?? '').trim().toLowerCase();
  if (!id) return;
  const data: { name?: string; color?: string; emoji?: string; leadUserId?: string | null } = {};
  if (name) data.name = name;
  if (color) data.color = color;
  if (emoji) data.emoji = emoji;

  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return;
  const div = await prisma.orgDivision.findUnique({ where: { id } });
  if (!div) return;

  let leadStatus: 'unchanged' | 'cleared' | 'set' | 'not-found' | 'wrong-org' = 'unchanged';
  if (leadEmail === '') {
    if (div.leadUserId) {
      data.leadUserId = null;
      await prisma.user.updateMany({ where: { id: div.leadUserId, orgRole: 'manager' }, data: { orgRole: 'learner' } });
      leadStatus = 'cleared';
    }
  } else if (leadEmail) {
    const user = await prisma.user.findUnique({ where: { email: leadEmail } });
    if (!user) leadStatus = 'not-found';
    else if (user.orgId !== hlm.id) leadStatus = 'wrong-org';
    else {
      data.leadUserId = user.id;
      if (div.leadUserId && div.leadUserId !== user.id) {
        await prisma.user.updateMany({ where: { id: div.leadUserId, orgRole: 'manager' }, data: { orgRole: 'learner' } });
      }
      await prisma.user.update({ where: { id: user.id }, data: {
        orgRole: user.orgRole === 'owner' ? 'owner' : 'manager',
        divisionId: id,
      }});
      leadStatus = 'set';
    }
  }

  await prisma.orgDivision.update({ where: { id }, data });
  revalidateTag(`league:${hlm.id}`);
  revalidatePath('/homelife/admin/divisions');
  revalidatePath('/homelife');
  const params = new URLSearchParams({ flash: 'updated', n: name || div.name });
  if (leadStatus !== 'unchanged') params.set('lead', leadStatus);
  if (leadStatus === 'not-found' || leadStatus === 'wrong-org') params.set('email', leadEmail);
  redirect(`/homelife/admin/divisions?${params.toString()}`);
}

async function deleteDivision(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const div = await prisma.orgDivision.findUnique({ where: { id }, include: { _count: { select: { members: true } } } });
  if (!div) return;
  if (div._count.members > 0) return; // soft-block
  const hlm = await getOrgBySlug('hlm');
  await prisma.orgDivision.delete({ where: { id } });
  if (hlm) {
    revalidateTag(`league:${hlm.id}`);
    revalidatePath('/homelife/admin/divisions');
    revalidatePath('/homelife');
  }
  redirect(`/homelife/admin/divisions?flash=deleted&n=${encodeURIComponent(div.name)}`);
}

export default async function DivisionsAdminPage({ searchParams }: { searchParams: { flash?: string; n?: string; lead?: string; email?: string } }) {
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return null;
  const flash = searchParams.flash;
  const n = searchParams.n;
  const leadStatus = searchParams.lead;
  const divisions = await prisma.orgDivision.findMany({
    where: { orgId: hlm.id },
    orderBy: { name: 'asc' },
    include: {
      lead: { select: { email: true, name: true } },
      _count: { select: { members: true } },
    },
  });

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border-strong)',
    background: 'var(--bg-elevated)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  };
  const cellStyle: React.CSSProperties = { padding: '14px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  return (
    <>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Divisions ({divisions.length})</h2>

      {flash === 'created' && <Flash type="success">✅ Created division <b>{n}</b>.</Flash>}
      {flash === 'updated' && (
        <Flash type={leadStatus === 'not-found' || leadStatus === 'wrong-org' ? 'error' : 'success'}>
          {leadStatus === 'not-found' && <>⚠️ Updated <b>{n}</b>, but the leader email <code>{searchParams.email}</code> isn&rsquo;t a Truos user yet — they need to sign up first.</>}
          {leadStatus === 'wrong-org' && <>⚠️ Updated <b>{n}</b>, but <code>{searchParams.email}</code> isn&rsquo;t a HomeLife member.</>}
          {leadStatus === 'set' && <>✅ Updated <b>{n}</b> — leader assigned and promoted to manager.</>}
          {leadStatus === 'cleared' && <>✅ Updated <b>{n}</b> — leader cleared, prior leader demoted to learner.</>}
          {!leadStatus && <>✅ Updated <b>{n}</b>.</>}
        </Flash>
      )}
      {flash === 'deleted' && <Flash type="info">Deleted division <b>{n}</b>.</Flash>}

      <form action={createDivision} style={{ display: 'flex', gap: 10, marginBottom: 24, padding: 16, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, flexWrap: 'wrap' }}>
        <input name="name" placeholder="Division name" style={{ ...inputStyle, flex: '1 1 200px' }} required />
        <input name="emoji" placeholder="🎯" maxLength={4} style={{ ...inputStyle, width: 60, textAlign: 'center' }} defaultValue="🟢" />
        <select name="color" style={{ ...inputStyle, width: 110 }} defaultValue="#64748B">
          {PALETTE.map(c => <option key={c} value={c} style={{ background: c }}>{c}</option>)}
        </select>
        <SaveButton style={{ padding: '8px 18px' }} pendingLabel="Creating…">+ Create division</SaveButton>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr 60px 100px auto', gap: 12, padding: '0 16px', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Division</span>
          <span>Members</span>
          <span>Leader (email)</span>
          <span>Emoji</span>
          <span>Color</span>
          <span style={{ textAlign: 'right' }}>Save</span>
        </div>
        {divisions.map(d => (
          <form
            key={d.id}
            action={updateDivision}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 1fr 60px 100px auto',
              gap: 12,
              alignItems: 'center',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderLeft: `4px solid ${d.color ?? 'var(--accent)'}`,
              borderRadius: 8,
              padding: '14px 16px',
            }}
          >
            <input type="hidden" name="id" value={d.id} />
            <input name="name" defaultValue={d.name} style={{ ...inputStyle, fontWeight: 600, fontSize: 14 }} />
            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 13 }}>{d._count.members}</span>
            <input name="leadEmail" defaultValue={d.lead?.email ?? ''} placeholder="email or blank" style={inputStyle} />
            <input name="emoji" defaultValue={d.emoji ?? '🟢'} maxLength={4} style={{ ...inputStyle, textAlign: 'center' }} />
            <input name="color" defaultValue={d.color ?? '#64748B'} style={{ ...inputStyle, fontFamily: 'monospace' }} />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <SaveButton variant="ghost" pendingLabel="Saving…" style={{ fontSize: 12, padding: '6px 14px' }}>Save</SaveButton>
            </div>
          </form>
        ))}
      </div>

      {divisions.some(d => d._count.members === 0) && (
        <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delete empty division</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {divisions.filter(d => d._count.members === 0).map(d => (
              <form key={d.id} action={deleteDivision} style={{ display: 'inline' }}>
                <input type="hidden" name="id" value={d.id} />
                <SaveButton variant="ghost" pendingLabel="Deleting…" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--text-muted)' }}>{d.emoji ?? '🗑'} {d.name} ×</SaveButton>
              </form>
            ))}
          </div>
        </div>
      )}

      <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
        Leader email must belong to a HomeLife member. Setting a leader promotes them to <code>manager</code> and demotes the prior leader to <code>learner</code>. Owners aren&apos;t demoted.
      </p>
    </>
  );
}
