# Jira — MAAK board setup

**Team tracking lives in Jira (project MAAK).** Notion is **not** used for team tracking / sprint boards.

## Project

- Key: `MAAK`
- Type: Company-managed (or team-managed with equivalent columns)
- Issue types: Epic, Story, Task, Bug, Spike

## Epics (create once)

| Epic key (label) | Name | Scope |
|---|---|---|
| **E-PRD** | Product / PRD | Charters, acceptance criteria, KPI defs |
| **E-AUTH** | Auth & RBAC | IdP, roles Ops/PLD/cc_creator, memberships |
| **E-VENDOR** | Vendors / rails | Lists, face vendor selection, thin rails |
| **E-API** | Maak API | OpenAPI, Fargate service, persistence |
| **E-ADAPTER** | Adapters | SICLI transition, FaceBinding adapters |
| **E-INGEST** | Ingestion | Mail/agent → case pipelines |
| **E-UI** | UI / prototype | Ola 1 Vercel mock, design tokens, flows |
| **E-RAILS** | Rules / evaluator | Controls, templates, impact preview, SM |
| **E-DEPLOY** | Deploy / envs | Vercel, Fargate, secrets, CI |
| **E-UAT** | UAT | Stakeholder scripts, cohort pilots |
| **E-GOV** | Governance | ADRs, security/PII, DoD audits |

## Board columns

Suggested: `Backlog` → `Ready` → `In Progress` → `In Review` → `Blocked` → `Done`

Optional swimlanes by Epic or by wave (`ola-1` / `ola-2`).

## Labels

| Label | Use |
|---|---|
| `ola-1` | Vercel mock / docs / UI-only |
| `ola-2` | API + adapters |
| `domain` | Persona/Case glossary work |
| `no-spei` | Reminder stories that touch boundary |
| `pii` | Handles personal data |
| `spike` | Time-boxed research |

Components (optional): `backoffice`, `intake`, `api`, `adapter-sicli`, `face`, `docs`.

## Definition of Ready (DoR)

- Linked to an Epic above
- Clear outcome; wave label (`ola-1` or `ola-2`)
- Domain terms match `docs/engineering/DOMAIN.md` (VERIFICADA ≠ ACTIVA)
- No Account/SPEI/CLABE scope unless explicitly out-of-Maak spike
- Design/token notes if UI (`DESIGN_TOKENS.md`)

## Definition of Done (DoD)

- Meets acceptance criteria; PR checklist passed (`docs/checklists/PR_CHECKLIST.md`)
- Code EN / UI ES; lint + build green for code changes
- No vendor face SDKs outside `src/adapters/face/`
- Docs/ADR updated when decision changes
- Jira issue transitioned with link to PR

## Issue templates (short)

**Story:** As [Ops|PLD|Cliente], I can [capability], so that [outcome]. AC: … Out of scope: Account/SPEI.

**Spike:** Question, time box, decision output (ADR or comment).
