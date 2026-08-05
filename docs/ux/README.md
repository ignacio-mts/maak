# UX / design decisions (SoT en repo)

Fuente de verdad **continua** para decisiones de producto UI/UX. Los agents y humanos leen esto antes de inventar flujos o pelear con el LLM vs operador.

## Dónde va cada cosa

| Artefacto | Qué guarda | Cuándo actualizar |
|-----------|------------|-------------------|
| [`UX_PATTERNS.md`](./UX_PATTERNS.md) | Patrones **vigentes** (cómo se comporta la UI hoy) | En todo PR que cambie UX no trivial |
| [`UXDR-*.md`](./) | Decisión puntual (contexto, alternativas, por qué) | Al **aceptar** una decisión; no borrar — marcar `Superseded` |
| [`TEMPLATE_UXDR.md`](./TEMPLATE_UXDR.md) | Plantilla para nuevas decisiones | — |
| `.cursor/rules/40-frontend-backoffice.mdc` + `41-onboarding-ux.mdc` | Must/must-not cortos para el agent | Al cambiar un patrón estable |
| `docs/engineering/DESIGN_TOKENS.md` | Tokens visuales | Cambios de look, no de flujo |

**No SoT:** Notion, Slack, ni `docs/13_*.html` (esos son dominio/flujos históricos, no tokens ni UX de producto).

## Cómo registrar una decisión (proceso)

1. Copiá `TEMPLATE_UXDR.md` → `UXDR-00N_Titulo_Corto.md`.
2. Actualizá la sección correspondiente en `UX_PATTERNS.md`.
3. Si aplica, un bullet en `.cursor/rules/*`.
4. En el PR: checkbox “UX decision documented”.

## Índice de decisiones

| ID | Título | Status |
|----|--------|--------|
| [UXDR-001](./UXDR-001_Onboarding_Docs_First_Unified.md) | Alta: docs-first, pantalla unificada | Accepted |
| [UXDR-002](./UXDR-002_LLM_Field_Discrepancy.md) | Campos editables + discrepancia LLM | Accepted |
| [UXDR-003](./UXDR-003_Theme_Toggle_Icon.md) | Theme toggle icon-only light/dark/system | Accepted |
