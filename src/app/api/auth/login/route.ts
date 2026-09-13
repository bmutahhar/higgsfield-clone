import { mockLatency } from "@/config/auth";
import { setSessionCookie } from "@/server/auth/session.server";
import { verifyCredentials } from "@/server/auth/store.server";

export async function POST(request: Request) {
  await mockLatency();
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const user = verifyCredentials(email ?? "", password ?? "");
  /*
   * One message for both halves. Saying which was wrong tells a caller which
   * addresses are registered.
   */
  if (!user) {
    return Response.json(
      { error: "Wrong email or password." },
      { status: 401 },
    );
  }

  await setSessionCookie(user.id);
  return Response.json({ user });
}
