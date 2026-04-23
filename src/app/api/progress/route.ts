import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { recordProgress } from '@/lib/access';
import { maybeIssueCertificate } from '@/lib/certificate';

const Body = z.object({
  courseId: z.number().int(),
  moduleIdx: z.number().int().min(0),
  lessonIdx: z.number().int().min(0),
  score: z.number().int().min(0).max(100),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request', issues: parsed.error.flatten() }, { status: 400 });

  const { courseId, moduleIdx, lessonIdx, score } = parsed.data;
  await recordProgress(session.user.id, courseId, moduleIdx, lessonIdx, score);
  const cert = await maybeIssueCertificate(session.user.id, courseId);

  return NextResponse.json({ ok: true, certIssued: !!cert });
}
