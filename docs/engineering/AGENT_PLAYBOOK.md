# Agent playbook — Maak Ola 1

## What this repo is

**Ola 1 = mock UI only** (Next.js clickable prototype on Vercel). No real DB, APIs, vendors, or adapters.

## Hard bans

- Never implement **Account / SPEI / CLABE / saldos** in this repo.
- Never paste SPEI navy/purple/gold into product UI (see `DESIGN_TOKENS.md`).
- **FaceBinding** is ola 2 — design the port if needed; do not ship vendor SDKs yet.

## Before non-trivial work

1. Read `DOMAIN.md` and `ARCHITECTURE.md`.
2. Follow matching `.cursor/rules/*`.
3. Keep **code English**, **UI Spanish** (`50-i18n-code-ui.mdc`).

## Data & session

- Mock data: `src/lib/data.ts`
- Session state: `src/lib/cases-context.tsx` (resets on reload)
- Site password gate ≠ RBAC (`AUTH_RBAC.md`)

## Validate

`npm run lint` · `npm run build` · smoke `/login` → onboarding → case → theme light/dark.
