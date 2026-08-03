<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Maak is a single, self-contained Next.js 16 (App Router) + TypeScript + Tailwind clickable prototype. There is no database, backend, or external integration — all data is mocked in `src/lib/data.ts` and per-session state lives in React context (`src/lib/cases-context.tsx`).

Standard commands are in `package.json` (`dev`, `build`, `start`, `lint`); the update script already runs `npm install`. Notes:
- Dev server: `npm run dev` (Turbopack) serves on `http://localhost:3000`. There is no automated test suite, so validate changes via `npm run lint`, `npm run build`, and manual UI checks.
- App state is in-memory only: cases created through `/onboarding` reset on full page reload/server restart. Exercise flows within a single browser session.
- Code is written in English; UI copy is in Spanish. Key routes are documented in `README.md`.
- Site password gate (`iron-session`): requires `SITE_PASSWORD` and `SESSION_SECRET` (≥32 chars) in `.env.local` (see `.env.example`). Next.js 16 uses `src/proxy.ts` (not `middleware.ts`) to redirect unauthenticated traffic to `/login`. `/login` and `/api/login` are public; everything else needs a valid session cookie.
