import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Icons } from '@/components/icons';

export const dynamic = 'force-dynamic';

async function createOrg(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.isStaff) throw new Error('staff only');

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('name required');

  const attachEmail = String(formData.get('attachEmail') ?? '').trim().toLowerCase();

  const org = await prisma.organization.create({ data: { name } });

  if (attachEmail) {
    const user = await prisma.user.findUnique({ where: { email: attachEmail } });
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { orgId: org.id } });
    }
  }

  redirect(`/staff/orgs/${org.id}`);
}

export default async function NewOrgPage() {
  const session = await auth();
  if (!session?.user?.isStaff) redirect('/');

  return (
    <>
      <Nav variant="minimal" />
      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link href="/staff/orgs" className="nav-link" style={{ fontSize: 13, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Icons.arrowLeft} All organizations
          </Link>
          <h1 style={{ fontSize: 40, letterSpacing: '-0.025em' }}>New organization</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
            Create an org container. Attach users and a manual subscription on the detail page.
          </p>
        </div>
      </section>

      <section style={{ padding: '32px 0' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="panel" style={{ padding: 32 }}>
            <form action={createOrg} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>ORG NAME</span>
                <input name="name" required placeholder="Acme Co" style={fieldStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>ATTACH USER BY EMAIL (OPTIONAL)</span>
                <input name="attachEmail" type="email" placeholder="owner@acme.com" style={fieldStyle} />
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  User must already exist. You can also attach users from the org detail page.
                </span>
              </label>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Create organization {Icons.arrow}</button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 6,
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-elevated)', color: 'var(--text)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
};
