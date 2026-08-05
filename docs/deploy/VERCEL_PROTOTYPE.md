# Deploy prototipo Maak a Vercel (Ola 1)

## Requisitos

- Cuenta Vercel de Ignacio
- Repo `ignacio-mts/maak`
- Variables de entorno:
  - `SITE_PASSWORD` — contraseña del gate
  - `SESSION_SECRET` — ≥32 caracteres (cookie iron-session)

## CLI (recomendado)

```bash
npx vercel login
npx vercel link   # proyecto personal, root del repo
npx vercel env add SITE_PASSWORD
npx vercel env add SESSION_SECRET
npx vercel --prod
```

## Git integration

1. Vercel → Add Project → import `ignacio-mts/maak`
2. Production branch: `main` (o la branch de ola 1 hasta merge)
3. Set env vars for Production + Preview
4. Deploy

## Smoke

1. Abrir URL → `/login`
2. Ingresar `SITE_PASSWORD`
3. Verificar banner “Prototipo”, theme toggle claro/oscuro, `/cases`, `/onboarding`, `/intake/[token]`

## Nota

El MCP/CLI de este cloud agent **no tiene credenciales Vercel**. El primer deploy productivo debe hacerse desde la máquina/cuenta de Ignacio (o pegando un `VERCEL_TOKEN` al entorno del agent).
