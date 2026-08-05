# FaceBinding (provider-agnostic)

Face / liveness is **ola 2**. Design the port early; do not ship vendor SDKs in ola 1 UI.

## Port

`FaceBinding` is an application port (interface), not a vendor product name.

Typical operations (draft):

- `createSession(personaId | caseId, purpose)` → session id + client hints
- `getSession(sessionId)` → status (`pending` \| `passed` \| `failed` \| `expired`)
- `handleWebhook(payload)` → normalized result event
- Never leak vendor-specific types into domain/case models

## Adapters

- Implementations live only under `src/adapters/face/` (ola 2).
- One adapter per vendor (e.g. `facetec`, `onfido`, …) mapping to the port.
- Domain and UI consume the port / API DTO — never vendor SDKs directly.

## Ban

- **No vendor face/liveness SDKs** outside `src/adapters/face/`.
- No FaceTec (or other) scripts in `layout.tsx`, public pages, or components.
- No PII biometrics stored in mock ola 1 data.

See `docs/adr/ADR-Face_Provider_Agnostic.md`.
