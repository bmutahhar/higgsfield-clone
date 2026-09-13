import { describe, expect, it } from "vitest";

import { scriptMentions, serialiseScript } from "@/lib/script-tokens";

describe("serialiseScript", () => {
  it("returns plain text unchanged", () => {
    expect(serialiseScript("The fog rolled in.")).toBe("The fog rolled in.");
  });

  /* The editor renders a mention as a chip; the schema must see a string. */
  it("renders a mention chip as @name", () => {
    const html = 'Read <span data-mention="clip.wav">clip.wav</span> aloud.';
    expect(serialiseScript(html)).toBe("Read @clip.wav aloud.");
  });

  it("handles several mentions in one line", () => {
    const html =
      '<span data-mention="a.wav">a.wav</span> then <span data-mention="b.wav">b.wav</span>';
    expect(serialiseScript(html)).toBe("@a.wav then @b.wav");
  });

  it("turns block elements into newlines", () => {
    expect(serialiseScript("<p>One</p><p>Two</p>")).toBe("One\nTwo");
  });

  it("decodes entities so the schema counts real characters", () => {
    expect(serialiseScript("Tom &amp; Jerry &lt;3")).toBe("Tom & Jerry <3");
  });

  it("returns an empty string for empty input", () => {
    expect(serialiseScript("")).toBe("");
    expect(serialiseScript("<p></p>")).toBe("");
  });
});

describe("scriptMentions", () => {
  it("lists the names a script references", () => {
    expect(scriptMentions("Read @clip.wav then @take2.mp3")).toEqual([
      "clip.wav",
      "take2.mp3",
    ]);
  });

  it("returns an empty list when there are none", () => {
    expect(scriptMentions("No references here.")).toEqual([]);
  });

  it("does not treat an email as a mention", () => {
    expect(scriptMentions("write to sam@example.com")).toEqual([]);
  });
});
