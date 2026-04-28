// Plain HTML email templates. Dark-on-light (email-friendly). Inline styles only.
import { findCourse } from '@/content/courses';
import { APP_URL } from '../config';
import { unsubscribeToken } from '../unsubscribe';

export interface EmailPayload {
  subject: string;
  html: string;
  text: string;
}

const BRAND = {
  bg: '#0B0C0E',
  panel: '#FFFFFF',
  text: '#0B0C0E',
  muted: '#555B66',
  accent: '#5A7F00',       // darker lime for light-bg legibility
  accentBadge: '#D4F547',  // original lime for accent blocks
  border: '#E5E7EB',
};

function layout(preheader: string, body: string, userId?: string): string {
  const unsubLink = userId
    ? `${APP_URL}/unsubscribe/${userId}-${unsubscribeToken(userId)}`
    : null;

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Truos</title></head>
  <body style="margin:0;padding:0;background:#F4F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F5F7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${BRAND.panel};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND.bg};padding:20px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color:#FFF;font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                      <span style="display:inline-block;width:28px;height:28px;background:${BRAND.accentBadge};color:${BRAND.bg};border-radius:6px;text-align:center;line-height:28px;font-weight:700;margin-right:10px;vertical-align:middle;">T</span>
                      Truos
                    </td>
                    <td align="right" style="font-size:11px;color:#8D94A0;letter-spacing:0.06em;text-transform:uppercase;">AI Training</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 16px;">${body}</td>
            </tr>
            <tr>
              <td style="padding:24px 32px 28px;border-top:1px solid ${BRAND.border};color:${BRAND.muted};font-size:12px;line-height:1.5;">
                Truos · AI training for commercial teams<br>
                <a href="${APP_URL}" style="color:${BRAND.muted};">truos.ai</a>
                ${unsubLink ? ` · <a href="${unsubLink}" style="color:${BRAND.muted};">Unsubscribe</a>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;"><tr><td style="background:${BRAND.bg};border-radius:8px;"><a href="${href}" style="display:inline-block;padding:12px 22px;color:${BRAND.accentBadge};text-decoration:none;font-weight:600;font-size:14px;letter-spacing:-0.01em;">${label} &rarr;</a></td></tr></table>`;
}

function h1(text: string): string {
  return `<h1 style="font-size:26px;line-height:1.25;letter-spacing:-0.02em;margin:0 0 16px;color:${BRAND.text};">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="font-size:15px;line-height:1.6;color:${BRAND.text};margin:0 0 14px;">${text}</p>`;
}

function muted(text: string): string {
  return `<p style="font-size:13px;line-height:1.55;color:${BRAND.muted};margin:0 0 10px;">${text}</p>`;
}

// ---- Templates ----

export function welcomeEmail({ name, userId }: { name: string | null; userId: string }): EmailPayload {
  const greeting = name ? `Hey ${escapeHtml(name)},` : 'Hey,';
  const body = `
    ${h1('Welcome to Truos.')}
    ${p(`${greeting} glad you're here. Your account is live and <strong>AI·101</strong> is unlocked — 20 lessons, ~2.5 hours, free forever.`)}
    ${p("It's written for humans. No jargon, no math, no coding. Read → engage → quiz, one lesson at a time.")}
    ${btn(`${APP_URL}/dashboard`, 'Start learning')}
    ${muted('Questions? Just reply to this email.')}
  `;
  return {
    subject: 'Welcome to Truos — AI·101 is unlocked',
    html: layout("Your account's live. AI·101 is waiting.", body, userId),
    text: `${greeting}\n\nWelcome to Truos. AI·101 is unlocked — 20 lessons, ~2.5h, free forever.\n\nStart: ${APP_URL}/dashboard\n\n— Truos`,
  };
}

export function accessGrantedEmail({ name, userId, courseId, note }: { name: string | null; userId: string; courseId: number; note?: string }): EmailPayload {
  const course = findCourse(courseId);
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';
  const body = `
    ${h1('You just got access.')}
    ${p(`${greeting} the Truos team has granted you access to:`)}
    <div style="background:#F4F5F7;border:1px solid ${BRAND.border};border-radius:8px;padding:18px 20px;margin:18px 0;">
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:${BRAND.accent};letter-spacing:0.08em;">${escapeHtml(course?.code ?? `#${courseId}`)}</div>
      <div style="font-size:20px;font-weight:600;letter-spacing:-0.01em;margin-top:4px;">${escapeHtml(course?.title ?? 'Course')}</div>
      <div style="color:${BRAND.muted};font-size:13px;margin-top:6px;">${escapeHtml(course?.subtitle ?? '')}</div>
    </div>
    ${note ? muted(`Note from the team: ${escapeHtml(note)}`) : ''}
    ${btn(`${APP_URL}/courses/${courseId}`, 'Open the course')}
  `;
  return {
    subject: `Access granted: ${course?.code ?? 'course'} — ${course?.title ?? ''}`.trim(),
    html: layout(`You now have access to ${course?.title ?? 'a new course'}.`, body, userId),
    text: `${greeting}\n\nYou've been granted access to ${course?.code ?? '?'} — ${course?.title ?? ''}.\n\nOpen: ${APP_URL}/courses/${courseId}\n\n— Truos`,
  };
}

