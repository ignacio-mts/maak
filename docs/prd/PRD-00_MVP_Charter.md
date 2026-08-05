# PRD-00 — MVP charter

## Problem

SICLI mixes “cliente verificado” and “cuenta activa”. TAT onboarding is high; KYC gaps block cross-sell on an installed base. Maak separates **Persona** from **Account**.

## MVP scope

**Onboarding puro:** capture + KYC/KYB/PLD checks + HITL cases + IntakeLink + light rules/templates.

### In

- PM / PF / CC (child) onboarding flows
- Case queue, gaps, process stepper, verification → PersonaOK (event concept)
- Coexistence with SICLI via transition adapter (ola 2)
- Ops / PLD / Cliente-CC access model (spec → API in ola 2)

### Out of MVP

- Account management, saldos, CLABE, SPEI day-to-day
- Full COE channels, big-bang SICLI shutoff
- Camunda/Zeebe-centric rewrite
- Vendor face SDKs in the UI tree without FaceBinding port

## Delivery waves

1. **Ola 1 — Vercel:** clickable mock, design tokens, password gate, Spanish UI.
2. **Ola 2 — API:** Maak API on Fargate, persistence, adapters (SICLI, face), real RBAC.

## KPIs (directional)

- Reduce onboarding TAT vs 12–15 business-day baseline
- Close documentary / PLD gaps faster (gap aging)
- CC throughput before parent volume
- Persona VERIFICADA once → reusable for group products (no re-KYC)

## Success for ola 1

Stakeholders can walk PM/PF/CC + rules preview + intake without confusing VERIFICADA with ACTIVA, and without Account/SPEI screens.
