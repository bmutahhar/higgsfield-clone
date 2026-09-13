"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import * as authApi from "@/services/auth-client";
import type { Provider, User } from "@/types/auth.types";

export type AuthStep = "root" | "signup" | "login" | "reset";

export interface AuthValue {
  user: User | null;
  status: "idle" | "pending";
  open: boolean;
  step: AuthStep;
  canGoBack: boolean;
  /** Whether the root screen shows the consent checkbox. Login mode omits it. */
  signupMode: boolean;
  openAuth: (mode?: "signup" | "login") => void;
  closeAuth: () => void;
  goTo: (step: AuthStep) => void;
  goBack: () => void;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logInWithEmail: (email: string, password: string) => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/*
 * `initialUser` is read from the session cookie by the root layout, so the
 * first paint already knows who is signed in. Fetching it on mount instead
 * would make the header flash Login/Sign up on every reload.
 *
 * `signupMode` is tracked separately from `step`: both header buttons open the
 * same root screen, and mode only decides whether the consent checkbox is
 * there. It survives moving on to an email step.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [open, setOpen] = useState(false);
  const [signupMode, setSignupMode] = useState(true);
  // A stack, so back is a pop. The bottom entry is always the root screen.
  const [stack, setStack] = useState<AuthStep[]>(["root"]);

  const openAuth = useCallback((mode: "signup" | "login" = "signup") => {
    setStack(["root"]);
    setSignupMode(mode === "signup");
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setOpen(false);
    setStack(["root"]);
  }, []);

  const goTo = useCallback((next: AuthStep) => {
    setStack((prev) => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const settle = useCallback(
    (next: User) => {
      setUser(next);
      setOpen(false);
      setStack(["root"]);
      /*
       * Server components re-read the cookie. Without this the studio routes
       * keep rendering their signed-out branch until the next navigation.
       */
      router.refresh();
    },
    [router],
  );

  const value = useMemo<AuthValue>(() => {
    async function run<T>(work: () => Promise<T>): Promise<T> {
      setStatus("pending");
      try {
        return await work();
      } finally {
        setStatus("idle");
      }
    }

    return {
      user,
      status,
      open,
      step: stack[stack.length - 1] ?? "root",
      canGoBack: stack.length > 1,
      signupMode,
      openAuth,
      closeAuth,
      goTo,
      goBack,
      signInWithProvider: async (provider) => {
        settle(await run(() => authApi.oauthSignIn(provider)));
      },
      signUpWithEmail: async (email, password) => {
        settle(await run(() => authApi.signupWithEmail(email, password)));
      },
      logInWithEmail: async (email, password) => {
        settle(await run(() => authApi.loginWithEmail(email, password)));
      },
      requestReset: async (email) => {
        await run(() => authApi.requestPasswordReset(email));
      },
      signOut: async () => {
        await authApi.logout();
        setUser(null);
        router.refresh();
      },
    };
  }, [
    user,
    status,
    open,
    stack,
    signupMode,
    openAuth,
    closeAuth,
    goTo,
    goBack,
    settle,
    router,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
