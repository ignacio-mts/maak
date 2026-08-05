# ADR — Face provider agnostic

## Status

Accepted (design); implementation in ola 2.

## Context

Liveness/face checks will be required for some Persona flows. Vendor choice may change (procurement, cost, coverage). Embedding a vendor SDK in UI/domain would couple Maak to one supplier.

## Decision

Expose a **FaceBinding** application port. Vendor SDKs and webhooks live only in `src/adapters/face/*`. Domain events use normalized session results.

## Consequences

- Swapping vendors = new adapter + config, not case-model rewrite
- UI never imports vendor packages
- Ola 1 ships no face SDK; mock may show a “face session” step as copy only

See `docs/engineering/FACE_BINDING.md`.
