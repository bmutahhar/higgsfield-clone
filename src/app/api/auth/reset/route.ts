import { mockLatency } from "@/config/auth";
import { isValidEmail } from "@/lib/auth/validate";

export async function POST(request: Request) {
  await mockLatency();
  const { email } = (await request.json()) as { email?: string };

  if (!email || !isValidEmail(email)) {
    return Response.json(
      { error: "Enter a valid email address.", field: "email" },
      { status: 400 },
    );
  }

  /*
   * Always 200, whether or not the address exists. Answering differently would
   * turn this into an oracle for which emails are registered — a habit worth
   * keeping even where there is nothing real to protect.
   */
  return Response.json({ ok: true });
}
