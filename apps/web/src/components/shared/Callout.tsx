import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  icon?: LucideIcon;
  label?: string;
  children: React.ReactNode;
  className?: string;
  dir?: "rtl" | "ltr";
}

/**
 * Encart colore (bordure gauche + fond teinte) pour faire ressortir une
 * information secondaire mais importante d'un bloc de texte long : merite
 * d'une invocation, explication d'une divergence de fiqh, source citee...
 * Reprend le meme traitement visuel deja utilise pour "Pourquoi existe-t-il
 * une divergence ?" sur les pages de fiqh, generalise en composant partage.
 */
export function Callout({ icon: Icon, label, children, className, dir }: CalloutProps) {
  return (
    <div
      dir={dir}
      className={cn(
        "rounded-md border-s-4 border-s-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/90",
        className,
      )}
    >
      {label && (
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
