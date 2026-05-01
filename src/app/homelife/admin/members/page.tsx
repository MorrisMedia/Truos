import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrgBySlug } from '@/lib/org';
import { Flash } from '../../_components/Flash';
import { SaveButton } from '../../_components/SaveButton';

async function updateMember(formData: FormData) {
  'use server';
  const userId = String(formData.get('userId') ?? '');
  const divisionId = String(formData.get('divisionId') ?? '');
  const orgRole = String(formData.get('orgRole') ?? 'learner');
  if (!userId) return;
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      divisionId: divisionId === '' ? null : divisionId,
      orgRole: ['owner','admin','manager','learner'].includes(orgRole) ? orgRole : 'learner',
    },
    select: { name: true, email: true },
  });
  revalidateTag(`league:${hlm.id}`);
  revalidatePath('/homelife/admin/members');
  revalidatePath('/homelife');
  redirect(`/homelife/admin/members?flash=updated&n=${encodeURIComponent(updated.name ?? updated.email)}`);
}

async function removeMember(formData: FormData) {
  'use server';
  const userId = String(formData.get('userId') ?? '');
  if (!userId) return;
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return;
  const removed = await prisma.user.update({
    where: { id: userId },
    data: { orgId: null, orgRole: null, divisionId: null },
    select: { name: true, email: true },
  });
  revalidateTag(`league:${hlm.id}`);
  revalidatePath('/homelife/admin/members');
  revalidatePath('/homelife');
  redirect(`/homelife/admin/members?flash=removed&n=${encodeURIComponent(removed.name ?? removed.email)}`);
}

export default async function MembersAdminPage({ searchParams }: { searchParams: { flash?: string; n?: string } }) {
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return null;
  const flash = searchParams.flash;
  const n = searchParams.n;
  const [members, divisions] = await Promise.all([
    prisma.user.findMany({
      where: { orgId: hlm.id },
      orderBy: [{ orgRole: 'asc' }, { name: 'asc' }, { email: 'asc' }],
      select: {
        id: true, name: true, email: true, orgRole: true, divisionId: true,
        createdAt: true,
        _count: { select: { certificates: true } },
      },
    }),
    prisma.orgDivision.findMany({ where: { orgId: hlm.id }, orderBy: { name: 'asc' } }),
  ]);

  const inputStyle: React.CSSProperties = {
    padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border-strong)',
    background: 'var(--bg-elevated)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  };
  const cellStyle: React.CSSProperties = { padding: '12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  return (
    <>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Members ({members.length})</h2>

      {flash === 'updated' && <Flash type="success">✅ Updated <b>{n}</b>.</Flash>}
      {flash === 'removed' && <Flash type="info">Removed <b>{n}</b> from HomeLife (certificates preserved).</Flash>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 130px 60px auto auto', gap: 12, padding: '0 16px', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Name / Email</span>
          <span>Division</span>
          <span>Role</span>
          <span>Certs</span>
          <span style={{ textAlign: 'right' }}>Save</span>
          <span style={{ textAlign: 'right' }}>Remove</span>
        </div>
        {members.map(m => (
          <div key={m.id} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 130px 60px auto auto',
            gap: 12,
            alignItems: 'center',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '12px 16px',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
            </div>
            <form action={updateMember} style={{ display: 'contents' }}>
              <input type="hidden" name="userId" value={m.id} />
              <select name="divisionId" defaultValue={m.divisionId ?? ''} style={{ ...inputStyle, width: '100%' }}>
                <option value="">—</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
              </select>
              <select name="orgRole" defaultValue={m.orgRole ?? 'learner'} style={{ ...inputStyle, width: '100%' }}>
                <option value="learner">learner</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
                <option value="owner">owner</option>
              </select>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 13 }}>{m._count.certificates}</span>
              <SaveButton variant="ghost" pendingLabel="Saving…" style={{ fontSize: 12, padding: '6px 14px' }}>Save</SaveButton>
            </form>
            <form action={removeMember}>
              <input type="hidden" name="userId" value={m.id} />
              <SaveButton variant="ghost" pendingLabel="Removing…" style={{ fontSize: 12, padding: '6px 12px' }}>Remove</SaveButton>
            </form>
          </div>
        ))}
        {members.length === 0 && (
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            No members yet — share <code>/sign-up</code> with HLM teammates.
          </div>
        )}
      </div>

      <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
        Membership is automatic for any new sign-up with an <code>@homelifemedia.com</code> email. Removing a member clears their org/division/role but preserves their certificates.
      </p>
    </>
  );
}
