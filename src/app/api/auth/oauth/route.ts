import { mockLatency, SOCIAL_PROVIDERS } from "@/config/auth";
import { setSessionCookie } from "@/server/auth/session.server";
import { findOrCreateOAuthUser } from "@/server/auth/store.server";

/*
 * The one-click path. A real integration would redirect, carry a state
 * parameter and exchange a code; this takes a provider name and opens a
 * session, which is what the brief asks for.
 */
export async function POST(request: Request) {
  await mockLatency();
  const { provider } = (await request.json()) as { provider?: string };

  const known = SOCIAL_PROVIDERS.find((entry) => entry.id === provider);
  if (!known) {
    return Response.json({ error: "Unknown provider." }, { status: 400 });
  }

  const user = findOrCreateOAuthUser(known.id);
  await setSessionCookie(user.id);
  return Response.json({ user });
}
