import { requireHlmRole } from '../../_lib/hlm-auth';
import { prisma } from '@/lib/prisma';
import { OnboardWizard } from '../../_components/OnboardWizard';

export const dynamic = 'force-dynamic';

export default async function AdminOnboard() {
  const { org } = await requireHlmRole('org_admin');

  const memberCount = await prisma.orgMembership.count({
    where: { orgId: org.id },
  });

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
          Invite
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 4 }}>
          Onboard your team
        </h1>
        {memberCount > 0 && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''} already invited or joined.
          </p>
        )}
      </div>
      <OnboardWizard orgId={org.id} orgName={org.name} />
    </div>
  );
}
