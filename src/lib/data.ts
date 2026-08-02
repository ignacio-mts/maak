import type { Case, Rule } from "./types";

export const operator = {
  initials: "AM",
  name: "Ana Martínez",
  role: "Dictaminación",
};

export const cases: Case[] = [
  {
    id: "CSK-2026-08421",
    name: "Comercializadora Delta SA de CV",
    rfc: "CDE850214XXX",
    template: "T-PM-STD",
    channel: "Mail / ticket",
    openFor: "4d 6h",
    status: "FALLA",
    ball: "Cliente",
    tat: "2.1d",
    intakeToken: "dlt-08421",
    gaps: [
      {
        id: "g1",
        title: "Poder notarial vigente",
        description: "Subí escritura o ratificación con fecha ≥ 12 meses.",
        action: "Subir documento",
      },
      {
        id: "g2",
        title: "Acta — fólios 4 al 6",
        description: "Falta el objeto social. Subí el PDF completo o las páginas faltantes.",
        action: "Subir páginas",
      },
    ],
    steps: [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Documentos", state: "blocked", detail: "Bloqueado" },
      { id: "04", label: "Riesgo", state: "todo", detail: "Pendiente" },
      { id: "05", label: "Firma", state: "todo", detail: "Pendiente" },
      { id: "06", label: "PersonaOK", state: "todo", detail: "Pendiente" },
    ],
    stats: { total: "4.3d", clientWait: "2.1d", internalQueue: "0.6d" },
    bars: [
      { label: "Ingesta", kind: "auto", left: 0, width: 8, tat: "2h" },
      { label: "Datos / CSF", kind: "auto", left: 8, width: 10, tat: "5h" },
      { label: "Revisión", kind: "hitl", left: 18, width: 12, tat: "14h" },
      { label: "Espera docs", kind: "client", left: 30, width: 48, tat: "2.1d" },
      { label: "Riesgo / firma", kind: "idle", left: 78, width: 22, tat: "—" },
    ],
    timeline: [
      { time: "hace 2.1d", title: "IntakeLink emitido", detail: "2 gaps tipados · TTL 72h · sin PII en URL", tone: "warn" },
      { time: "hace 2.2d", title: "Documentos bloqueados", detail: "Poder vencido + acta incompleta", tone: "fail" },
      { time: "hace 3d", title: "CSF auto-OK", detail: "Control R-CSF-MATCH · score 0.98", tone: "ok" },
      { time: "hace 4d", title: "Caso creado", detail: "Ingesta mail · 4 adjuntos · template T-PM-STD", tone: "neutral" },
    ],
  },
  {
    id: "CSK-2026-08418",
    name: "Norte Logística SA de CV",
    rfc: "NLO910311XXX",
    template: "T-PM-STD",
    channel: "Portal",
    openFor: "1d 2h",
    status: "HITL",
    ball: "HITL",
    tat: "4h",
    gaps: [
      {
        id: "g1",
        title: "Validar domicilio fiscal vs CSF",
        description: "Discrepancia menor en colonia. Revisar captura OCR.",
        action: "Resolver en HITL",
      },
    ],
    steps: [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Documentos", state: "done", detail: "Completado" },
      { id: "04", label: "Riesgo", state: "now", detail: "En revisión" },
      { id: "05", label: "Firma", state: "todo", detail: "Pendiente" },
      { id: "06", label: "PersonaOK", state: "todo", detail: "Pendiente" },
    ],
    stats: { total: "1.1d", clientWait: "0d", internalQueue: "4h" },
    bars: [
      { label: "Ingesta", kind: "auto", left: 0, width: 15, tat: "1h" },
      { label: "Docs", kind: "auto", left: 15, width: 35, tat: "8h" },
      { label: "Riesgo", kind: "hitl", left: 50, width: 30, tat: "4h" },
      { label: "Firma", kind: "idle", left: 80, width: 20, tat: "—" },
    ],
    timeline: [
      { time: "hace 4h", title: "Cola PLD", detail: "Asignado a Ana Martínez", tone: "warn" },
      { time: "hace 12h", title: "Docs OK", detail: "Todos los controles documentales PASS", tone: "ok" },
    ],
  },
  {
    id: "CSK-2026-08415",
    name: "CC Acme-03",
    rfc: "ACM120101XXX",
    template: "T-CC-DRS",
    channel: "API",
    openFor: "45m",
    status: "AUTO",
    ball: "Motor",
    tat: "12m",
    gaps: [],
    steps: [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Documentos", state: "done", detail: "Completado" },
      { id: "04", label: "Riesgo", state: "now", detail: "Auto" },
      { id: "05", label: "Firma", state: "todo", detail: "N/A CC" },
      { id: "06", label: "PersonaOK", state: "todo", detail: "Pendiente" },
    ],
    stats: { total: "12m", clientWait: "0", internalQueue: "12m" },
    bars: [
      { label: "Ingesta", kind: "auto", left: 0, width: 40, tat: "3m" },
      { label: "Evaluator", kind: "auto", left: 40, width: 45, tat: "9m" },
      { label: "PersonaOK", kind: "idle", left: 85, width: 15, tat: "—" },
    ],
    timeline: [
      { time: "hace 12m", title: "Caso CC creado", detail: "Persona hija · gate GE pendiente auto", tone: "ok" },
    ],
  },
  {
    id: "CSK-2026-08410",
    name: "Servicios Helios SA",
    rfc: "SHE780505XXX",
    template: "T-PM-STD",
    channel: "Mail / ticket",
    openFor: "6d",
    status: "OK",
    ball: "Motor",
    tat: "—",
    personaOk: true,
    gaps: [],
    steps: [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Documentos", state: "done", detail: "Completado" },
      { id: "04", label: "Riesgo", state: "done", detail: "Completado" },
      { id: "05", label: "Firma", state: "done", detail: "Completado" },
      { id: "06", label: "PersonaOK", state: "done", detail: "Emitido" },
    ],
    stats: { total: "5.2d", clientWait: "1.0d", internalQueue: "1.4d" },
    bars: [{ label: "E2E", kind: "auto", left: 0, width: 100, tat: "5.2d" }],
    timeline: [
      { time: "hace 1d", title: "PersonaOK emitido", detail: "event PersonaOK → core.headless (stub)", tone: "ok" },
      { time: "hace 1.1d", title: "Firma MiFiel OK", detail: "Contrato marco firmado", tone: "ok" },
    ],
  },
];

export const rules: Rule[] = [
  {
    id: "R-PODERES-VIGENTE",
    name: "Vigencia de poderes",
    description: "Máxima antigüedad del poder notarial del RL",
    from: "12 meses",
    to: "18 meses",
    impact: { personas: 847, pass: 612, adequacy: 198, block: 37 },
  },
  {
    id: "R-CSF-MATCH",
    name: "CSF vs razón social",
    description: "Umbral de match OCR para constancia de situación fiscal",
    from: "0.95",
    to: "0.92",
    impact: { personas: 1204, pass: 1180, adequacy: 19, block: 5 },
  },
  {
    id: "R-GE-CC",
    name: "Gate GE centros de costo",
    description: "Obligatoriedad de GE en onboarding CC DRS",
    from: "siempre",
    to: "si padre ≥ medio",
    impact: { personas: 312, pass: 280, adequacy: 22, block: 10 },
  },
];

export function getCase(id: string): Case | undefined {
  return cases.find((c) => c.id === id);
}

export function getCaseByIntakeToken(token: string): Case | undefined {
  return cases.find((c) => c.intakeToken === token);
}

export const openHitlCount = cases.filter(
  (c) => c.status === "FALLA" || c.status === "HITL",
).length;
