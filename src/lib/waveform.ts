/*
 * Bar heights for a generation's waveform, derived from its job id.
 *
 * Not from the audio. Decoding would mean `decodeAudioData` over a
 * cross-origin fixture, which is one missing CORS header away from a
 * permanently empty tile — and the bars are decoration, not analysis: nobody
 * reads amplitude off a 40px strip. The id already encodes everything unique
 * about a generation, so hashing it gives a picture that is stable across
 * reloads and machines and costs nothing.
 *
 * This mirrors how `generation-jobs.server.ts` keeps its state in the id.
 */

/** Lower bound, so no bar renders as an invisible zero-height sliver. */
const MIN = 0.15;

/*
 * FNV-1a, seeded per bar. A plain hash of the id would give one number; the
 * index is mixed into the offset basis so each bar gets its own, and the
 * final avalanche keeps neighbouring indices from producing neighbouring
 * heights.
 */
function hash(id: string, index: number): number {
  let h = (0x811c9dc5 ^ index) >>> 0;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 0x2545f491);
  return (h >>> 0) / 0xffffffff;
}

export function waveformBars(id: string, count = 64): number[] {
  return Array.from({ length: count }, (_, index) => {
    const base = hash(id, index);
    /*
     * A slow sine over the run stops the result reading as pure noise: real
     * speech swells and falls, and a flat band of random bars does not.
     */
    const envelope = 0.55 + 0.45 * Math.sin((index / count) * Math.PI * 3);
    return MIN + (1 - MIN) * Math.min(1, base * envelope);
  });
}
