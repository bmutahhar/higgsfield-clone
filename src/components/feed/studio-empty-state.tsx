import Image from "next/image";

/*
 * What a signed-out visitor gets in place of the feed. Measured off the live
 * /ai/image: the card cluster is rendered twice — once blurred behind as a
 * glow, once sharp in front — which is what gives the type its halo.
 *
 * The 240px is the composer's reserved height, matching the bottom margin the
 * feed's own scroller uses. If the composer's height changes, this changes
 * with it.
 */
const CARDS = [
  {
    src: "soul-cinematic-1",
    rotate: "-rotate-10",
    shape: "rounded-xl",
    bordered: true,
  },
  {
    src: "soul-cinematic-2",
    rotate: "rotate-4",
    shape: "rounded-xl",
    bordered: false,
  },
  {
    src: "soul-cinematic-3",
    rotate: "rotate-180 -scale-y-100",
    shape: "rounded-full",
    bordered: true,
  },
  {
    src: "soul-cinematic-4",
    rotate: "-rotate-4",
    shape: "rounded-xl",
    bordered: true,
  },
] as const;

const IMG =
  "https://higgsfield.ai/cdn-cgi/image/fit=scale-down,format=webp,onerror=redirect,width=1920,quality=85/image/empty-state/";

const SIZE = "size-[clamp(64px,min(12vw,16vh),172px)]";
const OVERLAP = "-mr-[clamp(16px,min(1.5vw,2vh),36px)]";
const SHADOW =
  "shadow-[0_0.3px_0.3px_-0.15px_rgba(0,0,0,0.03),0_0.9px_0.9px_-0.45px_rgba(0,0,0,0.03)]";

function Cluster() {
  return (
    <div className="isolate flex items-center">
      {CARDS.map((card, index) => (
        <div
          key={card.src}
          // z-index descends 4..1 across the fan; positional, not a token.
          style={{ zIndex: CARDS.length - index }}
          className={`flex shrink-0 items-center justify-center ${
            index === CARDS.length - 1 ? "" : OVERLAP
          }`}
        >
          <div className={`flex-none ${card.rotate}`}>
            <div
              className={`relative overflow-hidden ${SIZE} ${card.shape} ${
                card.bordered ? "border-3 border-white/30 xl:border-4" : ""
              } ${SHADOW}`}
            >
              <Image
                src={`${IMG}${card.src}.webp`}
                alt=""
                fill
                sizes="172px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StudioEmptyState() {
  return (
    <div className="relative flex h-[calc(100%-240px)] w-full flex-col items-center justify-center gap-[clamp(16px,3vh,40px)] px-4">
      <div className="relative flex w-full flex-col items-center gap-[clamp(12px,2.5vh,32px)]">
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 opacity-40 blur-[32px]"
        >
          <Cluster />
        </div>
        <Cluster />

        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col gap-2">
            <div className="font-q-display text-[clamp(20px,min(3vw,4.5vh),36px)] leading-[1] font-bold tracking-[-0.56px] uppercase">
              <p className="text-white">Start creating with</p>
              <p className="text-q-brand">Higgsfield Soul Cinema</p>
            </div>
            <p className="text-sm text-q-soft xl:text-base">
              Describe a scene, character, mood, or style — and watch it come to
              life
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
