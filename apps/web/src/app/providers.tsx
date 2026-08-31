import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AuthProvider } from "@/features/auth/auth-context";
import { AppToaster } from "@/components/shared/AppToaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    // HelmetProvider seul ici (pas de <PageMeta/> de secours a ce niveau) :
    // un Helmet permanent monte en parallele d'un Helmet de page entrait en
    // conflit sous React.StrictMode (double montage), les deux jeux de
    // balises coexistant dans le head au lieu que le second remplace le
    // premier - la balise generique gagnait alors en pratique (premiere du
    // DOM). Le filet de securite sitewide vit desormais dans index.html
    // (balises statiques), pas ici - voir PageMeta.tsx pour le detail.
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>{children}</AuthProvider>
            <AppToaster />
          </BrowserRouter>
          {/* N'envoie des donnees que sur un deploiement Vercel reel (silencieux
              en local/autre hebergeur) - aucun cookie, conforme RGPD sans bandeau. */}
          <Analytics />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
