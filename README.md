# Maak

Prototipo clickable del sistema de gestión de clientes (SGC / onboarding de personas) de STP.

Maak certifica **persona verificada** (expediente, KYC/KYB/PLD, casos de revisión). No opera saldos ni SPEI. La cuenta **activa** vive en el core (transición vía adapter SICLI/EF).

## Correr

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Rutas (código en inglés · UI en español)

| Ruta | Pantalla |
|------|----------|
| `/` | Inicio / atajos de flujos |
| `/cases` | Cola de casos (filtros PM / PF / CC) |
| `/cases/[id]` | Detalle: proceso, tiempos, pendientes, acciones |
| `/onboarding` | Alta asistida E2E (moral, física, centro de costo) |
| `/ingestion` | Agente: correo → caso |
| `/people` | Personas verificadas |
| `/rules` | Configuración de reglas + vista previa de impacto |
| `/intake/[token]` | Enlace write-only para el cliente |

## Flujos

1. **Persona moral** — datos → documentos → riesgo → firma → verificación  
2. **Persona física** — datos → identidad (INE) → listas → firma → verificación  
3. **Centro de costo** — vínculo al padre → GE → listas → verificación  
4. **Reglas** — publicar cambio con preview de reproceso por cohorte  

Datos mock en `src/lib/data.ts`. Estado de sesión en `src/lib/cases-context.tsx`.

## Docs de referencia

- [`docs/13_Analisis_SICLI_Maak_Reemplazo.html`](docs/13_Analisis_SICLI_Maak_Reemplazo.html)
- [`docs/13b_Maak_HITL_Caso_Prototipo.html`](docs/13b_Maak_HITL_Caso_Prototipo.html) *(nombre de archivo histórico)*
- [`docs/13c_Maak_Prototipos.html`](docs/13c_Maak_Prototipos.html)

## Stack

Next.js (App Router) + TypeScript + Tailwind. Sin DB ni integraciones reales.
