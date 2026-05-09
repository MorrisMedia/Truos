import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { buildTruSystemPrompt } from '@/lib/tru/system-prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;

const Message = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(20000),
});

const Body = z.object({
  messages: z.array(Message).min(1).max(120),
  sessionId: z.string().min(1).max(64).optional(),
  meta: z
    .object({
      name: z.string().max(80).optional(),
      sender: z.string().max(80).optional(),
      role: z.string().max(160).optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'tru_not_configured' }, { status: 503 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const { messages, meta, sessionId } = parsed.data;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null;

  // Resolve / create the session row up-front so we can return its id immediately.
  let session = sessionId
    ? await prisma.truSession.findUnique({ where: { id: sessionId } })
    : null;

  if (!session) {
    session = await prisma.truSession.create({
      data: {
        name: meta?.name ?? null,
        sender: meta?.sender ?? null,
        learnerRole: meta?.role ?? null,
        messages: messages,
        msgCount: messages.length,
        ipFirst: ip,
      },
    });
    console.log(
      JSON.stringify({
        evt: 'tru.session.created',
        id: session.id,
        name: meta?.name ?? null,
        sender: meta?.sender ?? null,
        role: meta?.role ?? null,
        ip,
        t: new Date().toISOString(),
      }),
    );
  } else if (meta?.name || meta?.sender || meta?.role) {
    // First reply usually carries name/sender/role — backfill if a session was
    // created without them (shouldn't happen, but harmless).
    session = await prisma.truSession.update({
      where: { id: session.id },
      data: {
        name: session.name ?? meta?.name ?? null,
        sender: session.sender ?? meta?.sender ?? null,
        learnerRole: session.learnerRole ?? meta?.role ?? null,
      },
    });
  }

  const sid = session.id;

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let assistantText = '';
      try {
        const res = await client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: buildTruSystemPrompt(),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const evt of res) {
          if (
            evt.type === 'content_block_delta' &&
            evt.delta.type === 'text_delta'
          ) {
            assistantText += evt.delta.text;
            controller.enqueue(encoder.encode(evt.delta.text));
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'unknown_error';
        controller.enqueue(
          encoder.encode(
            `\n\n[TRU hit an error: ${msg}. Try sending your message again.]`,
          ),
        );
      } finally {
        // Persist the full transcript including TRU's reply.
        const finalMessages = [
          ...messages,
          ...(assistantText ? [{ role: 'assistant', content: assistantText }] : []),
        ];
        try {
          await prisma.truSession.update({
            where: { id: sid },
            data: {
              messages: finalMessages,
              msgCount: finalMessages.length,
            },
          });
        } catch {
          // swallow — DB hiccup shouldn't break the user experience
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
      'X-Tru-Session-Id': sid,
      'Access-Control-Expose-Headers': 'X-Tru-Session-Id',
    },
  });
}
