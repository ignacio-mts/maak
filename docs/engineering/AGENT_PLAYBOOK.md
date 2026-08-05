# Agent playbook — Maak Ola 1

## What this repo is

**Ola 1 = mock UI only** (Next.js clickable prototype on Vercel). No real DB, APIs, vendors, or adapters.

## Hard bans

- Never implement **Account / SPEI / CLABE / saldos** in this repo.
- Never paste SPEI navy/purple/gold into product UI (see `DESIGN_TOKENS.md`).
- **FaceBinding** is ola 2 — design the port if needed; do not ship vendor SDKs yet.

## Before non-trivial work

1. Read `DOMAIN.md` and `ARCHITECTURE.md`.
2. For UI/UX: read `docs/ux/UX_PATTERNS.md` (and relevant `docs/ux/UXDR-*.md`).
3. Follow matching `.cursor/rules/*` (esp. `40-frontend`, `41-onboarding-ux`).
4. Keep **code English**, **UI Spanish** (`50-i18n-code-ui.mdc`).
5. New UX decision → add UXDR from `docs/ux/TEMPLATE_UXDR.md` + update patterns (see `docs/ux/README.md`).

## Data & session

- Mock data: `src/lib/data.ts`
- Session state: `src/lib/cases-context.tsx` (resets on reload)
- Site password gate ≠ RBAC (`AUTH_RBAC.md`)

## Validate

`npm run lint` · `npm run build` · smoke `/login` → onboarding → case → theme light/dark.
