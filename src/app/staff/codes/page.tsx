import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';
import { ALL_COURSES } from '@/content/courses';
import { APP_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

function randomCode(len = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

async function createCode(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');

  const customCode = String(formData.get('customCode') ?? '').trim().toUpperCase();
  const label = String(formData.get('label') ?? '').trim() || null;
  const courseIds = (formData.getAll('courseIds') as string[]).map(Number).filter(Boolean);
  const maxUsesRaw = String(formData.get('maxUses') ?? '').trim();
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
  const expiresRaw = String(formData.get('expiresAt') ?? '').trim();
  const expiresAt = expiresRaw ? new Date(expiresRaw) : null;

  // Auto-generate unique code if custom not provided; retry on collision.
  let code = customCode;
  let created = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = code || randomCode();
    const existing = await prisma.compCode.findUnique({ where: { code: candidate } });
    if (existing) {
      if (customCode) {
        // Tried a custom that already exists — bubble up a readable error.
        redirect(`/staff/codes?err=${encodeURIComponent(`Code "${customCode}" already exists`)}`);
      }
      continue;
    }
    created = await prisma.compCode.create({
      data: {
        code: candidate,
        label,
        courseIds: courseIds.length ? courseIds : [],
        maxUses,
        expiresAt,
        createdBy: session.user.email,
      },
    });
    code = candidate;
    break;
  }
  if (!created) redirect('/staff/codes?err=Could%20not%20generate%20a%20unique%20code');

  revalidatePath('/staff/codes');
  redirect(`/staff/codes?created=${encodeURIComponent(code)}`);
}

async function toggleCode(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');
  const id = String(formData.get('id'));
  const code = await prisma.compCode.findUnique({ where: { id } });
  if (!code) return;
  await prisma.compCode.update({
    where: { id },
    data: { disabledAt: code.disabledAt ? null : new Date() },
  });
  revalidatePath('/staff/codes');
}

export default async function StaffCodesPage({ searchParams }: { searchParams: { created?: string; err?: string } }) {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  const codes = await prisma.compCode.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  const paidCourses = ALL_COURSES.filter(c => c.tier === 'paid');
  const createdCode = searchParams?.created ? String(searchParams.created) : null;
  const errMsg = searchParams?.err ? String(searchParams.err) : null;

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/staff" className="nav-link" style={{ fontSize: 13, marginBottom: 16, display: 'inline-flex' }}>
            {Icons.arrowLeft} Staff overview
          </Link>
          <h1 style={{ fontSize: 40, letterSpacing: '-0.025em' }}>Comp codes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
            Codes unlock paid courses for free. Scope to specific courses or leave blank for all paid.
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div className="container">
          {createdCode && (
            <div style={{ background: 'color-mix(in oklab, var(--accent) 10%, var(--bg-panel))', border: '1px solid var(--accent)', borderRadius: 8, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14 }}>
                Created <span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>{createdCode}</span>.
                Shareable URL: <span className="mono" style={{ fontSize: 12 }}>{APP_URL}/redeem/{createdCode}</span>
              </div>
              <Link href="/staff/codes" className="btn btn-ghost btn-sm">Dismiss</Link>
            </div>
          )}
          {errMsg && (
            <div style={{ background: 'color-mix(in oklab, var(--danger) 10%, var(--bg-panel))', border: '1px solid var(--danger)', borderRadius: 8, padding: '14px 18px', marginBottom: 24, fontSize: 14 }}>
              {errMsg}
            </div>
          )}
        </div>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 32 }}>
          <div className="panel" style={{ padding: 24, alignSelf: 'start' }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>NEW CODE</div>
            <form action={createCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField label="CODE (BLANK FOR AUTO)">
                <input name="customCode" placeholder="e.g. BETA2026" style={fieldStyle} />
              </FormField>
              <FormField label="LABEL (INTERNAL NOTE)">
                <input name="label" placeholder="e.g. YC batch" style={fieldStyle} />
              </FormField>
              <FormField label="COURSES (LEAVE BLANK FOR ALL PAID)">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
                  {paidCourses.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 4, cursor: 'pointer' }}>
                      <input type="checkbox" name="courseIds" value={c.id} />
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.code}</span>
                    </label>
                  ))}
                </div>
              </FormField>
              <FormField label="MAX USES (BLANK = UNLIMITED)">
                <input name="maxUses" type="number" min="1" placeholder="10" style={fieldStyle} />
              </FormField>
              <FormField label="EXPIRES (BLANK = NEVER)">
                <input name="expiresAt" type="date" style={fieldStyle} />
              </FormField>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Create code {Icons.arrow}
              </button>
            </form>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>EXISTING CODES · {codes.length}</div>
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              {codes.length === 0 ? (
                <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>No codes yet.</div>
              ) : codes.map((c, i) => {
                const disabled = !!c.disabledAt;
                const expired = c.expiresAt && c.expiresAt < new Date();
                const exhausted = c.maxUses != null && c.uses >= c.maxUses;
                return (
                  <div key={c.id} style={{ padding: '16px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 20, alignItems: 'center' }}>
                    <div>
                      <div className="mono" style={{ fontSize: 14, color: disabled || expired || exhausted ? 'var(--text-dim)' : 'var(--accent)' }}>
                        {c.code}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {c.label ?? '—'}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>Uses: {c.uses}{c.maxUses != null ? ` / ${c.maxUses}` : ' (∞)'}</span>
                      <span>Courses: {c.courseIds.length === 0 ? 'all paid' : c.courseIds.join(', ')}</span>
                      <span>Expires: {c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0,10) : 'never'}</span>
                      <span>By: {c.createdBy}</span>
                      {disabled && <span style={{ color: 'var(--danger)' }}>DISABLED</span>}
                      {expired && <span style={{ color: 'var(--warn)' }}>EXPIRED</span>}
                      {exhausted && <span style={{ color: 'var(--warn)' }}>EXHAUSTED</span>}
                    </div>
                    <form action={toggleCode}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="btn btn-ghost btn-sm">
                        {disabled ? 'Re-enable' : 'Disable'}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="eyebrow" style={{ fontSize: 10 }}>{label}</span>
      {children}
    </label>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 6,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-elevated)', color: 'var(--text)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
};
