import type { CookieOptions, Response } from "express";

export const REFRESH_COOKIE_NAME = "refresh_token";

function cookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours, aligne sur JWT_REFRESH_TTL par defaut
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, cookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
}
