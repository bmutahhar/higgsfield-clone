/**
 * Naming a file after the thing that made it.
 *
 * Pure string work, deliberately split out of the service that downloads:
 * everything worth getting exactly right here — the length cap, the nested
 * CDN url, an empty prompt — is testable without a browser, and the service
 * is not.
 */

/** Long enough to identify a generation, short enough for any filesystem. */
const MAX_LENGTH = 60;

/** A prompt can be blank, or contain nothing nameable at all. */
const FALLBACK_NAME = "generation";

const FALLBACK_EXTENSION = "bin";

const BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/**
 * Cut to length on a word boundary.
 *
 * A blunt `slice` can leave a trailing hyphen or a severed word; cutting back
 * to the last separator keeps the name readable. When the character at the
 * limit is already the separator, the slice is the boundary.
 */
function cap(slug: string): string {
  if (slug.length <= MAX_LENGTH) return slug;

  const cut = slug.slice(0, MAX_LENGTH);
  if (slug[MAX_LENGTH] === "-") return cut;

  const boundary = cut.lastIndexOf("-");
  return boundary > 0 ? cut.slice(0, boundary) : cut;
}

/**
 * A prompt as a filename stem.
 *
 * Accents are folded rather than dropped, so a prompt written in French names
 * a file instead of falling back to the generic stem.
 */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    // Combining marks, left behind by the decomposition above.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug === "" ? FALLBACK_NAME : cap(slug);
}

/**
 * The extension a url's own path claims, if it claims a plausible one.
 *
 * Reads the last path segment rather than searching the whole url: the stills
 * arrive through Cloudflare's image transform, which nests the origin url
 * inside the path and carries a `format=` parameter that is not the answer.
 */
function fromUrl(url: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }

  const last = pathname.split("/").pop() ?? "";
  const dot = last.lastIndexOf(".");
  if (dot <= 0) return null;

  const extension = last.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,5}$/.test(extension) ? extension : null;
}

/**
 * What to call the file, given what the server actually sent.
 *
 * The response's content type wins over the url: the same still is served as
 * WebP or JPEG depending on what the browser asked for, so the url's suffix
 * is a guess and the type is a fact.
 */
export function extensionFor(
  mimeType: string | undefined,
  url: string,
): string {
  const type = mimeType?.split(";")[0].trim().toLowerCase();
  if (type !== undefined && type in BY_TYPE) return BY_TYPE[type];
  return fromUrl(url) ?? FALLBACK_EXTENSION;
}

/** The name a download lands under. */
export function assetFilename(
  prompt: string,
  mimeType: string | undefined,
  url: string,
): string {
  return `${slugify(prompt)}.${extensionFor(mimeType, url)}`;
}
