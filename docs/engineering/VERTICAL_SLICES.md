# Vertical slices — MVP Maak

Orden de entrega de valor (ola 2). Ola 1 cubre UI mock de A–C en Vercel.

| Slice | Descripción | Estado ola 1 | Ola 2 |
|-------|-------------|--------------|-------|
| A | Caso HITL PM (Ops/PLD) | UI mock `/cases` | API + auth roles |
| B | CC DRS vía HITL | UI mock onboarding CC | Template T-CC-DRS + GE |
| C | Cliente autenticado alta CC | Mock `/client/cc` | Membership + scopes `cc:create` |
| D | IntakeLink gaps reales | UI `/intake/[token]` | Tokens hash/TTL + Evidence S3 |
| E | Ingesta mail | UI `/ingestion` | Worker SQS + mailbox |
| F | Adapter SICLI | Stub `src/adapters/sicli` | Handoff no-prod + David |
| G | Face/listas vía puertos | Stub `FaceBinding` | Sandbox vendor detrás del puerto |

## Criterio de corte ola 1 → 2

Ver PRD-00 y DoR en el plan: journeys E2E en Vercel, light+dark OK, feedback Ops/PLD, OpenAPI draft, PRD-04 + ADR-Face publicados.
