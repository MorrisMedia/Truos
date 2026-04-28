import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const membership = await prisma.orgMembership.findUnique({
    where: { inviteToken: token },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
  }

  if (membership.joinedAt) {
    // Already joined — idempotent OK
    return NextResponse.json({ ok: true, message: 'already_joined' });
  }

  await prisma.orgMembership.update({
    where: { id: membership.id },
    data: {
      userId: session.user.id,
      joinedAt: new Date(),
      inviteToken: null, // consume token
    },
  });

  return NextResponse.json({ ok: true, message: 'joined' });
}
