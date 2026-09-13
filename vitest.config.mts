import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/*
 * Node environment only. The units worth testing here — validation, the
 * session codec, the user store, the route handlers — are all plain
 * TypeScript; none of them touch the DOM. Adding jsdom and React Testing
 * Library to cover the components would be a far larger dependency footprint
 * than this surface justifies, so components are verified in the browser
 * instead.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
