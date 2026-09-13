import { assetFilename } from "@/lib/asset-filename";

/*
 * Getting a finished generation out of the page — onto the clipboard, onto
 * the disk.
 *
 * Every one of these fetches bytes, which is why they live here and not in
 * `lib/`. Fetching is also the only way this can work at all: a `download`
 * attribute is ignored on a cross-origin link, so a plain anchor would
 * navigate to the image instead of saving it. Every origin the studios serve
 * from allows cross-origin reads, so the bytes are ours to hand over.
 */

const PNG = "image/png";

async function fetchAsset(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not read the asset (${String(response.status)})`);
  }
  return await response.blob();
}

/**
 * Save an asset, named after the prompt that made it.
 *
 * A failure is thrown rather than worked around: the button that called this
 * reports it, and the obvious fallback — opening the asset in a tab — is
 * itself unreliable, since by the time the fetch has failed the click is over
 * and a popup blocker will eat the window.
 */
export async function downloadAsset(
  url: string,
  prompt: string,
): Promise<void> {
  const blob = await fetchAsset(url);
  const href = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = href;
  link.download = assetFilename(prompt, blob.type, url);
  // Firefox only honours a click on a link that is actually in the document.
  document.body.append(link);
  link.click();
  link.remove();

  /*
   * Revoked on the next tick rather than immediately. The browser reads the
   * object URL after the click handler returns, and revoking synchronously
   * cancels the save on WebKit.
   */
  setTimeout(() => {
    URL.revokeObjectURL(href);
  }, 0);
}

/**
 * The asset re-encoded as a PNG.
 *
 * Clipboards accept PNG and nothing else, and these assets are WebP, so this
 * is a real decode and re-encode rather than a passthrough. The canvas is
 * never tainted because every origin involved allows cross-origin reads.
 */
async function toPng(url: string): Promise<Blob> {
  const bitmap = await createImageBitmap(await fetchAsset(url));

  try {
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No 2d context to copy through.");
      context.drawImage(bitmap, 0, 0);
      return await canvas.convertToBlob({ type: PNG });
    }

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No 2d context to copy through.");
    context.drawImage(bitmap, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((encoded) => {
        if (encoded) resolve(encoded);
        else reject(new Error("The image could not be encoded as PNG."));
      }, PNG);
    });
  } finally {
    // A decoded 4K frame is tens of megabytes; do not wait for the collector.
    bitmap.close();
  }
}

/** Copy a link to the asset. Also the fallback where images cannot be written. */
export function copyLink(url: string): Promise<void> {
  if (typeof navigator.clipboard === "undefined") {
    return Promise.reject(new Error("This browser has no clipboard access."));
  }
  return navigator.clipboard.writeText(url);
}

/**
 * Put an image on the clipboard.
 *
 * Deliberately not `async`, and that is the whole point: Safari rejects a
 * clipboard write issued after an `await`, so the `ClipboardItem` has to be
 * constructed synchronously inside the click. Handing it a pending blob
 * instead of a resolved one is exactly what the spec allows for this.
 */
export function copyImageToClipboard(url: string): Promise<void> {
  if (
    typeof ClipboardItem === "undefined" ||
    typeof navigator.clipboard === "undefined"
  ) {
    // Nothing to put an image in. The link is the next most useful thing.
    return copyLink(url);
  }

  return navigator.clipboard.write([new ClipboardItem({ [PNG]: toPng(url) })]);
}
