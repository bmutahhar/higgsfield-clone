/**
 * Read a clip's duration without uploading it.
 *
 * `File` carries no media metadata, so the only way to learn how long a clip
 * runs is to let the browser decode its header. Resolves `null` when that
 * fails — a corrupt file or an unsupported codec — so the caller can decide
 * whether to reject or let the server have the final say, rather than being
 * handed a rejected promise for something that is not an error.
 *
 * Colocated with the drop zone that needs it: this is DOM I/O, so it cannot
 * live in `lib/`, and it is not an external service either.
 */
export function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");

    const done = (value: number | null) => {
      URL.revokeObjectURL(url);
      probe.removeAttribute("src");
      resolve(value);
    };

    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      done(Number.isFinite(probe.duration) ? probe.duration : null);
    };
    probe.onerror = () => {
      done(null);
    };
    probe.src = url;
  });
}
