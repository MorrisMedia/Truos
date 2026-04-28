import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type HlmContext = {
  user: { id: string; email: string; name: string | null };
  membership: {
    id: string;
    userId: string | null;
    orgId: string;
    departmentId: string | null;
    orgRole: string;
    inviteEmail: string | null;
    inviteToken: string | null;
    invitedAt: Date;
    joinedAt: Date | null;
    dept: { id: string; name: string; managerId: string | null } | null;
    org: { id: string; name: string; stripeCustomerId: string | null; createdAt: Date; updatedAt: Date };
  };
  org: { id: string; name: string; stripeCustomerId: string | null; createdAt: Date; updatedAt: Date };
};

export async function requireHlmRole(
  requiredRole?: 'org_admin' | 'org_manager',
): Promise<HlmContext> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/hlm');
  }

  const membership = await prisma.orgMembership.findFirst({
    where: {
      userId: session.user.id,
      org: { name: 'HomeLife Media' },
    },
    include: { org: true, dept: true },
  });

  if (!membership) {
    redirect('/hlm/not-member');
  }

  if (!membership.joinedAt) {
    redirect('/hlm/pending');
  }

  if (requiredRole === 'org_admin' && membership.orgRole !== 'org_admin') {
    redirect('/hlm');
  }
  if (
    requiredRole === 'org_manager' &&
    !['org_admin', 'org_manager'].includes(membership.orgRole)
  ) {
    redirect('/hlm');
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
    },
    membership: membership as HlmContext['membership'],
    org: membership.org as HlmContext['org'],
  };
}
