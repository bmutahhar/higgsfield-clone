/*
 * There is no profile to read, so a display name and an avatar colour are
 * derived from the address. Both are pure and deterministic: the same email
 * always renders the same avatar, which is what makes the header look stable
 * across reloads.
 */

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean);
  if (words.length === 0) return "Creator";
  return words
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function avatarHue(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) % 360;
  }
  return hash;
}
