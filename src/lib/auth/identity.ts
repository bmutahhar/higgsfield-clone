/*
 * There is no profile to read, so a display name is derived from the address.
 * Pure and deterministic: the same email always renders the same name, which
 * is what makes the header look stable across reloads.
 */

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean);
  if (words.length === 0) return "Creator";
  return words
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
