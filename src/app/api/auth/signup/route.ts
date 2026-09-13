import { mockLatency } from "@/config/auth";
import { isValidEmail, passwordIssue } from "@/lib/auth/validate";
import { setSessionCookie } from "@/server/auth/session.server";
import { createEmailUser } from "@/server/auth/store.server";

export async function POST(request: Request) {
  await mockLatency();
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !isValidEmail(email)) {
    return Response.json(
      { error: "Enter a valid email address.", field: "email" },
      { status: 400 },
    );
  }

  const issue = passwordIssue(password ?? "");
  if (issue) {
    return Response.json({ error: issue, field: "password" }, { status: 400 });
  }

  try {
    const user = createEmailUser(email, password ?? "");
    await setSessionCookie(user.id);
    return Response.json({ user }, { status: 201 });
  } catch {
    return Response.json(
      { error: "That email is already registered.", field: "email" },
      { status: 409 },
    );
  }
}
