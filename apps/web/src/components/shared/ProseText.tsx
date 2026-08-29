import { cn } from "@/lib/utils";

interface ProseTextProps {
  text: string;
  className?: string;
  dir?: "rtl" | "ltr";
}

/**
 * Rendu de texte long (biographies, evenements historiques, explications de
 * concepts...) qui coupe sur les doubles sauts de ligne ("\n\n") pour
 * produire de vrais paragraphes espaces. Sans ca, un <p> unique affiche le
 * texte source comme un seul bloc compact : HTML collapse les \n en un
 * simple espace, les paragraphes voulus dans le contenu ne se voient donc
 * jamais a l'ecran. Taille de texte et interlignage legerement plus genereux
 * que le texte d'interface (text-sm) pour une lecture longue plus confortable.
 */
export function ProseText({ text, className, dir }: ProseTextProps) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return (
    <div dir={dir} className={cn("space-y-4 text-[15px] leading-[1.75] text-foreground/90", className)}>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}
