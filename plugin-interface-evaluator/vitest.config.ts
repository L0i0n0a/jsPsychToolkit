import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",       // simuliert einen Browser (document, window, etc.)
    globals: true,              // expect(), describe(), it() ohne Import
    setupFiles: ["./src/__tests__/setup.ts"],
    exclude: ["src/index.spec.ts", "node_modules/**"],
  },
});