import type { IconName } from "@/components/core/icon";
import type { Provider } from "@/types/auth.types";

export const SESSION_COOKIE = "hf_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const NEW_ACCOUNT_CREDITS = 25;

/*
 * The seeded account. It exists from import and returns after every restart,
 * so there is always a known-good credential to demonstrate login with.
 */
export const MOCK_USER = {
  email: "demo@higgsfield.ai",
  password: "demo1234",
  name: "Demo Creator",
  credits: 250,
} as const;

export const SOCIAL_PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
  { id: "microsoft", label: "Continue with Microsoft" },
] as const satisfies readonly { id: Provider; label: string }[];

export interface AuthSlide {
  id: string;
  /** The control row's label. Note it differs from the title on slide 4. */
  label: string;
  title: string;
  body: string;
  badges: { icon: IconName; text: string }[];
  media: { kind: "video" | "image"; src: string };
}

// The same cdn-cgi transform src/config/media.ts already builds.
const IMG =
  "https://higgsfield.ai/cdn-cgi/image/fit=scale-down,format=webp,onerror=redirect,width=1920,quality=85/https://static.higgsfield.ai/";

export const AUTH_SLIDES: AuthSlide[] = [
  {
    id: "seedance",
    label: "Seedance 2.0 4K",
    title: "SEEDANCE 2.0 4K",
    body: "The world's most capable video model at full 4K",
    badges: [{ icon: "tag", text: "4K Resolution" }],
    media: {
      kind: "video",
      src: "https://static.higgsfield.ai/auth/seedance.mp4",
    },
  },
  {
    id: "nano-banana-pro",
    label: "Nano Banana Pro",
    title: "NANO BANANA PRO 4K",
    body: "The best image model, for the best price in the industry, only on Higgsfield",
    badges: [{ icon: "tag", text: "4K Resolution" }],
    media: { kind: "image", src: `${IMG}quiz-v2/auth-1.webp` },
  },
  {
    id: "higgsfield-soul",
    label: "Higgsfield Soul",
    title: "HIGGSFIELD SOUL",
    body: "Create consistent characters across images and videos for storytelling",
    badges: [
      { icon: "tag", text: "2K Quality" },
      { icon: "sparkles", text: "Prompt Enhancer" },
    ],
    media: { kind: "image", src: `${IMG}quiz-v2/auth-3.png` },
  },
  {
    id: "cinema-studio",
    label: "Cinematic App",
    title: "CINEMA STUDIO",
    body: "Turn images into cinematic shots with motion and transitions",
    badges: [
      { icon: "check", text: "Cinematic Motion" },
      { icon: "check", text: "Film-grade Shots" },
    ],
    media: {
      kind: "video",
      src: "https://static.higgsfield.ai/quiz-v2/auth-5-mini.mp4",
    },
  },
];

/** Measured: the progress fill reached 60.274% after 3.002s. */
export const SLIDE_DURATION_MS = 5000;

/*
 * The mock endpoints answer instantly, which would make the submitting state a
 * single dropped frame. A short delay is the only reason the disabled fieldset
 * is ever seen. Skipped under test so the suite stays fast.
 */
export function mockLatency(): Promise<void> {
  if (process.env.VITEST) return Promise.resolve();
  const ms = 400 + Math.floor(Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
