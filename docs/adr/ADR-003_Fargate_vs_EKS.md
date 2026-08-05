# ADR-003 — Fargate for Maak test vs EKS platform

## Status

Accepted for Maak test path.

## Context

Platform teams may standardize on EKS + Kong. Maak ola 2 needs a small API surface quickly for Persona/Case without owning cluster platform concerns.

## Decision

- **Maak test / early API:** deploy on **AWS Fargate** (containerized Maak API)
- **EKS / Kong:** remain platform concerns — integrate when the org path is ready; do not block Maak MVP on cluster bootstrap
- Ola 1 UI stays on **Vercel**

## Consequences

- Clear ownership: Maak app team owns Fargate service + API; platform owns mesh/gateway standards
- Avoid premature multi-service EKS topology for a single bounded context
- Document cutover to platform EKS later without rewriting domain APIs
