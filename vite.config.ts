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
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
