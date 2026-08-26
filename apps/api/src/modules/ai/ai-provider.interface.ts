/**
 * Interface pour le provider LLM / embeddings.
 *
 * Permet de remplacer Ollama par n'importe quel autre backend
 * (llama.cpp, vLLM, etc.) en implementant cette interface.
 */
export interface AiProvider {
  /** Genere un embedding pour le texte donne. Retourne un tableau de floats. */
  embed(text: string): Promise<number[]>;

  /** Genere des embeddings en lot (plus efficace qu'un par un). */
  embedBatch(texts: string[]): Promise<number[][]>;

  /** Genere une reponse du LLM a partir d'un prompt system + user. */
  generate(prompt: string, systemPrompt: string): Promise<string>;

  /** Verifie que le provider est joignable. */
  healthCheck(): Promise<boolean>;
}
