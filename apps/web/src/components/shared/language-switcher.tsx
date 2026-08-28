import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";
import { languageAutonym } from "@/lib/languages";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
      <SelectTrigger className="h-10 w-auto gap-1.5 border-none bg-transparent px-2 shadow-none" aria-label={t("nav.language")}>
        <Languages className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageAutonym(lang)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
