# Maak

Prototipo clickable del sistema de gestión de clientes (SGC / onboarding de personas) de STP.

Maak certifica **persona verificada** (expediente, KYC/KYB/PLD, casos de revisión). No opera saldos ni SPEI. La cuenta **activa** vive en el core (transición vía adapter SICLI/EF).

## Ola 1 — Prototipo Vercel

- UI **Cursor-like** con **light / dark** mode
- Candado de frontend (`iron-session` en `/login`) — **no** Vercel Password Protection
- Contraseña del prototipo: `loqueviene` (override con `SITE_PASSWORD`)
- Deploy Hobby: [`docs/deploy/VERCEL_PROTOTYPE.md`](docs/deploy/VERCEL_PROTOTYPE.md) (import GitHub)
- Datos mock en memoria (sin API persistente todavía)

```bash
npm install
cp .env.example .env.local   # SITE_PASSWORD=loqueviene; SESSION_SECRET opcional en local
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) → `/login` → `loqueviene`.

## Rutas (código en inglés · UI en español)

| Ruta | Pantalla |
|------|----------|
| `/` | Inicio / atajos de flujos |
| `/cases` | Cola de casos (filtros PM / PF / CC) |
| `/cases/[id]` | Detalle: proceso, tiempos, pendientes, acciones |
| `/onboarding` | Alta asistida E2E (moral, física, centro de costo) |
| `/ingestion` | Agente: correo → caso |
| `/people` | Personas verificadas |
| `/rules` | Configuración de reglas + vista previa de impacto |
| `/intake/[token]` | Enlace write-only para el cliente |
| `/client/cc` | Vista cliente mock — alta CC bajo padre autorizado |
| `/login` | Password gate del prototipo |

## Flujos

1. **Persona moral** — datos → documentos → riesgo → firma → verificación  
2. **Persona física** — datos → identidad (INE) → listas → firma → verificación  
3. **Centro de costo** — vínculo al padre → GE → listas → verificación  
4. **Reglas** — publicar cambio con preview de reproceso por cohorte  

## Ingeniería / agentes

- [`docs/engineering/`](docs/engineering/) — dominio, arquitectura, tokens, RBAC, FaceBinding, playbook
- [`docs/prd/`](docs/prd/) — charter MVP + access control
- [`docs/adr/`](docs/adr/) — decisiones (rules engine, Fargate, face)
- [`docs/jira/MAAK_BOARD_SETUP.md`](docs/jira/MAAK_BOARD_SETUP.md) — setup tablero Jira (único SoT)
- [`docs/openapi/maak-onboarding.v0.yaml`](docs/openapi/maak-onboarding.v0.yaml) — contrato borrador (ola 2)
- `.cursor/rules/` — reglas always-on para agentes

Docs HTML `docs/13_*` = **flujos/dominio**, no tokens visuales.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind 4 + Geist. Ola 1: sin DB. Ola 2: OpenAPI + RBAC + Fargate (ver plan).
