import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  // `vite` s'execute avec cwd = apps/web : sans ceci, Vite chercherait un
  // .env dans apps/web (inexistant) et VITE_API_URL resterait indefini en
  // dev, faisant retomber apiClient sur "/api" - un chemin que ce serveur
  // dev ne sait pas servir (pas de proxy), d'ou un fallback silencieux vers
  // index.html au lieu du JSON attendu. Meme logique que l'envFilePath
  // explicite d'AppModule cote API (voir apps/api/src/app.module.ts).
  envDir: path.resolve(__dirname, "../.."),
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
