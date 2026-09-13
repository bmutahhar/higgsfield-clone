import type { Provider } from "@/types/auth.types";

/*
 * lucide-react carries no vendor logos, and these buttons now actually
 * authenticate — labelling a provider's own sign-in button with its mark is
 * the conventional, intended use. (The auth-gate placeholder this replaces
 * substituted neutral glyphs because nothing there signed anyone in.)
 */
export function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M19.6 10.23c0-.7-.06-1.37-.18-2H10v3.79h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.31Z"
        />
        <path
          fill="#34A853"
          d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H1.07v2.58A10 10 0 0 0 10 20Z"
        />
        <path
          fill="#FBBC05"
          d="M4.41 11.9a6 6 0 0 1 0-3.8V5.52H1.07a10 10 0 0 0 0 8.96l3.34-2.58Z"
        />
        <path
          fill="#EA4335"
          d="M10 3.98c1.47 0 2.79.5 3.82 1.5l2.87-2.87C14.96.99 12.7 0 10 0A10 10 0 0 0 1.07 5.52L4.4 8.1C5.2 5.74 7.4 3.98 10 3.98Z"
        />
      </svg>
    );
  }

  if (provider === "apple") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M14.02 10.62c.02-1.9 1.55-2.81 1.62-2.85-.88-1.29-2.26-1.47-2.75-1.49-1.17-.12-2.28.69-2.87.69-.6 0-1.5-.67-2.47-.65-1.27.02-2.44.74-3.1 1.87-1.32 2.3-.34 5.7.95 7.56.63.91 1.38 1.93 2.36 1.9.95-.04 1.31-.62 2.45-.62s1.47.62 2.47.6c1.02-.02 1.67-.93 2.29-1.85.72-1.06 1.02-2.09 1.04-2.14-.02-.01-2-.77-2.02-3.02M12.15 4.9c.52-.64.87-1.52.77-2.4-.75.03-1.66.5-2.2 1.13-.48.56-.9 1.46-.79 2.32.84.07 1.7-.42 2.22-1.05" />
      </svg>
    );
  }

  if (provider === "microsoft") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path fill="#F25022" d="M1 1h8.5v8.5H1z" />
        <path fill="#7FBA00" d="M10.5 1H19v8.5h-8.5z" />
        <path fill="#00A4EF" d="M1 10.5h8.5V19H1z" />
        <path fill="#FFB900" d="M10.5 10.5H19V19h-8.5z" />
      </svg>
    );
  }

  return null;
}
