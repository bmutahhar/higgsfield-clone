import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AuthRequestError,
  fetchMe,
  loginWithEmail,
  oauthSignIn,
  signupWithEmail,
} from "@/services/auth-client";
import type { User } from "@/types/auth.types";

const user: User = {
  id: "user_1",
  email: "demo@higgsfield.ai",
  name: "Demo Creator",
  provider: "email",
  credits: 250,
  createdAt: "2026-09-13T00:00:00.000Z",
};

const respond = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("signupWithEmail", () => {
  it("posts the credentials and returns the user", async () => {
    const fetchMock = respond({ user }, 201);
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      signupWithEmail("demo@higgsfield.ai", "demo1234"),
    ).resolves.toEqual(user);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/signup");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "demo@higgsfield.ai",
      password: "demo1234",
    });
  });

  it("throws the server's copy", async () => {
    vi.stubGlobal(
      "fetch",
      respond(
        { error: "That email is already registered.", field: "email" },
        409,
      ),
    );

    await expect(
      signupWithEmail("demo@higgsfield.ai", "demo1234"),
    ).rejects.toThrow("That email is already registered.");
  });

  it("tags the thrown error with the field so the form can point at it", async () => {
    vi.stubGlobal("fetch", respond({ error: "nope", field: "password" }, 400));

    await expect(signupWithEmail("a@b.co", "x")).rejects.toMatchObject({
      field: "password",
    });
  });

  it("still throws something readable when the body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("<html>502</html>", { status: 502 })),
    );

    await expect(signupWithEmail("a@b.co", "password1")).rejects.toThrow(
      "Something went wrong. Try again.",
    );
  });
});

describe("loginWithEmail", () => {
  it("throws an AuthRequestError on 401", async () => {
    vi.stubGlobal("fetch", respond({ error: "Wrong email or password." }, 401));
    await expect(loginWithEmail("a@b.co", "nope")).rejects.toBeInstanceOf(
      AuthRequestError,
    );
  });
});

describe("oauthSignIn", () => {
  it("posts the provider", async () => {
    const fetchMock = respond({ user });
    vi.stubGlobal("fetch", fetchMock);

    await oauthSignIn("google");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/oauth");
    expect(JSON.parse(init.body as string)).toEqual({ provider: "google" });
  });
});

describe("fetchMe", () => {
  it("resolves null on 401 rather than throwing", async () => {
    vi.stubGlobal("fetch", respond({ user: null }, 401));
    await expect(fetchMe()).resolves.toBeNull();
  });

  it("resolves the user on 200", async () => {
    vi.stubGlobal("fetch", respond({ user }));
    await expect(fetchMe()).resolves.toEqual(user);
  });
});
