# API contracts (ola 2)

## Source of truth (draft)

OpenAPI draft: [`docs/openapi/maak-onboarding.v0.yaml`](../openapi/maak-onboarding.v0.yaml)

Tags: **Personas**, **Cases**, **IntakeLinks**, **Memberships**, **Bindings**, **Adapter**.

Security: OAuth2 `clientCredentials` with scopes `cases:hitl`, `cases:pld`, `cc:create`, `rules:publish`, `persona:read`.

## Ola 2 notes

- Contract is scaffolding — paths are not fully implemented as production services yet.
- Face liveness goes through `FaceBinding` port (`src/adapters/face/`); vendor SDKs stay behind the adapter.
- SICLI coexistence uses `AdapterSicli.handoff(PersonaOK)` (`src/adapters/sicli/`).
- Persistence sketch: `docs/schema/p0_entities.sql`.
- Deploy target sketch: `infra/ecs-fargate.sketch.md` (Fargate), while ola 1 prototype remains on Vercel.
- Public health: `GET /api/health` → `{ ok, service: "maak-web", ts }` (no login).
