import type { ArabicLetter } from "./arabic-letters-data";

/** Tatweel (ـ, U+0640) : force le moteur de rendu arabe a choisir la forme connectee, sans avoir a saisir de codepoint de "presentation form" a la main. */
const TATWEEL = "ـ";

interface DerivedForms {
  isolated: string;
  initial: string | null;
  medial: string | null;
  final: string | null;
}

function deriveForms(letter: ArabicLetter): DerivedForms {
  if (!letter.connectsToNext) {
    // Lettre non-attachante (ا د ذ ر ز و) : seulement 2 formes reelles existent.
    return { isolated: letter.char, initial: null, medial: null, final: `${TATWEEL}${letter.char}` };
  }
  return {
    isolated: letter.char,
    initial: `${letter.char}${TATWEEL}`,
    medial: `${TATWEEL}${letter.char}${TATWEEL}`,
    final: `${TATWEEL}${letter.char}`,
  };
}

/**
 * Tableau des formes d'une ou plusieurs lettres arabes selon leur position
 * dans le mot (isolee/initiale/mediale/finale) - coeur pedagogique du cours
 * de lecture (ROADMAP.md, phase "apprendre a lire l'arabe coranique) :
 * l'ecriture arabe etant cursive, une meme lettre change de forme graphique
 * selon qu'elle commence, continue ou termine un mot (ou reste isolee).
 * Les formes sont deduites via `deriveForms` (tatweel), jamais saisies a la
 * main - garantit qu'elles restent coherentes avec le rendu reel utilise
 * partout ailleurs sur le site pour le texte arabe.
 */
export function LetterFormsTable({ letters }: { letters: ArabicLetter[] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-center">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="px-2 py-2 font-medium">Nom</th>
            <th className="px-2 py-2 font-medium">Isolée</th>
            <th className="px-2 py-2 font-medium">Initiale</th>
            <th className="px-2 py-2 font-medium">Médiane</th>
            <th className="px-2 py-2 font-medium">Finale</th>
            <th className="px-2 py-2 font-medium">Son</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {letters.map((letter) => {
            const forms = deriveForms(letter);
            return (
              <tr key={letter.char}>
                <td className="px-2 py-3 text-sm font-medium">{letter.name}</td>
                <td dir="rtl" lang="ar" className="font-arabic px-2 py-3 text-2xl">
                  {forms.isolated}
                </td>
                <td dir="rtl" lang="ar" className="font-arabic px-2 py-3 text-2xl">
                  {forms.initial ?? <span className="text-sm text-muted-foreground/50">—</span>}
                </td>
                <td dir="rtl" lang="ar" className="font-arabic px-2 py-3 text-2xl">
                  {forms.medial ?? <span className="text-sm text-muted-foreground/50">—</span>}
                </td>
                <td dir="rtl" lang="ar" className="font-arabic px-2 py-3 text-2xl">
                  {forms.final}
                </td>
                <td className="px-2 py-3 text-xs text-muted-foreground">{letter.sound}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
