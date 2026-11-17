import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the built site be opened from any folder or hosted under a sub-path (e.g. GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { chunkSizeWarningLimit: 3000 },
});
