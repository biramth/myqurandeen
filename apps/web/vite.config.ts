import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    // `ANALYZE=1 npm run build -w apps/web` genere dist/stats.html pour
    // inspecter la repartition du bundle - desactive par defaut (aucun cout
    // sur un build normal).
    process.env.ANALYZE ? visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true }) : null,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Coeur du framework : change rarement, se met en cache long terme
          // independamment du reste de l'app.
          "vendor-react": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
