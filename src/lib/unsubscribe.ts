import crypto from 'crypto';

const SECRET = process.env.UNSUBSCRIBE_SECRET ?? process.env.CERT_HASH_SECRET ?? 'truos-unsub-dev-secret';

// Deterministic HMAC token so we never need to persist/look up a random token.
export function unsubscribeToken(userId: string): string {
  return crypto.createHmac('sha256', SECRET).update(userId).digest('hex').slice(0, 32);
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = unsubscribeToken(userId);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}
