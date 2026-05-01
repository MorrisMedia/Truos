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

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)' }}>
              <th style={{ ...cellStyle, textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Division</th>
              <th style={{ ...cellStyle, textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Members</th>
              <th style={{ ...cellStyle, textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Leader (email)</th>
              <th style={{ ...cellStyle, textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Color / Emoji</th>
              <th style={{ ...cellStyle, textAlign: 'right', width: 1, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save / Delete</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map(d => (
              <tr key={d.id}>
                <td style={cellStyle}>
                  <form action={updateDivision} id={`f-${d.id}`}>
                    <input type="hidden" name="id" value={d.id} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-block', width: 4, height: 28, background: d.color ?? 'var(--accent)', borderRadius: 2 }} />
                      <input name="name" defaultValue={d.name} style={{ ...inputStyle, fontWeight: 600, fontSize: 14, width: 180 }} />
                    </div>
                  </form>
                </td>
                <td style={{ ...cellStyle, color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', fontSize: 13 }}>{d._count.members}</td>
                <td style={cellStyle}>
                  <input form={`f-${d.id}`} name="leadEmail" defaultValue={d.lead?.email ?? ''} placeholder="email or blank" style={{ ...inputStyle, width: 220 }} />
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input form={`f-${d.id}`} name="emoji" defaultValue={d.emoji ?? '🟢'} maxLength={4} style={{ ...inputStyle, width: 50, textAlign: 'center' }} />
                    <input form={`f-${d.id}`} name="color" defaultValue={d.color ?? '#64748B'} style={{ ...inputStyle, width: 90, fontFamily: 'monospace' }} />
                  </div>
                </td>
                <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                  <button form={`f-${d.id}`} type="submit" className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px', marginRight: 6 }}>Save</button>
                  {d._count.members === 0 && (
                    <form action={deleteDivision} style={{ display: 'inline' }}>
                      <input type="hidden" name="id" value={d.id} />
                      <button type="submit" className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--accent)' }}>×</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
        Leader email must belong to a HomeLife member. Setting a leader promotes them to <code>manager</code> and demotes the prior leader to <code>learner</code>. Owners aren&apos;t demoted.
      </p>
    </>
  );
}
