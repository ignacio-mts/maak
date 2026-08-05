# Adapter SICLI (transition)

## Why

During coexistence, Maak is the compliance truth (Persona VERIFICADA) while ops still see “activo” via **SICLI → EF**. The adapter bridges `PersonaOK` into SICLI’s alta path until Modo Cuentas/core replaces it.

## Sketch

```
Maak API  --PersonaOK + alta package-->  Adapter SICLI  -->  SICLI  -->  EF
                                              |
                                              v
                                    (later) Core Account ACTIVA
                                    Adapter retired by cohort
```

Responsibilities (adapter):

- Map Maak Persona / Case snapshot → SICLI create/update payload
- Idempotency on `personaId` / external correlation id
- Surface activation ack back to Maak (case `ACTIVATING` → confirmed)
- No SPEI operations; no CLABE ownership in Maak

## Known issue: commercial name key

SICLI and commercial systems often key clients by **commercial / trade name** strings that are unstable or non-unique vs RFC/legal name. The adapter must:

- Prefer stable identifiers (RFC + Maak `personaId`) for correlation
- Treat commercial name as display/legacy field, not primary join key
- Document collisions and manual reconcile path for ops

## Ola 1

No adapter code in this repo yet — UI may show “PersonaOK → adapter” as copy/timeline only.
