/**
 * Jeton d'acces conserve uniquement en memoire (jamais en localStorage) -
 * voir apps/api/src/modules/auth. Le refresh token vit dans un cookie
 * httpOnly, inaccessible en JS.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
};
