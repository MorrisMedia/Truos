import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrgBySlug } from '@/lib/org';
import { Flash } from '../../_components/Flash';

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

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)' }}>
              {['Name / Email','Division','Role','Certs','Save / Remove'].map((h, i) => (
                <th key={h} style={{ ...cellStyle, textAlign: i === 4 ? 'right' : 'left', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 600 }}>{m.name ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                </td>
                <td style={cellStyle}>
                  <form action={updateMember} id={`m-${m.id}`}>
                    <input type="hidden" name="userId" value={m.id} />
                    <select name="divisionId" defaultValue={m.divisionId ?? ''} style={{ ...inputStyle, width: 160 }}>
                      <option value="">—</option>
                      {divisions.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
                    </select>
                  </form>
                </td>
                <td style={cellStyle}>
                  <select form={`m-${m.id}`} name="orgRole" defaultValue={m.orgRole ?? 'learner'} style={{ ...inputStyle, width: 110 }}>
                    <option value="learner">learner</option>
                    <option value="manager">manager</option>
                    <option value="admin">admin</option>
                    <option value="owner">owner</option>
                  </select>
                </td>
                <td style={{ ...cellStyle, color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 13 }}>{m._count.certificates}</td>
                <td style={{ ...cellStyle, whiteSpace: 'nowrap', textAlign: 'right' }}>
                  <button form={`m-${m.id}`} type="submit" className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px', marginRight: 6 }}>Save</button>
                  <form action={removeMember} style={{ display: 'inline' }}>
                    <input type="hidden" name="userId" value={m.id} />
                    <button type="submit" className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>Remove</button>
                  </form>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={5} style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No members yet — share <code>/sign-up</code> with HLM teammates.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
        Membership is automatic for any new sign-up with an <code>@homelifemedia.com</code> email. Removing a member clears their org/division/role but preserves their certificates.
      </p>
    </>
  );
}
