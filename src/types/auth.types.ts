export type Provider = "google" | "apple" | "microsoft" | "email";

/** What every authenticated surface is allowed to see. Never carries a password. */
export interface User {
  id: string;
  email: string;
  name: string;
  provider: Provider;
  credits: number;
  /** ISO 8601. */
  createdAt: string;
}

export interface AuthSuccessBody {
  user: User;
}

export interface AuthErrorBody {
  /** Shown to the user verbatim, so it is written as user-facing copy. */
  error: string;
  field?: "email" | "password";
}
