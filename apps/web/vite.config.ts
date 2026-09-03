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
        // Forme fonction plutot que la forme objet (qui ne capturait pas
        // react-dom : ses sous-modules CJS - react-dom-client.production.js
        // etc., empaquetes via des modules virtuels ?commonjs-* - ne
        // matchaient pas le nom de paquet "react-dom" tel quel, et
        // finissaient dans le chunk principal malgre la config precedente).
        // `id.includes(...)` matche le chemin complet, fiable quelle que
        // soit la forme du module. Coeur du framework : change rarement, se
        // met en cache long terme independamment du reste de l'app.
        manualChunks(id) {
          if (
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler")
          ) {
            return "vendor-react";
          }
          // Bibliotheques tierces stables, utilisees sur de nombreuses pages :
          // regroupes en chunks vendor dedies pour un cache HTTP long terme
          // (pas de re-telechargement si ces libs ne changent pas d'un
          // deploiement a l'autre - l'app elle-meme porte alors un hash
          // different sans invalider ce cache). Ne change pas le poids du
          // premier chargement (le total est identique), seulement sa
          // repartition entre fichiers.
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
            return "vendor-i18n";
          }
          if (
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/@radix-ui") ||
            id.includes("node_modules/@floating-ui") ||
            id.includes("node_modules/lucide-react")
          ) {
            return "vendor-ui";
          }
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/@hookform") ||
            id.includes("node_modules/zod")
          ) {
            return "vendor-forms";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "vendor-query";
          }
        },
      },
    },
  },
});
