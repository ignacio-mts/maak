# Domain glossary

Source analysis: `docs/13_Analisis_SICLI_Maak_Reemplazo.html`. Concise terms for agents and PRs.

## Core concepts

| Term | Meaning |
|---|---|
| **Persona** | Identity + expediente + KYC/KYB/PLD lifecycle. Maak's aggregate. Kinds: PM (legal entity), PF (natural person), CC (cost center / child). |
| **VERIFICADA ≠ ACTIVA** | Maak certifies Persona **VERIFICADA**. Core (or transitional SICLI/EF) certifies Account **ACTIVA**. Never merge into one flag. |
| **Case** | Work unit for onboarding/remediation (cola HITL). Case can close while Account is still materializing (`ACTIVATING` in to-be). |
| **Gap** | Pending client/reviewer/engine item blocking progress (docs, datos, firma, lista). |
| **IntakeLink** | Write-only tokenized link for the client to supply gaps (`/intake/[token]`). |
| **Control / Rule / Template** | Evaluator inputs: controls and rules published against person templates/cohorts (PM/PF/CC). Preview impact before publish. |
| **PersonaOK** | Event when Persona reaches VERIFICADA. Downstream: adapter→SICLI (transition) or core Account materialization (target). |

## Persona states (Maak)

`PROSPECTO → EN_KYC → VERIFICADA → BLOQUEADA | EN_REMEDIACION`

## Ownership map

| Owner | Owns | Does not own |
|---|---|---|
| **Maak** | Persona, expediente, risk, PLD/GE/DDN cases, contract signatures, CC-as-child Persona, IntakeLink | Saldos, CLABE operativa, SPEI day-to-day |
| **Core / Modo Cuentas** | Account ACTIVA, product/account structure | KYC matrices, Face Binding as product owner |
| **Xook** | Channel/BFF/UI over core accounts | Ledger; PLD matrices |
| **EF** | SPEI rail (target) | Client/account core post-decouple |
| **COE** | Service excellence (ABC, passwords, locks, WhatsApp/Genesys) consuming Maak + core APIs | Owning Persona or ledger |
| **SICLI** | Legacy JSF SGC (transition truth for ops until cutover) | Target architecture |

## MVP focus

Pure onboarding (capture + KYC/KYB/PLD checks). Account ops and heavy maintenance out of MVP. Volume priority: cost centers before parent accounts.
