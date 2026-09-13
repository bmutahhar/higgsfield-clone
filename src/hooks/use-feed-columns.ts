"use client";

import { useCallback, useSyncExternalStore } from "react";

import { DEFAULT_ZOOM, FEED_COLUMNS } from "@/config/image-studio";

const KEY = "hf:image-feed-view-controls";

interface Stored {
  columnsPerRow: number;
  groupMode: string;
}

/*
 * `localStorage` is an external store, so it is subscribed to rather than
 * copied into state in an effect — that would set state during the first
 * commit and cascade a second render on every mount. The server snapshot is
 * the default zoom, which is also what the first client paint uses, so the
 * markup matches and React swaps in the stored value right after hydration.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // `storage` only fires in *other* tabs, so same-tab writes notify directly.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/*
 * getSnapshot runs on every render and must return a value that is stable
 * while the store is, so the parse is memoised against the raw string.
 */
let rawCache: string | null = null;
let zoomCache = DEFAULT_ZOOM;

function getSnapshot(): number {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Private browsing or a blocked store: the default, every time.
    return DEFAULT_ZOOM;
  }
  if (raw === rawCache) return zoomCache;

  rawCache = raw;
  zoomCache = DEFAULT_ZOOM;
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw) as Partial<Stored>;
      const index = FEED_COLUMNS.indexOf(parsed.columnsPerRow ?? 0);
      if (index !== -1) zoomCache = index;
    } catch {
      // Malformed entry — leave the default in place.
    }
  }
  return zoomCache;
}

function getServerSnapshot(): number {
  return DEFAULT_ZOOM;
}

/**
 * The feed's zoom, persisted between visits.
 *
 * The stored shape is the live app's own — `{ columnsPerRow, groupMode }` —
 * because the column count, not the slider index, is the durable fact: adding
 * a zoom stop later should not silently re-zoom everybody's feed.
 */
export function useFeedColumns() {
  const zoom = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setZoom = useCallback((next: number) => {
    const index = Math.min(Math.max(next, 0), FEED_COLUMNS.length - 1);
    try {
      const value: Stored = {
        columnsPerRow: FEED_COLUMNS[index],
        groupMode: "default",
      };
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      // Unwritable store: hold the new zoom in the cache for this session.
      rawCache = null;
      zoomCache = index;
    }
    for (const listener of listeners) listener();
  }, []);

  return { zoom, setZoom, columns: FEED_COLUMNS[zoom] };
}
