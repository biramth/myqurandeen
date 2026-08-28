import { Toaster } from "sonner";
import { useTheme } from "./theme-provider";

/**
 * Notifications de confirmation/erreur pour les actions asynchrones (favoris,
 * notes, collections, admin...) - avant ce composant, aucune mutation de
 * l'app n'affichait de retour visuel en cas de succes ou d'echec.
 */
export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "!bg-card !text-card-foreground !border-border",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}
