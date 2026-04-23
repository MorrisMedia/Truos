// Super-admin allowlist (Truos staff emails)
export const STAFF_EMAILS = (process.env.TRUOS_SUPERADMINS ?? 'marshall@homelifemedia.com,morris8507@gmail.com')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export function isStaffEmail(email?: string | null): boolean {
  if (!email) return false;
  return STAFF_EMAILS.includes(email.toLowerCase());
}

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://truos.ai';

export const CERT_HASH_SECRET = process.env.CERT_HASH_SECRET ?? 'truos-dev-secret-change-me';
