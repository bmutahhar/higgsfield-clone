import "server-only";

import { readSessionUserId } from "@/server/auth/session.server";
import { findById } from "@/server/auth/store.server";
import type { User } from "@/types/auth.types";

/**
 * The signed-in user, or null. Safe to call from a server component — it is
 * what lets the root layout seed the client provider so the header never
 * paints signed-out and then corrects itself.
 */
export async function readSession(): Promise<User | null> {
  const id = await readSessionUserId();
  return id ? findById(id) : null;
}
