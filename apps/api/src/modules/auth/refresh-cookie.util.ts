import type { CookieOptions, Response } from "express";

export const REFRESH_COOKIE_NAME = "refresh_token";

/**
 * Options des cookies d'authentification httpOnly.
 *
 * En production, le frontend (Vercel) et l'API (Render) sont sur deux domaines
 * differents : le navigateur traite alors le cookie comme "tiers". Pour qu'il
 * soit accepte et renvoye en cross-site il faut SameSite=None + Secure.
 * En developpement (localhost), back et front partagent localhost et SameSite
 * doit rester "lax" pour que le cookie fonctionne en local sans HTTPS.
 */
export function cookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours, aligne sur JWT_REFRESH_TTL par defaut
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, cookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions());
}
