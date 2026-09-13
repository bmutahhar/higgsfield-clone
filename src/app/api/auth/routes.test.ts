import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_USER } from "@/config/auth";
import { resetStore } from "@/server/auth/store.server";
import type { AuthErrorBody, AuthSuccessBody } from "@/types/auth.types";

vi.mock("server-only", () => ({}));

/*
 * Route handlers reach for next/headers, which needs a request context this
 * runner does not have. One fake cookie jar stands in for it — and doubles as
 * the assertion that a route actually opened or cleared a session.
 */
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) =>
        jar.has(name) ? { name, value: jar.get(name) } : undefined,
      set: (name: string, value: string) => {
        jar.set(name, value);
      },
      delete: (name: string) => {
        jar.delete(name);
      },
    }),
}));

const { POST: signup } = await import("@/app/api/auth/signup/route");
const { POST: login } = await import("@/app/api/auth/login/route");
const { POST: oauth } = await import("@/app/api/auth/oauth/route");
const { POST: logout } = await import("@/app/api/auth/logout/route");
const { GET: me } = await import("@/app/api/auth/me/route");
const { POST: reset } = await import("@/app/api/auth/reset/route");

const post = (body: unknown) =>
  new Request("http://localhost/api/auth", {
    method: "POST",
    body: JSON.stringify(body),
  });

beforeEach(() => {
  jar.clear();
  resetStore();
});

describe("POST /api/auth/signup", () => {
  it("creates an account, opens a session and returns the user", async () => {
    const response = await signup(
      post({ email: "new@example.com", password: "password1" }),
    );
    expect(response.status).toBe(201);
    const { user } = (await response.json()) as AuthSuccessBody;
    expect(user.email).toBe("new@example.com");
    expect(user).not.toHaveProperty("password");
    expect(jar.has("hf_session")).toBe(true);
  });

  it("rejects a malformed email without opening a session", async () => {
    const response = await signup(
      post({ email: "nope", password: "password1" }),
    );
    expect(response.status).toBe(400);
    expect(((await response.json()) as AuthErrorBody).field).toBe("email");
    expect(jar.has("hf_session")).toBe(false);
  });

  it("rejects a short password", async () => {
    const response = await signup(post({ email: "a@b.co", password: "short" }));
    expect(response.status).toBe(400);
    expect(((await response.json()) as AuthErrorBody).field).toBe("password");
  });

  it("conflicts on an address already registered", async () => {
    const response = await signup(
      post({ email: MOCK_USER.email, password: "password1" }),
    );
    expect(response.status).toBe(409);
    expect(((await response.json()) as AuthErrorBody).error).toBe(
      "That email is already registered.",
    );
  });
});

describe("POST /api/auth/login", () => {
  it("signs the seeded user in", async () => {
    const response = await login(
      post({ email: MOCK_USER.email, password: MOCK_USER.password }),
    );
    expect(response.status).toBe(200);
    expect(jar.has("hf_session")).toBe(true);
  });

  it("gives the same message for a wrong password and an unknown address", async () => {
    const wrong = await login(
      post({ email: MOCK_USER.email, password: "nope" }),
    );
    const missing = await login(
      post({ email: "ghost@example.com", password: "nope" }),
    );
    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(((await wrong.json()) as AuthErrorBody).error).toBe(
      "Wrong email or password.",
    );
    expect(((await missing.json()) as AuthErrorBody).error).toBe(
      "Wrong email or password.",
    );
  });
});

describe("POST /api/auth/oauth", () => {
  it("signs in on one click", async () => {
    const response = await oauth(post({ provider: "google" }));
    expect(response.status).toBe(200);
    const { user } = (await response.json()) as AuthSuccessBody;
    expect(user.provider).toBe("google");
    expect(jar.has("hf_session")).toBe(true);
  });

  it("rejects an unknown provider", async () => {
    expect((await oauth(post({ provider: "myspace" }))).status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("is 401 with no session", async () => {
    expect((await me()).status).toBe(401);
  });

  it("returns the signed-in user", async () => {
    await oauth(post({ provider: "apple" }));
    const response = await me();
    expect(response.status).toBe(200);
    expect(((await response.json()) as AuthSuccessBody).user.provider).toBe(
      "apple",
    );
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session", async () => {
    await oauth(post({ provider: "google" }));
    expect((await logout()).status).toBe(204);
    expect(jar.has("hf_session")).toBe(false);
    expect((await me()).status).toBe(401);
  });
});

describe("POST /api/auth/reset", () => {
  it("answers identically for a known and an unknown address", async () => {
    const known = await reset(post({ email: MOCK_USER.email }));
    const unknown = await reset(post({ email: "ghost@example.com" }));
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(await known.json()).toEqual(await unknown.json());
  });

  it("still rejects a malformed address", async () => {
    expect((await reset(post({ email: "nope" }))).status).toBe(400);
  });
});
