// Resend wrapper. Single entry point for all transactional + broadcast mail.
import { Resend } from 'resend';
import { prisma } from './prisma';
import type { EmailPayload } from './emails/templates';

const API_KEY = process.env.RESEND_API_KEY ?? '';
const FROM = process.env.EMAIL_FROM ?? 'Truos <hello@truos.ai>';
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? undefined;

const resend: Resend | null = API_KEY ? new Resend(API_KEY) : null;

export interface SendArgs {
  to: string;
  userId?: string | null;
  kind: 'welcome' | 'access_granted' | 'cert_earned' | 'broadcast' | 'code_redeemed';
  payload: EmailPayload;
}

export interface SendResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

/**
 * Send one email. Respects emailSubscribed when userId is provided
 * (transactional kinds like welcome/cert/access_granted still send; broadcast
 * is the only kind that checks the flag — transactional is essential).
 */
export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const { to, userId, kind, payload } = args;

  // Broadcasts only — honor unsubscribe
  if (kind === 'broadcast' && userId) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { emailSubscribed: true } });
    if (u && !u.emailSubscribed) {
      return { ok: false, error: 'unsubscribed' };
    }
  }

  if (!resend) {
    // Not configured — log but don't blow up the caller.
    await safeLog({ userId, to, kind, subject: payload.subject, status: 'failed', error: 'RESEND_API_KEY_not_set' });
    console.warn('[email] RESEND_API_KEY not set — skipped send', { to, kind });
    return { ok: false, error: 'not_configured' };
  }

  try {
    const res = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: REPLY_TO,
    });
    const providerId = (res as any)?.data?.id ?? (res as any)?.id;
    if ((res as any)?.error) {
      const err = (res as any).error;
      await safeLog({ userId, to, kind, subject: payload.subject, status: 'failed', error: JSON.stringify(err).slice(0, 500) });
      return { ok: false, error: err.message ?? 'resend_error' };
    }
    await safeLog({ userId, to, kind, subject: payload.subject, status: 'sent', providerId });
    return { ok: true, providerId };
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    await safeLog({ userId, to, kind, subject: payload.subject, status: 'failed', error: msg.slice(0, 500) });
    console.error('[email] send failed', { to, kind, error: msg });
    return { ok: false, error: msg };
  }
}

async function safeLog(args: {
  userId?: string | null;
  to: string;
  kind: string;
  subject: string;
  status: 'sent' | 'failed';
  providerId?: string;
  error?: string;
}) {
  try {
    await prisma.emailLog.create({
      data: {
        userId: args.userId ?? null,
        toEmail: args.to,
        subject: args.subject.slice(0, 500),
        kind: args.kind,
        providerId: args.providerId ?? null,
        status: args.status,
        error: args.error ?? null,
      },
    });
  } catch (err) {
    console.warn('[email] log insert failed', err);
  }
}

export function isEmailConfigured(): boolean {
  return !!API_KEY;
}

export function emailFromLine(): string {
  return FROM;
}
