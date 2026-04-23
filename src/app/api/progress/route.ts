import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { recordProgress } from '@/lib/access';

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

  // Invalidate the pages that show progress so the user sees their update immediately.
  // Certificates are earned via /courses/[id]/cert-quiz — not auto-issued here.
  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/account');

  return NextResponse.json({ ok: true });
}
