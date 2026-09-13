import { createHmac } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { signToken, verifyToken } from "@/server/auth/session.server";

// `server-only` throws outside a React Server Component graph, which includes
// this runner. The module under test is still plain Node.
vi.mock("server-only", () => ({}));

const encode = (payload: object) =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

describe("session token", () => {
  it("round-trips the user id", () => {
    expect(verifyToken(signToken("user_123"))).toBe("user_123");
  });

  it("rejects a tampered payload", () => {
    const signature = signToken("user_123").split(".")[1] ?? "";
    const forged = `${encode({ sub: "user_evil", iat: 0, exp: 2 ** 40 })}.${signature}`;
    expect(verifyToken(forged)).toBeNull();
  });

  it.each(["", "nodot", "a.b.c", "!!!.???"])("rejects malformed %s", (bad) => {
    expect(verifyToken(bad)).toBeNull();
  });

  it("rejects an expired token even when the signature is honest", () => {
    const payload = encode({ sub: "user_123", iat: 0, exp: 1 });
    const secret = process.env.AUTH_SECRET ?? "dev-only-secret";
    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");
    expect(verifyToken(`${payload}.${signature}`)).toBeNull();
  });
});
