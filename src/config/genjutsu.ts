/**
 * Content for the Genjutsu video studio.
 *
 * Everything the surface says lives here rather than inside components, because
 * most of it is mode-dependent: switching between motion transfer and object
 * swap rewrites both drop zones, the image cap and the prompt placeholder at
 * once. One record keyed by mode keeps those in step; scattered ternaries would
 * not.
 *
 * Media is referenced by remote URL. Every video carries a poster and every
 * poster a fallback, so a rotated asset degrades to a flat card rather than a
 * hole. Swap these for local files in one edit if the origin ever blocks us.
 */

export type GenjutsuMode = "motion" | "swap";

/*
 * The reference clip's accepted range. The drop zone's hint is built from these
 * rather than restating them, so the sentence a user reads and the rule the
 * schema enforces can never drift apart.
 */
export const VIDEO_MIN_SECONDS = 4;
export const VIDEO_MAX_SECONDS = 30;

const DURATION_HINT = `Video duration: ${String(VIDEO_MIN_SECONDS)}\u2013${String(VIDEO_MAX_SECONDS)} seconds`;

export interface ModeCopy {
  id: GenjutsuMode;
  /** Segmented-control label. */
  label: string;
  icon: "circles" | "swap";
  /** Two lines; the break is deliberate and matches the control's height. */
  videoTitle: [string, string];
  videoHint: string;
  imageTitle: [string, string];
  /** Upper bound on reference images. Differs per mode. */
  imageLimit: number;
  promptPlaceholder: string;
  /** The card that floats out to the right of the form on tab hover. */
  preview: {
    title: [string, string];
    body?: string;
    video: string;
    poster: string;
  };
}

export const MODES: Record<GenjutsuMode, ModeCopy> = {
  motion: {
    id: "motion",
    label: "Motion transfer",
    icon: "circles",
    videoTitle: ["Add a reference video", "to extract motion"],
    videoHint: DURATION_HINT,
    imageTitle: ["Add your characters,", "products, or clothes"],
    imageLimit: 49,
    promptPlaceholder:
      "Say what the new scene should be — who is in it, where it happens, what they are wearing. Reference an attachment with @.",
    preview: {
      title: ["Keep the movement.", "Replace everything else."],
      body: "Lift the motion out of any clip, then rebuild the shot around a new cast and a new location.",
      video:
        "https://static.higgsfield.ai/genjutsu/genjutsu-motion-transfer-intro.mp4",
      poster:
        "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Fgenjutsu-intro-poster.webp&w=384&q=85",
    },
  },
  swap: {
    id: "swap",
    label: "Objects swap",
    icon: "swap",
    videoTitle: ["Add a reference video", "to edit"],
    videoHint: DURATION_HINT,
    imageTitle: ["Add your characters,", "products, or clothes"],
    imageLimit: 30,
    promptPlaceholder:
      "Name only what should change — a person, a product, the backdrop. Everything you leave out stays exactly as filmed.",
    preview: {
      title: ["Change one thing.", "Leave the rest alone."],
      video: "https://static.higgsfield.ai/genjutsu/replace.mp4",
      poster:
        "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Freplace-poster.webp&w=384&q=85",
    },
  },
};

export const MODE_ORDER: GenjutsuMode[] = ["motion", "swap"];

/** The promo card pinned to the top of the form. */
export const PROMO = {
  title: "Higgsfield Genjutsu",
  subtitle: "Reality manipulation",
  video: "https://static.higgsfield.ai/promotions/genjustu-2-h264.mp4",
  poster:
    "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Fgenjutsu-intro-poster.webp&w=640&q=85",
};

/** The hero at the top of the Motion Library tab. */
export const HERO = {
  headline: "One take, every version of it",
  blurb:
    "Reuse a performance you already have. Recast it, move it somewhere else, or change a single object and leave the rest of the frame untouched.",
  video: "https://static.higgsfield.ai/genjutsu/genjutsu-intro.mp4",
  poster:
    "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Fgenjutsu-intro-poster.webp&w=1280&q=85",
};

export interface HowItWorksSlide {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  video: string;
  poster: string;
}

/** The three-slide filmstrip behind the How it works tab. */
export const HOW_IT_WORKS: HowItWorksSlide[] = [
  {
    id: "idea",
    eyebrow: "The idea",
    title: "Shoot once, ship many",
    body: "Hand it a clip you already own and get back the same performance carrying a different cast, product or place.",
    video: "https://static.higgsfield.ai/genjutsu/genjutsu-idea.mp4",
    poster:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Fgenjutsu-idea-poster.webp&w=640&q=85",
  },
  {
    id: "cast",
    eyebrow: "Motion transfer",
    title: "The move survives the recast",
    body: "Timing, weight and camera path come across intact. Only who is performing them changes.",
    video:
      "https://static.higgsfield.ai/genjutsu/genjutsu-motion-transfer-intro.mp4",
    poster:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Fgenjutsu-intro-poster.webp&w=640&q=85",
  },
  {
    id: "swap",
    eyebrow: "Objects swap",
    title: "Edit one element, keep the take",
    body: "Point at a single thing in frame and replace it. The lighting, grain and everything around it stay as shot.",
    video: "https://static.higgsfield.ai/genjutsu/replace.mp4",
    poster:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fstatic.higgsfield.ai%2Fgenjutsu%2Freplace-poster.webp&w=640&q=85",
  },
];

/** Right-pane tabs. History and the library share the pane; both are client state. */
export const PANE_TABS = [
  { id: "history", label: "History", icon: "folder" },
  { id: "library", label: "Motion Library", icon: "circle-dashed" },
  { id: "how", label: "How it works", icon: "book-open" },
] as const;

export type PaneTab = (typeof PANE_TABS)[number]["id"];

/**
 * The form's own tabs are routes, not state — each is a different model on a
 * different surface. `active` is decided by whichever page renders them.
 */
export const FORM_TABS = [
  { id: "create", label: "Create Video", href: "/ai/video?model=genjutsu" },
  {
    id: "edit",
    label: "Edit Video",
    href: "/ai/video/edit?model=seedance_2_5_edit",
  },
  {
    id: "motion",
    label: "Motion Control",
    href: "/ai/video/motion?model=kling-3-motion-control",
  },
] as const;

export type FormTabId = (typeof FORM_TABS)[number]["id"];
