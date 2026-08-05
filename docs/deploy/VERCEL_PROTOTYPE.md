# Deploy prototipo Maak a Vercel (Ola 1)

## URL compartible (producción)

- **https://maak-lyart.vercel.app**
- Proyecto Vercel: `ignacios-projects-9e7753d2/maak`
- Contraseña del gate de app: `loqueviene`
- Candado = `/login` (iron-session), **no** Vercel Password Protection

## Candado = frontend (no Vercel Password Protection)

El acceso al prototipo es un **lock de app** con `iron-session`:

- UI: `/login`
- Proxy: `src/proxy.ts`
- Env opcional: `SITE_PASSWORD` (default en código: `loqueviene`)
- Env opcional: `SESSION_SECRET` (≥32; hay fallback de prototipo)

**No uses** Vercel → Deployment Protection / Password Protection / Vercel Authentication. Eso es plan Pro y **no** es el diseño acordado. El Hobby plan alcanza: deploy público + candado en Next.js.

## Opción recomendada — Import GitHub (sin CLI)

1. Entrá a [vercel.com/new](https://vercel.com/new) con tu cuenta personal (Hobby).
2. Importá `ignacio-mts/maak`.
3. Root del proyecto = repo root. Framework: Next.js.
4. Branch de producción: `main` (o `imieites/ola1-vercel-cursor-ds-9122` hasta merge).
5. **Environment Variables** (opcionales si usás los defaults de prototipo):
   - `SITE_PASSWORD` = `loqueviene`
   - `SESSION_SECRET` = string ≥32 (recomendado en deploys compartidos)
6. Deploy.
7. **Settings → Deployment Protection:** dejalo **apagado** / Standard Protection off para Production si aparece. El gate es `/login`.

Smoke: abrir URL → redirige a `/login` → contraseña `loqueviene` → BO con theme toggle.

## Opción B — CLI (solo si ya estás logueado en tu máquina)

```bash
npx vercel login          # en tu laptop, no requiere plan Pro
export SITE_PASSWORD=loqueviene
export SESSION_SECRET="$(openssl rand -base64 48)"
./scripts/deploy-vercel-prototype.sh
```

El cloud agent **no** puede completar `vercel login` device OAuth de forma fiable; preferí el import GitHub arriba.

## Opción C — GitHub Actions

`.github/workflows/deploy-vercel.yml` — necesita `VERCEL_TOKEN` + org/project ids (token de cuenta, Hobby OK). El gate sigue siendo `SITE_PASSWORD`, no Deployment Protection.

## Compartir con el equipo

- URL de Vercel + contraseña `loqueviene`
- Banner “Prototipo” visible en la shell
- No es RBAC; se retira cuando haya IdP (ola 2)
