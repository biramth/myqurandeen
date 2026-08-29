import {
  AlarmClock,
  CloudLightning,
  Droplet,
  Flame,
  Heart,
  HelpCircle,
  Home,
  LifeBuoy,
  type LucideIcon,
  MessageCircle,
  Moon,
  MoonStar,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Sunrise,
  Sunset,
  UtensilsCrossed,
  Volume2,
} from "lucide-react";

/** Icone illustrative par categorie (purement decorative, sans donnee associee en base). */
export const DUA_CATEGORY_ICONS: Record<string, LucideIcon> = {
  matin: Sunrise,
  soir: Sunset,
  "apres-la-priere": Sparkles,
  "avant-de-dormir": Moon,
  "au-reveil": AlarmClock,
  repas: UtensilsCrossed,
  toilettes: Droplet,
  maison: Home,
  voyage: Plane,
  "detresse-et-anxiete": LifeBuoy,
  "apres-adhan": Volume2,
  salawat: Sparkles,
  protection: ShieldCheck,
  "visite-malade": Stethoscope,
  mariage: Heart,
  colere: Flame,
  marche: ShoppingBag,
  "phenomenes-naturels": CloudLightning,
  "nouvelle-lune": MoonStar,
  eternuement: MessageCircle,
};

export function getDuaCategoryIcon(slug: string): LucideIcon {
  return DUA_CATEGORY_ICONS[slug] ?? HelpCircle;
}
