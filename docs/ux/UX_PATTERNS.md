# UX patterns vigentes (Maak Ola 1)

Patrones **actuales**. Historia y porqués → `docs/ux/UXDR-*.md`.  
Tokens visuales → `docs/engineering/DESIGN_TOKENS.md`.

---

## Shell y look

- Tool UI Cursor-like: zinc, acento naranja, Geist, light + dark + system.
- Theme: icon-only + tooltip ([UXDR-003](./UXDR-003_Theme_Toggle_Icon.md)).
- Banner “Prototipo” visible; password gate ≠ RBAC.
- Copy UI en **español**; código en inglés.
- No SPEI / CLABE / saldos / navy-purple-gold en producto.
- “Casos pendientes” (no “cola de casos”) como título de `/cases`.

---

## Alta asistida {#alta-asistida}

**Steps UI:** Tipo → Expediente → Listo.  
**Decisión:** [UXDR-001](./UXDR-001_Onboarding_Docs_First_Unified.md).

### Pantalla Expediente (una sola)

1. **Carga** arriba: zona clicable; en mock simula paquete ZIP (~2s de reconocimiento). El botón muestra estado “Reconocimiento de datos en curso…”.
2. **Checklist del template** (persona moral / física / CC): matched / falta / leyendo / revisar.
3. **Campos del template** al lado: razón social/nombre, RFC, email (+ padre si CC).

Código: `src/app/(backoffice)/onboarding/page.tsx`, `src/lib/onboarding-ingest.ts`.

### LLM vs operador {#llm-vs-operador}

**Decisión:** [UXDR-002](./UXDR-002_LLM_Field_Discrepancy.md).

| Situación | Comportamiento |
|-----------|----------------|
| Campo vacío al llegar extracción | Autocompletar |
| Operador ya escribió y LLM discrepa | No pisar; warning + «Usar valor del LLM» |
| Reconocimiento en curso | Campos **siguen editables** |

No volver a `disabled`/“Bloqueado” en campos por fase de reconocimiento.

---

## Cómo extender

1. Nueva decisión → `docs/ux/TEMPLATE_UXDR.md` → `UXDR-00N_…md` + fila en `docs/ux/README.md`.
2. Actualizar esta página (patrón vigente).
3. Bullet en `.cursor/rules/40-*` o `41-onboarding-ux.mdc`.
4. PR checklist: “UX decision documented”.
