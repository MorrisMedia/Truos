import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface SessionRouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: SessionRouteContext) {
  const id = params.id?.slice(0, 64);
  if (!id) return NextResponse.json({ error: 'bad_id' }, { status: 400 });

  const session = await prisma.truSession.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sender: true,
      learnerRole: true,
      messages: true,
      msgCount: true,
      startedAt: true,
      lastSeenAt: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(session, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
