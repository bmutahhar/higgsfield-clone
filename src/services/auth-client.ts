import type { AuthErrorBody, Provider, User } from "@/types/auth.types";

/*
 * All network access for auth lives here, per the repo's layering: lib/ stays
 * pure, services/ does the I/O.
 *
 * Every failure arrives as one error type carrying copy that is already
 * user-facing, so a form can render err.message directly and point at
 * err.field without translating status codes.
 */
export class AuthRequestError extends Error {
  readonly field?: "email" | "password";

  constructor(message: string, field?: "email" | "password") {
    super(message);
    this.name = "AuthRequestError";
    this.field = field;
  }
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    // A gateway or proxy can answer with HTML, so a failed parse must not
    // replace the server's error with a TypeError about JSON.
    const problem = (await response
      .json()
      .catch(() => null)) as AuthErrorBody | null;
    throw new AuthRequestError(
      problem?.error ?? "Something went wrong. Try again.",
      problem?.field,
    );
  }

  return (await response.json()) as T;
}

export async function signupWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const { user } = await post<{ user: User }>("/api/auth/signup", {
    email,
    password,
  });
  return user;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const { user } = await post<{ user: User }>("/api/auth/login", {
    email,
    password,
  });
  return user;
}

export async function oauthSignIn(provider: Provider): Promise<User> {
  const { user } = await post<{ user: User }>("/api/auth/oauth", { provider });
  return user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await post("/api/auth/reset", { email });
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

/** Null rather than a throw when signed out — 401 is an answer, not a fault. */
export async function fetchMe(): Promise<User | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  const { user } = (await response.json()) as { user: User | null };
  return user;
}
