import {
  BookOpen,
  ScrollText,
  Scale,
  History,
  GraduationCap,
  HandHeart,
  Library,
  Route,
  Users,
  Lightbulb,
  Compass,
  Moon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

/**
 * Structure de navigation partagee entre la sidebar desktop et le menu
 * mobile, pour que les deux restent toujours synchronises. Le Tafsir
 * (accessible depuis le panneau lateral d'une sourate) et la Vie du
 * Prophete (une periode parmi d'autres dans Histoire) restent joignables
 * via leurs pages respectives mais n'ont pas d'entree dediee ici, pour
 * eviter la redondance.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: "nav.groupTexts",
    items: [
      { labelKey: "nav.quran", href: "/quran", icon: BookOpen },
      { labelKey: "nav.hadith", href: "/hadith", icon: ScrollText },
      { labelKey: "nav.duas", href: "/duas", icon: HandHeart },
      { labelKey: "nav.prayerTimes", href: "/prayer-times", icon: Compass },
      { labelKey: "nav.ramadan", href: "/ramadan", icon: Moon },
    ],
  },
  {
    titleKey: "nav.groupKnowledge",
    items: [
      { labelKey: "nav.fiqh", href: "/schools", icon: Scale },
      { labelKey: "nav.history", href: "/history", icon: History },
      { labelKey: "home.categories.prophets.label", href: "/prophets", icon: Users },
      { labelKey: "home.categories.scholars.label", href: "/scholars", icon: GraduationCap },
      { labelKey: "home.categories.concepts.label", href: "/concepts", icon: Lightbulb },
    ],
  },
  {
    titleKey: "nav.groupLearn",
    items: [
      { labelKey: "home.categories.learning.label", href: "/learn", icon: Route },
      { labelKey: "nav.library", href: "/library", icon: Library },
    ],
  },
];
