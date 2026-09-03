import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

/**
 * Marque la position de lecture courante du khatm en cours - meme geste que
 * "reprendre ou j'en etais" (1.2), le service en deduit `versesCompleted`
 * plutot que de l'accepter directement en entree.
 */
export class UpsertKhatmProgressDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(286) // la plus longue sourate (Al-Baqara) compte 286 versets
  verseNumber!: number;
}
