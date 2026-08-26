#!/bin/sh
# Demarre Ollama et telecharge les modeles requis en arriere-plan.

set -e

# Demarrer le serveur Ollama en arriere-plan
ollama serve &
OLLAMA_PID=$!

# Attendre que le serveur soit pret
echo "Attente du serveur Ollama..."
until ollama list > /dev/null 2>&1; do
  sleep 2
done
echo "Serveur Ollama pret."

# Telecharger le modele d'embeddings si absent
if ! ollama list 2>/dev/null | grep -q "nomic-embed-text"; then
  echo "Telechargement de nomic-embed-text..."
  ollama pull nomic-embed-text
  echo "nomic-embed-text termine."
fi

# Telecharger le modele LLM si absent
LLM_MODEL="${OLLAMA_LLM_MODEL:-qwen2.5:3b}"
if ! ollama list 2>/dev/null | grep -q "$LLM_MODEL"; then
  echo "Telechargement de $LLM_MODEL..."
  ollama pull "$LLM_MODEL"
  echo "$LLM_MODEL termine."
fi

echo "Tous les modeles sont prets."

# Attendre le processus Ollama
wait $OLLAMA_PID
