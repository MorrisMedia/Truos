import { prisma } from './prisma';

export type OrgRole = 'owner' | 'admin' | 'manager' | 'learner';

export interface OrgContext {
  orgId: string | null;
  orgSlug: string | null;
  orgName: string | null;
  divisionId: string | null;
  divisionSlug: string | null;
  orgRole: OrgRole | null;
  isOwner: boolean;
  isManager: boolean;
}

export async function getOrgContext(userId: string | null): Promise<OrgContext> {
  const empty: OrgContext = {
    orgId: null, orgSlug: null, orgName: null,
    divisionId: null, divisionSlug: null,
    orgRole: null, isOwner: false, isManager: false,
  };
  if (!userId) return empty;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      orgId: true,
      orgRole: true,
      divisionId: true,
      org: { select: { slug: true, name: true } },
      division: { select: { slug: true } },
    },
  });
  if (!user) return empty;
  return {
    orgId: user.orgId,
    orgSlug: user.org?.slug ?? null,
    orgName: user.org?.name ?? null,
    divisionId: user.divisionId,
    divisionSlug: user.division?.slug ?? null,
    orgRole: (user.orgRole ?? null) as OrgRole | null,
    isOwner: user.orgRole === 'owner',
    isManager: user.orgRole === 'manager' || user.orgRole === 'owner',
  };
}

export async function getOrgBySlug(slug: string) {
  return prisma.organization.findUnique({ where: { slug } });
}

export async function getDivisionLedBy(userId: string) {
  return prisma.orgDivision.findFirst({
    where: { leadUserId: userId },
    include: { org: true },
  });
}
