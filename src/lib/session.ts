import type { SessionOptions } from "iron-session";

export type SiteSession = {
  isLoggedIn: boolean;
};

/** Site gate password. Prefer SITE_PASSWORD env; fallback for prototype deploys. */
export function getSitePassword(): string {
  return process.env.SITE_PASSWORD || "loqueviene";
}

/**
 * Cookie encryption key (≥32 chars). Prefer SESSION_SECRET env.
 * Fallback keeps personal prototype deploys working when Vercel env vars
 * are not configured yet — rotate via env for anything shared beyond that.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  return "maak-prototype-session-secret-change-me!!";
}

export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: "maak_site_session",
    ttl: 60 * 60 * 24 * 14, // 14 days
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}
