import "server-only";

import { MOCK_USER, NEW_ACCOUNT_CREDITS } from "@/config/auth";
import { displayNameFromEmail } from "@/lib/auth/identity";
import type { Provider, User } from "@/types/auth.types";

/*
 * The whole database. A module-level Map, seeded at import and reset when the
 * dev server restarts — accounts made during a session survive hot reloads but
 * not a restart, and the seeded user always comes back.
 *
 * Passwords are compared in plain text. That is correct here: there is no
 * persistence and no real account, so a hash would protect nothing and only
 * suggest this is sturdier than it is. Do not "fix" it without also adding a
 * real store to justify it.
 */
interface StoredUser extends User {
  password: string;
}

const users = new Map<string, StoredUser>();
let nextId = 1;

const normalise = (email: string) => email.trim().toLowerCase();

// Built by destructuring the password off rather than copying fields across,
// so a field added to StoredUser later cannot ride along to the client.
function toPublicUser({ password: _password, ...user }: StoredUser): User {
  return user;
}

function insert(
  email: string,
  password: string,
  provider: Provider,
  name: string,
  credits: number,
): StoredUser {
  const key = normalise(email);
  const stored: StoredUser = {
    id: `user_${String(nextId)}`,
    email: key,
    name,
    provider,
    credits,
    createdAt: new Date().toISOString(),
    password,
  };
  nextId += 1;
  users.set(key, stored);
  return stored;
}

export function resetStore(): void {
  users.clear();
  nextId = 1;
  insert(
    MOCK_USER.email,
    MOCK_USER.password,
    "email",
    MOCK_USER.name,
    MOCK_USER.credits,
  );
}

resetStore();

export function findByEmail(email: string): User | null {
  const stored = users.get(normalise(email));
  return stored ? toPublicUser(stored) : null;
}

export function findById(id: string): User | null {
  for (const stored of users.values()) {
    if (stored.id === id) return toPublicUser(stored);
  }
  return null;
}

export function createEmailUser(email: string, password: string): User {
  if (users.has(normalise(email))) {
    throw new Error("That email is already registered.");
  }
  return toPublicUser(
    insert(
      email,
      password,
      "email",
      displayNameFromEmail(normalise(email)),
      NEW_ACCOUNT_CREDITS,
    ),
  );
}

export function verifyCredentials(
  email: string,
  password: string,
): User | null {
  const stored = users.get(normalise(email));
  /*
   * An OAuth identity is stored with no password. Without this guard an empty
   * string would match it, so anyone could sign in as a provider account by
   * submitting its address and a blank password.
   */
  if (!stored?.password) return null;
  if (stored.password !== password) return null;
  return toPublicUser(stored);
}

/*
 * One-click sign-in, per the brief: no redirect, no token exchange. Each
 * provider gets one deterministic identity, so signing in with Google twice
 * lands on the same account.
 */
export function findOrCreateOAuthUser(provider: Provider): User {
  const email = `demo.${provider}@higgsfield.ai`;
  const existing = users.get(email);
  if (existing) return toPublicUser(existing);

  const label = provider[0].toUpperCase() + provider.slice(1);
  return toPublicUser(
    insert(email, "", provider, `${label} Creator`, NEW_ACCOUNT_CREDITS),
  );
}
