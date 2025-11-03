import crypto from 'crypto';

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(value: string): Buffer {
  const padLength = (4 - (value.length % 4)) % 4;
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  return Buffer.from(base64, 'base64');
}

export function createSignedToken<T extends Record<string, unknown>>(
  payload: T,
  secret: string,
): string {
  if (!secret) {
    throw new Error('Missing signing secret for payment link token creation');
  }

  const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
  const encodedPayload = base64UrlEncode(payloadBuffer);
  const signatureBuffer = crypto.createHmac('sha256', secret).update(encodedPayload).digest();
  const encodedSignature = base64UrlEncode(signatureBuffer);

  return `${encodedPayload}.${encodedSignature}`;
}

export function verifySignedToken<T>(token: string, secret: string): T {
  if (!secret) {
    throw new Error('Missing signing secret for payment link token verification');
  }

  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) {
    throw new Error('Invalid token format');
  }

  const expectedSignatureBuffer = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest();
  const providedSignatureBuffer = base64UrlDecode(providedSignature);

  if (expectedSignatureBuffer.length !== providedSignatureBuffer.length) {
    throw new Error('Invalid token signature');
  }

  if (!crypto.timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)) {
    throw new Error('Token signature mismatch');
  }

  const payloadBuffer = base64UrlDecode(encodedPayload);

  return JSON.parse(payloadBuffer.toString('utf8')) as T;
}
