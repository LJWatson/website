import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

// 256 bits from a cryptographically secure source
export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function randomCode() {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

export function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  return left.length === right.length && timingSafeEqual(left, right);
}

// The code is hashed with the pending log-in cookie, so it's tied to one browser
export function hashCode(code, pendingCookie) {
  return sha256(`code:${code}:${pendingCookie}`);
}

// Derived from the session token, so only someone holding the cookie can work it out
export function csrfTokenFor(sessionToken) {
  return sha256(`csrf:${sessionToken}`);
}

export const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
