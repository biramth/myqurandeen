import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
          <AppToaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
