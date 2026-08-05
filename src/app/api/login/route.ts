import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getSessionOptions,
  getSitePassword,
  type SiteSession,
} from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;

  const submitted = body?.password ?? "";
  const expected = getSitePassword();

  if (!expected || submitted !== expected) {
    return NextResponse.json(
      { ok: false, error: "Contraseña incorrecta" },
      { status: 401 },
    );
  }

  const session = await getIronSession<SiteSession>(
    await cookies(),
    getSessionOptions(),
  );
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
