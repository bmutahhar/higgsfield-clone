/**
 * Distribute items across a fixed number of columns, shortest column first.
 *
 * Pure arithmetic on intrinsic ratios — no DOM, no measurement — so the
 * layout is stable on the server and identical after hydration. Column height
 * is accumulated in units of column width, which is all that is needed to
 * compare two columns.
 */
export function balanceColumns<T extends { w: number; h: number }>(
  items: T[],
  columns: number,
): T[][] {
  const count = Math.max(1, columns);
  const buckets: T[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);

  for (const item of items) {
    let shortest = 0;
    for (let i = 1; i < count; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    buckets[shortest].push(item);
    heights[shortest] += item.h / item.w;
  }

  return buckets;
}
