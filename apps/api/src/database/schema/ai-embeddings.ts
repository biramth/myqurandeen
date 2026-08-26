import { index, integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";

/**
 * Table pgvector pour stocker les embeddings et le contenu indexe par le RAG.
 *
 * Chaque ligne represente un "chunk" de texte extrait d'une entite de la base
 * (verset, hadith, tafsir, concept, etc.) accompagne de son embedding
 * vectoriel et de metadonnees permettant de retrouver la source originale.
 */
export const aiEmbeddings = pgTable(
  "ai_embeddings",
  {
    id: id(),
    /** Type d'entite source (verse, hadith, tafsir, concept, scholar, prophet, event, school, fiqh_position). */
    contentType: varchar("content_type", { length: 40 }).notNull(),
    /** ID de l'entite source dans la table correspondante. */
    contentId: uuid("content_id").notNull(),
    /** Texte brut du chunk indexe. */
    contentText: text("content_text").notNull(),
    /** Texte de contexte additionnel (titre de sourate, nom de collection, etc.) */
    contextText: text("context_text"),
    /** Metadonnees JSON (numero de verset, collection, auteur, etc.) */
    metadata: text("metadata"),
    /** Dimension de l'embedding (doit correspondre a OLLAMA_EMBEDDING_DIM). */
    embeddingDim: integer("embedding_dim").notNull(),
    /** Vecteur d'embedding genere par le modele (stocke comme array de floats). */
    embedding: text("embedding").notNull(),
    ...timestamps,
  },
  (t) => [
    index("ai_embeddings_content_type_idx").on(t.contentType),
    index("ai_embeddings_content_id_idx").on(t.contentId),
  ],
);

/**
 * Type brut d'une ligne d'embedding (avant mapping Drizzle).
 */
export type AiEmbeddingRow = typeof aiEmbeddings.$inferSelect;
