# UXDR-001 — Onboarding docs-first, pantalla unificada

## Status

Accepted

## Context

El alta asistida tenía checklist manual y pasos separados (datos → documentos → verificar). Eso obligaba a tipear RFC/razón social antes de tener el paquete, y fragmentaba la atención del operador.

## Decision

1. **Documentos primero** (tras elegir tipo/template): la carga del paquete (PDF/ZIP simulado) dispara reconocimiento.
2. **Una sola pantalla de expediente**: caja de carga + checklist del template + campos del alta.
3. Flujo de steps de UI: `Tipo → Expediente → Listo` (no “Verificar” como step aparte).

## Alternatives considered

- Checklist con checkboxes sin archivos — descartado (no refleja el journey real).
- Wizard multi-pantalla carga → luego campos — descartado (pierde contexto checklist/campos).
- Inferir tipo solo desde docs (sin step Tipo) — aplazado; CC sigue necesitando padre explícito.

## Consequences

- Mock: clic en zona de carga simula ZIP + reconocimiento ~2s.
- Checklist se actualiza contra el template (`buildChecklist`).
- Extracción real = ola 2 worker; ola 1 es mock fiel al UX.

## Links

- Código: `src/app/(backoffice)/onboarding/page.tsx`, `src/lib/onboarding-ingest.ts`
- Patrones: `docs/ux/UX_PATTERNS.md#alta-asistida`
- Rule: `.cursor/rules/41-onboarding-ux.mdc`
