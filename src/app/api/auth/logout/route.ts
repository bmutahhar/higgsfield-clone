import { clearSessionCookie } from "@/server/auth/session.server";

export async function POST() {
  await clearSessionCookie();
  return new Response(null, { status: 204 });
}
