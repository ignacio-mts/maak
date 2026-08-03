<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Maak is a single Next.js 16 (App Router, Turbopack) clickable prototype — no database, no backend services, and no environment variables. Dependencies are refreshed by the startup update script (`npm ci`), so no manual install is needed.

- Scripts live in `package.json`: `npm run dev` (dev server on port 3000), `npm run build`, `npm run lint` (flat-config ESLint), `npm start`.
- All data is mock/in-memory: seed data in `src/lib/data.ts`, session state in the React context `src/lib/cases-context.tsx`. Cases you create through the UI (e.g. via `/onboarding`) live only in client memory and reset on a full page reload — don't expect them to persist across navigations that remount the app or across restarts.
- Code identifiers are in English; the UI copy is in Spanish. Core flow to smoke-test: `/onboarding` → pick a persona type → fill data → check required docs → "Crear caso en revisión", then "Simular hasta verificación" to reach a verified case.
