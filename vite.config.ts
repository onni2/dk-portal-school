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
      // Forward /nexus-ms/* to the Nexus plugout server (card channel create + ping)
      "/nexus-ms": {
        target: "https://ms.audkenni.is/plugout-server-4.25.4/api/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nexus-ms/, ""),
        secure: true,
      },
      "/audkenni": {
        target: "https://to5vx.audkenni.is:443/sso",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/audkenni/, ""),
        secure: true,
        cookieDomainRewrite: "",
        configure: (proxy) => {
          // Strip cookies from POST /authenticate requests (steps 1–3) so a
          // stale audsso cookie from a previous session never interferes.
          // GET requests (step 4 OAuth2 redirect) still carry cookies.
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.method === "POST" && req.url?.includes("/authenticate")) {
              proxyReq.removeHeader("cookie");
            }
          });
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
