import "server-only";

import { MOCK_USER, NEW_ACCOUNT_CREDITS } from "@/config/auth";
import { displayNameFromEmail } from "@/lib/auth/identity";
import type { Provider, User } from "@/types/auth.types";

/*
 * The whole database. Seeded at import and reset when the dev server restarts —
 * accounts made during a session survive hot reloads but not a restart, and the
 * seeded user always comes back.
 *
 * Hung off globalThis rather than held in a module-level binding, because Next
 * gives route handlers and server components separate module graphs: a plain
 * `const users = new Map()` is instantiated once per graph. Both copies seed
 * the mock user, so it appeared signed in everywhere — but anyone who signed in
 * at runtime was written only to the graph whose handler created them, and the
 * server-component render that paints the header read the other Map and saw
 * nobody. One object on globalThis is the only thing both graphs can agree on.
 * It survives HMR too, which the module-level version intended but never had.
 *
 * Passwords are compared in plain text. That is correct here: there is no
 * persistence and no real account, so a hash would protect nothing and only
 * suggest this is sturdier than it is. Do not "fix" it without also adding a
 * real store to justify it.
 */
interface StoredUser extends User {
  password: string;
}

interface Store {
  users: Map<string, StoredUser>;
  nextId: number;
}

const globalRef = globalThis as typeof globalThis & {
  __hfAuthStore?: Store;
};

const store: Store = (globalRef.__hfAuthStore ??= {
  users: new Map<string, StoredUser>(),
  nextId: 1,
});

const users = store.users;

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
    id: `user_${String(store.nextId)}`,
    email: key,
    name,
    provider,
    credits,
    createdAt: new Date().toISOString(),
    password,
  };
  store.nextId += 1;
  users.set(key, stored);
  return stored;
}

export function resetStore(): void {
  users.clear();
  store.nextId = 1;
  insert(
    MOCK_USER.email,
    MOCK_USER.password,
    "email",
    MOCK_USER.name,
    MOCK_USER.credits,
  );
}

/*
 * Seed only when the shared store is new. An unconditional reset at import
 * would let the second module graph to load wipe every account the first had
 * already taken — which is the same bug in a different costume.
 */
if (users.size === 0) resetStore();

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
