import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Github } from "lucide-react";

const GITHUB_URL = "https://github.com/biramth/myqurandeen";

/**
 * Pied de page global : lien vers la page "Pourquoi myQurandeen" (voir
 * ROADMAP.md 1.3) et le depot GitHub - pas seulement accessible par URL
 * directe. Rendu a l'interieur de <main> (AppLayout), qui reserve deja la
 * place necessaire pour la barre de navigation mobile fixe (BottomNav).
 */
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span>myQurandeen</span>
        <Link to="/about" className="hover:text-foreground hover:underline">
          {t("footer.about")}
        </Link>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:text-foreground hover:underline"
        >
          <Github className="h-3.5 w-3.5" aria-hidden="true" />
          GitHub
        </a>
      </div>
    </footer>
  );
}
