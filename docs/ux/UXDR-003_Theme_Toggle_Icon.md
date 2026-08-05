# UXDR-003 — Theme toggle icon-only (light / dark / system)

## Status

Accepted

## Context

El control de tema con texto (“Tema / Claro / Oscuro”) ocupaba espacio en la shell y no seguía el patrón de tool UI.

## Decision

- Botón **solo ícono** (sol / luna / monitor) con tooltip al hover y `aria-label`.
- Ciclo: **claro → oscuro → sistema**.
- Persistencia en `localStorage` key `theme`; `system` respeta `prefers-color-scheme`.

## Alternatives considered

- Segmented control de 3 opciones siempre visible — más claro pero más ruido en sidebar.
- Solo light/dark sin system — peor para preferencia OS.

## Consequences

- Implementación: `src/components/ThemeToggle.tsx`.
- Copy de botones de tema con texto largo = regresión.

## Links

- `docs/engineering/DESIGN_TOKENS.md`
- `.cursor/rules/40-frontend-backoffice.mdc`
