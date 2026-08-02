# Maak

Prototipo clickable del sistema de gestión de clientes (SGC / onboarding Persona) de STP.

Maak certifica **Persona VERIFICADA** (expediente, KYC/KYB/PLD, casos, HITL). No opera saldos ni SPEI. La cuenta **ACTIVA** vive en el core (transición vía adapter SICLI/EF).

## Correr

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) → redirige a la cola HITL.

## Pantallas

| Ruta | Qué muestra |
|------|-------------|
| `/cola` | Cola HITL (estado, pelota, TAT) |
| `/casos/[id]` | Detalle de caso + proceso + tiempos + gaps |
| `/casos/CSK-2026-08410` | Ejemplo con **PersonaOK** emitido |
| `/intake/dlt-08421` | IntakeLink write-only (cliente) |
| `/ingesta` | Agente: mail → ComplianceCase |
| `/reglas` | Publicar regla + preview RecheckJob |

## Docs de referencia

- [`docs/13_Analisis_SICLI_Maak_Reemplazo.html`](docs/13_Analisis_SICLI_Maak_Reemplazo.html)
- [`docs/13b_Maak_HITL_Caso_Prototipo.html`](docs/13b_Maak_HITL_Caso_Prototipo.html)
- [`docs/13c_Maak_Prototipos.html`](docs/13c_Maak_Prototipos.html)

## Stack

Next.js (App Router) + TypeScript + Tailwind. Datos mock en `src/lib/data.ts`. Sin DB ni integraciones reales (Meltsan/MiFiel/SICLI = stubs).
