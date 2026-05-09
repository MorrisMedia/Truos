import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildTruSystemPrompt } from '@/lib/tru/system-prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;

const Message = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(20000),
});

const Body = z.object({
  messages: z.array(Message).min(1).max(120),
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
  const { messages, meta } = parsed.data;

  if (meta?.name || meta?.sender || meta?.role) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    console.log(
      JSON.stringify({
        evt: 'tru.session',
        name: meta?.name ?? null,
        sender: meta?.sender ?? null,
        role: meta?.role ?? null,
        ip,
        msgs: messages.length,
        t: new Date().toISOString(),
      }),
    );
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
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
            controller.enqueue(encoder.encode(evt.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'unknown_error';
        controller.enqueue(
          encoder.encode(
            `\n\n[TRU hit an error: ${msg}. Try sending your message again.]`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
