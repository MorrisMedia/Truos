import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { orgNudgeEmail } from '@/lib/emails/templates';
import { APP_URL } from '@/lib/config';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    memberIds?: string[];
    template?: string;
    managerName?: string;
    orgName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { memberIds, template, managerName, orgName } = body;
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return NextResponse.json({ error: 'Missing memberIds' }, { status: 400 });
  }

  const resolvedManagerName = managerName ?? session.user.name ?? session.user.email;
  const resolvedOrgName = orgName ?? 'HomeLife Media';

  // Fetch memberships
  const memberships = await prisma.orgMembership.findMany({
    where: { id: { in: memberIds } },
    include: { user: true },
  });

  let sent = 0;
  for (const m of memberships) {
    const email = m.user?.email ?? m.inviteEmail;
    if (!email) continue;

    const name = m.user?.name ?? null;

    await sendEmail({
      to: email,
      userId: m.userId ?? undefined,
      kind: 'org_nudge',
      payload: orgNudgeEmail({
        recipientName: name,
        managerName: resolvedManagerName,
        orgName: resolvedOrgName,
        courseTitle: 'AI Foundations',
        resumeUrl: `${APP_URL}/hlm/learn`,
      }),
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
