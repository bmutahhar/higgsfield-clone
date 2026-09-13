import { readSession } from "@/server/auth/current-user.server";

export async function GET() {
  const user = await readSession();
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user });
}
