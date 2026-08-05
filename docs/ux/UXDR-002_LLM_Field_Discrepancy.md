# UXDR-002 — Campos editables + discrepancia LLM

## Status

Accepted

## Context

Durante el reconocimiento documental (mock hoy, LLM/worker mañana) hay riesgo de pelear con el operador: o se bloquean los campos, o se pisan valores que ya escribió.

## Decision

1. Los campos del template **siempre son editables** (nunca “Bloqueado” por reconocimiento).
2. Si un campo está **vacío** cuando llega el resultado del LLM → se **completa solo**.
3. Si el operador ya escribió y el valor del LLM **discrepa** → **no sobrescribir**. Mostrar warning por campo + botón **«Usar valor del LLM»**.
4. Banner global cuando hay ≥1 discrepancia.

## Alternatives considered

- Bloquear campos mientras corre el reconocimiento — descartado (fricción; el operador pierde tiempo).
- Sobrescribir siempre con el LLM — descartado (borra trabajo humano).
- Solo toast global sin acción por campo — descartado (no deja adoptar el valor del modelo fácilmente).

## Consequences

- Merge: `mergeExtractedIntoForm` + comparación viva `fieldDiscrepancy`.
- En ola 2 el mismo contrato UX aplica al worker/LLM real.
- No reintroducir `disabled` en campos por fase `recognizing`.

## Links

- Código: `src/app/(backoffice)/onboarding/page.tsx` (`Field`, `discrepancies`, `applyLlmValue`)
- Patrones: `docs/ux/UX_PATTERNS.md#llm-vs-operador`
- Rule: `.cursor/rules/41-onboarding-ux.mdc`
