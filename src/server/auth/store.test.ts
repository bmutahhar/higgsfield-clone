import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_USER, NEW_ACCOUNT_CREDITS } from "@/config/auth";
import {
  createEmailUser,
  findByEmail,
  findById,
  findOrCreateOAuthUser,
  resetStore,
  verifyCredentials,
} from "@/server/auth/store.server";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  resetStore();
});

describe("seed", () => {
  it("always holds the mock user", () => {
    const user = findByEmail(MOCK_USER.email);
    expect(user?.name).toBe(MOCK_USER.name);
    expect(user?.credits).toBe(MOCK_USER.credits);
  });

  it("authenticates the mock user", () => {
    expect(
      verifyCredentials(MOCK_USER.email, MOCK_USER.password),
    ).not.toBeNull();
  });
});

describe("createEmailUser", () => {
  it("creates an account any valid email can use", () => {
    const user = createEmailUser("Ada.Lovelace@Example.com", "password1");
    expect(user.email).toBe("ada.lovelace@example.com");
    expect(user.name).toBe("Ada Lovelace");
    expect(user.provider).toBe("email");
    expect(user.credits).toBe(NEW_ACCOUNT_CREDITS);
  });

  it("makes the new account immediately loggable in, whatever the casing", () => {
    createEmailUser("new@example.com", "password1");
    expect(verifyCredentials("new@example.com", "password1")).not.toBeNull();
    expect(verifyCredentials("NEW@example.com", "password1")).not.toBeNull();
  });

  it("never leaks the password onto the public user", () => {
    const user = createEmailUser("leak@example.com", "password1");
    expect(user).not.toHaveProperty("password");
  });

  it("throws when the address is taken", () => {
    createEmailUser("dupe@example.com", "password1");
    expect(() => createEmailUser("dupe@example.com", "password2")).toThrow(
      "already registered",
    );
  });
});

describe("verifyCredentials", () => {
  it("rejects a wrong password and an unknown address alike", () => {
    expect(verifyCredentials(MOCK_USER.email, "wrong")).toBeNull();
    expect(verifyCredentials("nobody@example.com", "password1")).toBeNull();
  });

  it("will not let a blank password match an OAuth identity", () => {
    const oauth = findOrCreateOAuthUser("google");
    expect(verifyCredentials(oauth.email, "")).toBeNull();
  });
});

describe("findOrCreateOAuthUser", () => {
  it("returns the same identity for repeat sign-ins", () => {
    const first = findOrCreateOAuthUser("google");
    const second = findOrCreateOAuthUser("google");
    expect(second.id).toBe(first.id);
    expect(first.provider).toBe("google");
  });

  it("keeps providers distinct", () => {
    expect(findOrCreateOAuthUser("google").email).not.toBe(
      findOrCreateOAuthUser("apple").email,
    );
  });
});

describe("findById", () => {
  it("round-trips a created user", () => {
    const created = createEmailUser("round@example.com", "password1");
    expect(findById(created.id)?.email).toBe("round@example.com");
  });

  it("returns null for an unknown id", () => {
    expect(findById("user_nope")).toBeNull();
  });
});
