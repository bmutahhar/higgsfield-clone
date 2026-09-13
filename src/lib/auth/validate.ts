/*
 * Shared by the client and the route handlers. The client checks first to save
 * a round trip; the server checks again because a client check is not a
 * control.
 */

// Pragmatic, not RFC 5322: a local part, an @, a dotted domain, no whitespace.
// Per the spec, any address of that shape is allowed to sign up.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

export function passwordIssue(value: string): string | null {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
