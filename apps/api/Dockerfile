# Build multi-stage - image de production pour l'API NestJS.
# Le contexte de build doit etre la racine du monorepo (voir docker-compose.yml).

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/ packages/shared/
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build -w packages/shared \
 && npm run build -w apps/api

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
# Police Amiri (WOFF OG) - nest build ne copie pas les assets non-code.
COPY --from=build /app/apps/api/assets ./apps/api/assets
# npm hoiste la plupart des dependances a la racine, mais choisit parfois de
# garder un paquet niche dans apps/api/node_modules (son propre algorithme,
# pas toujours previsible) - sans cette ligne, "Cannot find module" au
# demarrage des lors qu'un paquet atterrit la plutot qu'a la racine.
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
