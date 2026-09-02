import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Github, Heart, Scale, Sparkles } from "lucide-react";
import { PageMeta } from "@/components/shared/PageMeta";

const GITHUB_URL = "https://github.com/biramth/myqurandeen";
const CONTRIBUTING_URL = `${GITHUB_URL}/blob/main/CONTRIBUTING.md`;

interface Section {
  icon: typeof Heart;
  key: string;
}

const SECTIONS: Section[] = [
  { icon: Heart, key: "free" },
  { icon: BadgeCheck, key: "sources" },
  { icon: Sparkles, key: "ai" },
  { icon: Scale, key: "neutrality" },
];

/**
 * Page de confiance/pitch : pourquoi myQurandeen, sans hierarchie de
 * "verite" imposee sur les sujets a divergence, sourcing systematique
 * (cf. CONTRIBUTING.md), ad-free, open-source. Reutilisable telle quelle
 * comme pitch pour des partenariats (mosquees/assos) et comme contenu de
 * reference pour la presence reseaux sociaux (voir ROADMAP.md 1.3).
 */
export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <PageMeta title={t("about.title")} description={t("about.subtitle")} />

      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("about.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("about.subtitle")}</p>
      </div>

      <div className="mt-12 space-y-10">
        {SECTIONS.map(({ icon: Icon, key }) => (
          <section key={key}>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              {t(`about.sections.${key}.title`)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`about.sections.${key}.body`)}</p>
          </section>
        ))}

        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Github className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("about.sections.openSource.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("about.sections.openSource.body")}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
              {t("about.githubLink")}
            </a>
            <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
              {t("about.contributingLink")}
            </a>
          </div>
        </section>
      </div>

      <div className="mt-14 text-center">
        <Link to="/" className="text-sm text-primary hover:underline">
          {t("about.backHome")}
        </Link>
      </div>
    </div>
  );
}
