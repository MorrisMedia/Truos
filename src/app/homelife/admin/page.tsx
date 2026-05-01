import Link from 'next/link';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrgBySlug } from '@/lib/org';
import { getStandings } from '@/lib/league';
import { SaveButton } from '../_components/SaveButton';
import { Flash } from '../_components/Flash';

async function updateOrgSettings(formData: FormData) {
  'use server';
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return;
  const name = String(formData.get('name') ?? '').trim() || hlm.name;
  const primaryColor = String(formData.get('primaryColor') ?? '').trim() || null;
  const logoUrl = String(formData.get('logoUrl') ?? '').trim() || null;
  const autoGrantAll = formData.get('autoGrantAll') === 'on';
  const domainsRaw = String(formData.get('domains') ?? '');
  const domains = Array.from(new Set(
    domainsRaw.split(/[\n,;\s]+/g).map(s => s.trim().toLowerCase()).filter(d => /\./.test(d))
  ));
  const trashTalk = String(formData.get('trashTalk') ?? '').trim().slice(0, 200) || null;

  await prisma.organization.update({
    where: { id: hlm.id },
    data: {
      name,
      primaryColor,
      logoUrl,
      autoGrantAll,
      domains,
      trashTalk,
      trashTalkAt: trashTalk ? new Date() : null,
    },
  });
  revalidateTag(`league:${hlm.id}`);
  revalidatePath('/homelife');
  revalidatePath('/homelife/admin');
  redirect('/homelife/admin?flash=saved');
}

export default async function HomeLifeAdminHome({ searchParams }: { searchParams: { flash?: string } }) {
  const hlm = await getOrgBySlug('hlm');
  if (!hlm) return null;

  const [memberCount, certCount, divisionCount, standings, ledDivisions] = await Promise.all([
    prisma.user.count({ where: { orgId: hlm.id } }),
    prisma.certificate.count({ where: { user: { orgId: hlm.id } } }),
    prisma.orgDivision.count({ where: { orgId: hlm.id } }),
    getStandings(hlm.id),
    prisma.orgDivision.count({ where: { orgId: hlm.id, leadUserId: { not: null } } }),
  ]);
  const totalPoints = standings.reduce((s, r) => s + r.points, 0);
  const filledDivisions = standings.filter(s => s.members > 0).length;

  const flash = searchParams.flash;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
    color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6,
    letterSpacing: '0.05em', textTransform: 'uppercase',
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: 14, fontFamily: 'monospace', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
  };

  return (
    <>
      {flash === 'saved' && <Flash type="success">✅ Settings saved.</Flash>}

      {/* Stats overview */}
      <h2 style={sectionTitle}>OVERVIEW</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Members</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)', marginTop: 4 }}>{memberCount}</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Divisions</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)', marginTop: 4 }}>{divisionCount}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{filledDivisions} active · {ledDivisions} have a lead</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Certificates</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)', marginTop: 4 }}>{certCount}</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total points</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)', marginTop: 4 }}>{totalPoints}</div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 style={sectionTitle}>QUICK ACTIONS</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
        <Link href="/homelife/admin/invite" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(196,244,57,0.08), var(--bg-panel))',
            border: '1px solid var(--accent)', borderRadius: 8, padding: 20, height: '100%',
          }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>✉️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>Invite teammates</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Send sign-up emails to HLM staff</div>
          </div>
        </Link>
        <Link href="/homelife/admin/divisions" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, height: '100%' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🏷️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>Divisions</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Edit divisions, assign leaders, change colors</div>
          </div>
        </Link>
        <Link href="/homelife/admin/members" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, height: '100%' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>Members</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Assign division + role to each HLM member</div>
          </div>
        </Link>
        <Link href="/homelife" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, height: '100%' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🏆</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>Public scoreboard</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Open the public TRUOS LEAGUE page</div>
          </div>
        </Link>
      </div>

      {/* Org-level settings */}
      <h2 style={sectionTitle}>COMPANY SETTINGS</h2>
      <form action={updateOrgSettings} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Company name</label>
          <input name="name" defaultValue={hlm.name} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Primary color (hex)</label>
            <input name="primaryColor" defaultValue={hlm.primaryColor ?? ''} placeholder="#0F172A" style={{ ...inputStyle, fontFamily: 'monospace' }} />
          </div>
          <div>
            <label style={labelStyle}>Logo URL</label>
            <input name="logoUrl" defaultValue={hlm.logoUrl ?? ''} placeholder="https://..." style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Auto-join email domains</label>
          <input
            name="domains"
            defaultValue={hlm.domains.join(', ')}
            placeholder="homelifemedia.com, brandX.com"
            style={{ ...inputStyle, fontFamily: 'monospace' }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Anyone signing up with these email domains is auto-enrolled in HomeLife as a learner.
          </div>
        </div>

        <div style={{ background: 'var(--bg-hover)', borderRadius: 6, padding: 14, border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" name="autoGrantAll" defaultChecked={hlm.autoGrantAll} style={{ marginTop: 4, width: 18, height: 18, cursor: 'pointer' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>All courses free for HLM members</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                When on, every Truos course (current and future) is unlocked for any member. Disable to use per-user entitlements instead.
              </div>
            </div>
          </label>
        </div>

        <div>
          <label style={labelStyle}>Org-wide trash-talk banner (≤200 chars)</label>
          <textarea
            name="trashTalk"
            defaultValue={hlm.trashTalk ?? ''}
            maxLength={200}
            rows={2}
            placeholder="May challenge: first division to 100 pts wins lunch on me 🍔"
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Shown in the ticker for 24h, on standings for 7 days.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            org.id: {hlm.id}
          </div>
          <SaveButton pendingLabel="Saving…">Save settings</SaveButton>
        </div>
      </form>

      {/* Top divisions snapshot */}
      <h2 style={{ ...sectionTitle, marginTop: 32 }}>TOP 5 DIVISIONS</h2>
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        {standings.slice(0, 5).map((s, idx) => (
          <div key={s.divisionId} style={{
            display: 'grid', gridTemplateColumns: '32px 28px 1fr auto auto', gap: 12, alignItems: 'center',
            padding: '12px 16px', borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
            borderLeft: `3px solid ${s.color ?? 'var(--accent)'}`,
          }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 13 }}>{idx === 0 ? '👑' : `#${idx + 1}`}</span>
            <span style={{ fontSize: 18 }}>{s.emoji ?? '•'}</span>
            <span style={{ fontWeight: 600 }}>{s.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.members} {s.members === 1 ? 'member' : 'members'}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)' }}>{s.points} pts</span>
          </div>
        ))}
        {standings.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No divisions yet.</div>
        )}
      </div>
    </>
  );
}
