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
- Frontend site gate (`iron-session` `/login`) — **not** Vercel Deployment Protection. Default password `loqueviene` (`SITE_PASSWORD` override). `SESSION_SECRET` ≥32 recommended for shared deploys (prototype fallback exists). Next.js 16 uses `src/proxy.ts` (not `middleware.ts`). Public: `/login`, `/api/login`, `/api/health`.
- UI direction: Cursor-like tool UI with first-class light/dark themes. Docs under `docs/13_*` are domain/flow sources, not visual tokens. Do not reintroduce SPEI navy/purple/gold product theming.
- Smoke-test: `/login` → `/onboarding` → create case → open `/cases/[id]` → simulate verification; also check theme toggle in light and dark.

## Agent playbook

Before non-trivial work, read `docs/engineering/AGENT_PLAYBOOK.md` and matching `.cursor/rules/*`.
For UI/UX decisions, read **`docs/ux/UX_PATTERNS.md`** and `docs/ux/UXDR-*.md` — do not re-ask the user for settled patterns.
Never implement Account/SPEI/CLABE/saldos in this repo. Face/liveness only via `FaceBinding` adapters (ola 2).
