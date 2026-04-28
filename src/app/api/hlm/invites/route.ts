import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { orgInviteEmail } from '@/lib/emails/templates';
import { APP_URL } from '@/lib/config';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { orgId?: string; emails?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, emails } = body;
  if (!orgId || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: 'Missing orgId or emails' }, { status: 400 });
  }

  // Verify caller is org_admin for this org
  const callerMembership = await prisma.orgMembership.findFirst({
    where: { userId: session.user.id, orgId },
  });
  if (!callerMembership || callerMembership.orgRole !== 'org_admin') {
    return NextResponse.json({ error: 'Forbidden — org_admin required' }, { status: 403 });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return NextResponse.json({ error: 'Org not found' }, { status: 404 });
  }

  let sent = 0;
  let skipped = 0;
  const results: { email: string; ok: boolean; reason?: string }[] = [];

  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (!email.includes('@') || !email.includes('.')) {
      results.push({ email: raw, ok: false, reason: 'invalid_email' });
      continue;
    }

    // Check if already invited
    const existing = await prisma.orgMembership.findFirst({
      where: { orgId, inviteEmail: email },
    });
    if (existing) {
      results.push({ email, ok: false, reason: 'already_invited' });
      skipped++;
      continue;
    }

    // Create membership row
    const token = randomUUID();
    await prisma.orgMembership.create({
      data: {
        orgId,
        inviteEmail: email,
        inviteToken: token,
        orgRole: 'member',
      },
    });

    // Send invite email
    const inviteUrl = `${APP_URL}/hlm/join?token=${token}`;
    const result = await sendEmail({
      to: email,
      kind: 'org_invite',
      payload: orgInviteEmail({ orgName: org.name, inviteUrl }),
    });

    if (result.ok) {
      sent++;
      results.push({ email, ok: true });
    } else {
      results.push({ email, ok: false, reason: result.error });
    }
  }

  return NextResponse.json({ sent, skipped, total: emails.length, results });
}
