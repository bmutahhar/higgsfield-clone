/*
 * The script editor holds rich content — plain text plus `@` mention chips —
 * and the schema wants a string. These two functions are that boundary, and
 * they are the only real logic in the field, which is why they live here and
 * are tested rather than buried in the component.
 */

/** Mentions are inserted as `@name`; a name runs to whitespace. */
const MENTION = /(^|\s)@([^\s@]+)/g;

/**
 * Flatten the editor's HTML to the text the schema validates.
 *
 * Mention chips become `@name`, block boundaries become newlines, and entities
 * are decoded so a `&amp;` counts as one character rather than five.
 */
export function serialiseScript(html: string): string {
  const withMentions = html.replace(
    /<span[^>]*data-mention="([^"]*)"[^>]*>.*?<\/span>/g,
    (_match, name: string) => `@${name}`,
  );

  const withBreaks = withMentions
    .replace(/<\/(p|div)>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n");

  const stripped = withBreaks.replace(/<[^>]+>/g, "");

  return decode(stripped).replace(/\n+$/, "");
}

/**
 * The five entities an editor actually produces. No DOM here — `lib/` is pure,
 * so this cannot lean on `textContent` to do the decoding.
 *
 * `&amp;` is last on purpose: decoding it first would turn `&amp;lt;` into
 * `<`, which is the classic double-decode bug.
 */
function decode(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/**
 * Which attachments a script refers to.
 *
 * The leading-boundary group is what keeps `sam@example.com` from reading as a
 * mention of `example.com`.
 */
export function scriptMentions(text: string): string[] {
  return [...text.matchAll(MENTION)].map((match) => match[2]);
}
