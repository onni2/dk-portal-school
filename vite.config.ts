import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    proxy: {
      // Forward /api/v1/* to DK's API server — avoids CORS in development
      "/api/v1": {
        target: "https://api.dkplus.is",
        changeOrigin: true,
        secure: true,
      },
      // Forward /audkenni/* to Auðkenni test server.
      // cookieDomainRewrite rewrites Set-Cookie Domain so the browser stores
      // the audsso session cookie for localhost (needed between steps 1→2→3).
      // Siggi's note: Auðkenni warns not to let the HTTP handler ACCUMULATE
      // cookies across sessions — cookieDomainRewrite:"" prevents that by
      // stripping the Domain attribute, scoping cookies to the current session only.
      "/audkenni": {
        target: "https://to5vx.audkenni.is:443/sso",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/audkenni/, ""),
        secure: true,
        cookieDomainRewrite: "",
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
