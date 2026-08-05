# Auth & RBAC

## Two different gates

| Mechanism | Purpose | Ola 1 |
|---|---|---|
| **Site password** (`SITE_PASSWORD` + `iron-session`) | Prototype access control for Vercel/local | Implemented (`/login`, `src/proxy.ts`) |
| **RBAC** (roles + membership) | Product authorization | Spec only until ola 2 |

**Password gate ≠ RBAC.** Do not treat a successful site login as Ops/PLD/Cliente identity.

## Roles (product)

| Role | Intent |
|---|---|
| **Ops** | Case queue, assisted onboarding, gaps, internal actions |
| **PLD** | Compliance review, risk/dictaminación, rule publish with impact preview |
| **Cliente (`cc_creator`)** | Cost-center / parent-linked intake; write-only IntakeLink flows |

## Membership

- Binding: `user ↔ parentPersonaId` (and optional child CC scope).
- Cliente actions are scoped to membership; Ops/PLD are staff-scoped (org-wide or queue assignment — TBD in API).
- IntakeLink tokens are capability URLs: write gaps for one case; not full Cliente sessions.

## Ola 1 guidance

- UI may **label** roles for demo (filters, copy) but must not invent real authZ.
- Do not store fake JWTs or pretend IdP integration.
- Keep `/login` as shared site gate only.
