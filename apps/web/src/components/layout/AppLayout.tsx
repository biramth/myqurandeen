import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { CelebrationHost } from "@/features/gamification/CelebrationHost";
import { InstallPrompt } from "@/features/pwa/InstallPrompt";
import { NotificationOnboardingModal } from "@/features/onboarding/NotificationOnboardingModal";
import { OfflineBanner } from "@/features/offline/OfflineBanner";
import { useOfflineServiceWorker } from "@/features/offline/useOfflineServiceWorker";

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
  useOfflineServiceWorker();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <OfflineBanner />
      <InstallPrompt />
      <NotificationOnboardingModal />
      <CelebrationHost />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
