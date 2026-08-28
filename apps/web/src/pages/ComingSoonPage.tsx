import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function ComingSoonPage({ title, description, icon: Icon = Construction }: ComingSoonPageProps) {
  useDocumentTitle(title);
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <Icon className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
