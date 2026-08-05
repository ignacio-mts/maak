# Deploy prototipo Maak a Vercel (Ola 1)

## Requisitos

- Cuenta Vercel de Ignacio
- Repo `ignacio-mts/maak`
- Variables de entorno:
  - `SITE_PASSWORD` — contraseña del gate
  - `SESSION_SECRET` — ≥32 caracteres (cookie iron-session)

## Opción A — Script (recomendado)

```bash
npx vercel login
export SITE_PASSWORD='…'          # compartir al equipo por canal seguro
export SESSION_SECRET="$(openssl rand -base64 48)"
./scripts/deploy-vercel-prototype.sh
```

El script linkea el proyecto, sube env vars (production + preview) y hace `vercel --prod`.

## Opción B — CLI manual

```bash
npx vercel login
npx vercel link   # proyecto personal, root del repo
npx vercel env add SITE_PASSWORD
npx vercel env add SESSION_SECRET
npx vercel --prod
```

## Opción C — Git integration

1. Vercel → Add Project → import `ignacio-mts/maak`
2. Production branch: `main` (o la branch de ola 1 hasta merge)
3. Set env vars for Production + Preview
4. Deploy

## Opción D — GitHub Actions

Workflow: `.github/workflows/deploy-vercel.yml` (`workflow_dispatch`).

Secrets de repo (admin):

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Env del gate: preferir Vercel Project → Environment Variables (`SITE_PASSWORD`, `SESSION_SECRET`).

## Cloud agent

Este entorno **no** tiene credenciales Vercel (MCP `needsAuth`; sin `VERCEL_TOKEN`).

Para desbloquear desde el agent:

1. En el agent: `npx vercel login` → abre el device URL que imprime
2. En tu browser (cuenta Ignacio): autorizar el device code
3. En el agent:

```bash
export SITE_PASSWORD='…'
export SESSION_SECRET="$(openssl rand -base64 48)"
./scripts/deploy-vercel-prototype.sh
```

O pegá un `VERCEL_TOKEN` (Account → Tokens) en el entorno del agent y corré el mismo script.

## Smoke

1. Abrir URL → `/login`
2. Ingresar `SITE_PASSWORD`
3. Verificar banner “Prototipo”, theme toggle claro/oscuro, `/cases`, `/onboarding`, `/client/cc`, `/intake/[token]`

## Nota producto

El password gate **no** es RBAC. Es candado de sitio del prototipo hasta IdP real (ola 2).
