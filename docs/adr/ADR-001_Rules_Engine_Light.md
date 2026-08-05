# ADR-001 — Rules engine light (no Camunda)

## Status

Accepted.

## Context

Legacy SGC explorations centered on Camunda/Zeebe/Angular microservices. That stack is heavy for MVP onboarding and distracts from Persona + evaluator clarity. Harvest DMN/docs and bindings; do not restart the BPM suite as the MVP core.

## Decision

- **In-app state machine** for case/persona transitions in Maak API
- Controls/rules/templates evaluated in-process (versioned config)
- **SQS (later)** for async jobs: list checks, recheck cohorts, adapter fan-out — not a full BPMS
- No Camunda/Zeebe as runtime dependency for MVP

## Consequences

- Faster ola 2 delivery; simpler ops
- Complex long-running orchestration deferred until proven need
- Rule publish must include impact preview (cohort counts) in product UX
