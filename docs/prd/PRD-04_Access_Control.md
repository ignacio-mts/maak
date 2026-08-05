# PRD-04 — Access control (RBAC)

Password site gate is out of scope here — see `docs/engineering/AUTH_RBAC.md`.

## Roles

| Role | Who |
|---|---|
| **Ops** | Onboarding / case operators |
| **PLD** | Compliance / dictaminación / risk |
| **Cliente (`cc_creator`)** | Parent-linked user creating/supplying CC or intake data |

Membership: `user ↔ parentPersonaId` (+ optional CC scope).

## Matrix (MVP intent)

| Capability | Ops | PLD | Cliente CC |
|---|---|---|---|
| View assigned / queue cases | ✓ | ✓ | own parent/CC only |
| Assisted onboarding (PM/PF/CC) | ✓ | ✓* | CC under membership |
| Edit gaps / request IntakeLink | ✓ | ✓ | via IntakeLink / own cases |
| IntakeLink write (token) | — | — | ✓ (capability URL) |
| Approve / reject compliance gates | — | ✓ | — |
| Change risk level | — | ✓ | — |
| Publish rules + impact preview | — | ✓ | — |
| View Persona VERIFICADA directory | ✓ | ✓ | own tree |
| Account / SPEI / CLABE | ✗ | ✗ | ✗ |

\*PLD may open onboarding for remediation; primary creator is Ops/Cliente per flow.

## Non-goals

- Impersonation of EF users
- Merging site password into role claims
- COE password/ABC ownership inside Maak

## Ola 1

UI copy and filters may illustrate roles; no real enforcement until ola 2 API + IdP.