export function certEarnedEmail({ name, userId, courseId, verificationHash }: { name: string | null; userId: string; courseId: number; verificationHash: string }): EmailPayload {
  const course = findCourse(courseId);
  const greeting = name ? `Congrats ${escapeHtml(name)}!` : 'Congrats!';
  const body = `
    ${h1('Certificate earned.')}
    ${p(`${greeting} You passed the ${escapeHtml(course?.code ?? '')} certification.`)}
    <div style="background:#F4F5F7;border:1px solid ${BRAND.border};border-radius:8px;padding:20px 22px;margin:18px 0;text-align:center;">
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:${BRAND.muted};letter-spacing:0.12em;">CERT · ${escapeHtml(verificationHash)}</div>
      <div style="font-size:22px;font-weight:600;letter-spacing:-0.01em;margin-top:6px;">${escapeHtml(course?.title ?? '')}</div>
    </div>
    ${p('Your certificate lives in your account. Share the verification link on LinkedIn, in your bio, or wherever people check credentials.')}
    ${btn(`${APP_URL}/certificates/${courseId}`, 'View certificate')}
    ${muted(`Public verify link: <a href="${APP_URL}/verify/${verificationHash}" style="color:${BRAND.muted};">${APP_URL}/verify/${verificationHash}</a>`)}
  `;
  return {
    subject: `You earned your ${course?.code ?? 'Truos'} certificate`,
    html: layout(`You passed. Your ${course?.code ?? ''} cert is ready.`, body, userId),
    text: `${greeting}\n\nYou passed ${course?.code ?? ''} — ${course?.title ?? ''}.\nCertificate: ${APP_URL}/certificates/${courseId}\nVerify: ${APP_URL}/verify/${verificationHash}\n\n— Truos`,
  };
}

export function codeRedeemedEmail({ name, userId, code, courseIds }: { name: string | null; userId: string; code: string; courseIds: number[] }): EmailPayload {
  const courses = courseIds.map(id => findCourse(id)).filter(Boolean);
  const greeting = name ? `Hey ${escapeHtml(name)},` : 'Hey,';
  const list = courses.length > 0
    ? `<ul style="padding-left:20px;margin:12px 0;color:${BRAND.text};font-size:14px;line-height:1.7;">${courses.map(c => `<li><strong>${escapeHtml(c!.code)}</strong> — ${escapeHtml(c!.title)}</li>`).join('')}</ul>`
    : '';
  const body = `
    ${h1('Code redeemed.')}
    ${p(`${greeting} your comp code <strong style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(code)}</strong> unlocked:`)}
    ${list}
    ${btn(`${APP_URL}/dashboard`, 'Go to dashboard')}
  `;
  return {
    subject: `Code redeemed: ${code}`,
    html: layout(`Your code unlocked ${courses.length} course${courses.length === 1 ? '' : 's'}.`, body, userId),
    text: `${greeting}\n\nCode ${code} redeemed. Courses unlocked: ${courses.map(c => c!.code).join(', ')}.\nDashboard: ${APP_URL}/dashboard\n\n— Truos`,
  };
}

export function broadcastEmail({ name, userId, subject, headline, body: bodyText, ctaLabel, ctaUrl }: {
  name: string | null;
  userId: string;
  subject: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): EmailPayload {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';
  const paragraphs = bodyText
    .split(/\n\n+/)
    .map(para => p(escapeHtml(para).replace(/\n/g, '<br>')))
    .join('');
  const body = `
    ${h1(escapeHtml(headline))}
    ${p(greeting)}
    ${paragraphs}
    ${ctaLabel && ctaUrl ? btn(ctaUrl, ctaLabel) : ''}
  `;
  return {
    subject,
    html: layout(headline, body, userId),
    text: `${greeting}\n\n${bodyText}\n${ctaUrl ? `\n${ctaLabel ?? 'Open'}: ${ctaUrl}\n` : ''}\n— Truos`,
  };
}

// ---- Org templates ----

export function orgInviteEmail({ name, orgName, inviteUrl }: {
  name?: string | null;
  orgName: string;
  inviteUrl: string;
}): EmailPayload {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';
  const body = `
    ${h1(`You've been invited to ${escapeHtml(orgName)}'s AI training.`)}
    ${p(`${greeting} ${escapeHtml(orgName)} has set up an AI fluency program on Truos — and you've been invited to join.`)}
    ${p('Complete four credentials and become the person your team calls when AI comes up. Most people earn their first cert in under 90 minutes.')}
    ${btn(inviteUrl, 'Accept invitation')}
    ${muted(`Link not working? Copy and paste this into your browser:<br>${escapeHtml(inviteUrl)}`)}
  `;
  return {
    subject: `You've been invited to ${orgName}'s AI training program`,
    html: layout(`${orgName} invited you to AI training on Truos.`, body),
    text: `${greeting}\n\n${orgName} has invited you to join their AI training program on Truos.\n\nAccept your invitation here: ${inviteUrl}\n\n— Truos`,
  };
}

export function orgNudgeEmail({ recipientName, managerName, orgName, courseTitle, resumeUrl }: {
  recipientName?: string | null;
  managerName: string;
  orgName: string;
  courseTitle: string;
  resumeUrl: string;
}): EmailPayload {
  const greeting = recipientName ? `Hi ${escapeHtml(recipientName)},` : 'Hi,';
  const body = `
    ${h1(`${escapeHtml(managerName)} wants you to keep going.`)}
    ${p(`${greeting} ${escapeHtml(managerName)} at ${escapeHtml(orgName)} sent you a reminder about <strong>${escapeHtml(courseTitle)}</strong>.`)}
    ${p("It won't take long — most people finish a module in under 20 minutes. Jump back in when you have a moment.")}
    ${btn(resumeUrl, 'Continue learning')}
  `;
  return {
    subject: `${managerName} wants you to keep going in ${courseTitle}`,
    html: layout(`${managerName} sent you a nudge about ${courseTitle}.`, body),
    text: `${greeting}\n\n${managerName} sent you a reminder about ${courseTitle}.\n\nContinue: ${resumeUrl}\n\n— Truos`,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
