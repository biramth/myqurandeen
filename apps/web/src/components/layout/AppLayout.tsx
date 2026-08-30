import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { CelebrationHost } from "@/features/gamification/CelebrationHost";
import { InstallPrompt } from "@/features/pwa/InstallPrompt";

/**
 * Un clic sur une notification push ne peut pas naviguer directement dans
 * le SPA (le service worker n'a pas acces au routeur React) : il se
 * contente de focaliser/ouvrir un onglet puis poste ce message, que ce hook
 * relaie vers React Router - sinon l'onglet reste sur la page ou il etait.
 */
function useServiceWorkerNavigation() {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "notification-navigate" && typeof event.data.url === "string") {
        navigate(event.data.url);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [navigate]);
}

export function AppLayout() {
  useServiceWorkerNavigation();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <InstallPrompt />
      <CelebrationHost />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
