import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/config/auth";

/*
 * An opaque, signed token rather than a bare user id: a cookie the browser can
 * edit is not a session. This is demo-grade — no key rotation, no revocation
 * list — but the signature check is the part that would be embarrassing to
 * omit, and it costs four lines.
 */
const SECRET = process.env.AUTH_SECRET ?? "dev-only-secret";

interface Payload {
  sub: string;
  iat: number;
  exp: number;
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function signToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    sub: userId,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  // timingSafeEqual throws on a length mismatch, so guard before comparing.
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Payload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    // Checked here rather than trusted from the cookie's maxAge, which the
    // browser controls.
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function readSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}
