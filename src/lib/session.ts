import type { SessionOptions } from "iron-session";

export type SiteSession = {
  isLoggedIn: boolean;
};

export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters long",
    );
  }

  return {
    password,
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
