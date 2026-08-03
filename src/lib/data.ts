import type { Case, Rule } from "./types";

export const operator = {
  initials: "AM",
  name: "Ana Martínez",
  role: "Dictaminación",
};

export const initialCases: Case[] = [
  {
    id: "CSK-2026-08421",
    name: "Comercializadora Delta SA de CV",
    rfc: "CDE850214XXX",
    kind: "legal_entity",
    template: "T-PM-STD",
    channel: "mail",
    openFor: "4d 6h",
    status: "blocked",
    ownership: "client",
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
      { id: "06", label: "Verificación", state: "todo", detail: "Pendiente" },
    ],
    stats: { total: "4.3d", clientWait: "2.1d", internalQueue: "0.6d" },
    bars: [
      { label: "Ingesta", kind: "auto", left: 0, width: 8, tat: "2h" },
      { label: "Datos / CSF", kind: "auto", left: 8, width: 10, tat: "5h" },
      { label: "Revisión", kind: "internal", left: 18, width: 12, tat: "14h" },
      { label: "Espera docs", kind: "client", left: 30, width: 48, tat: "2.1d" },
      { label: "Riesgo / firma", kind: "idle", left: 78, width: 22, tat: "—" },
    ],
    timeline: [
      { time: "hace 2.1d", title: "Enlace de documentos enviado", detail: "2 pendientes · TTL 72h · sin datos sensibles en la URL", tone: "warn" },
      { time: "hace 2.2d", title: "Documentos bloqueados", detail: "Poder vencido + acta incompleta", tone: "fail" },
      { time: "hace 3d", title: "CSF automático OK", detail: "Control R-CSF-MATCH · score 0.98", tone: "ok" },
      { time: "hace 4d", title: "Caso creado", detail: "Correo · 4 adjuntos · plantilla T-PM-STD", tone: "neutral" },
    ],
  },
  {
    id: "CSK-2026-08430",
    name: "María Elena Ruiz López",
    rfc: "RULM850612XXX",
    kind: "natural_person",
    template: "T-PF-STD",
    channel: "portal",
    openFor: "18h",
    status: "in_review",
    ownership: "compliance",
    tat: "6h",
    gaps: [
      {
        id: "g1",
        title: "INE — reverso ilegible",
        description: "La foto del reverso no permite leer la CIC. Pedir nueva captura.",
        action: "Solicitar nueva foto",
      },
    ],
    steps: [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Identidad", state: "current", detail: "En revisión" },
      { id: "04", label: "Listas", state: "todo", detail: "Pendiente" },
      { id: "05", label: "Firma", state: "todo", detail: "Pendiente" },
      { id: "06", label: "Verificación", state: "todo", detail: "Pendiente" },
    ],
    stats: { total: "18h", clientWait: "0", internalQueue: "6h" },
    bars: [
      { label: "Captura", kind: "auto", left: 0, width: 25, tat: "2h" },
      { label: "INE / biometría", kind: "internal", left: 25, width: 40, tat: "6h" },
      { label: "Listas / firma", kind: "idle", left: 65, width: 35, tat: "—" },
    ],
    timeline: [
      { time: "hace 6h", title: "Derivado a PLD", detail: "Calidad de INE insuficiente para auto-aprobación", tone: "warn" },
      { time: "hace 12h", title: "CSF y domicilio OK", detail: "Controles de datos PASS", tone: "ok" },
      { time: "hace 18h", title: "Alta persona física", detail: "Portal · plantilla T-PF-STD", tone: "neutral" },
    ],
  },
  {
    id: "CSK-2026-08418",
    name: "Norte Logística SA de CV",
    rfc: "NLO910311XXX",
    kind: "legal_entity",
    template: "T-PM-STD",
    channel: "portal",
    openFor: "1d 2h",
    status: "in_review",
    ownership: "reviewer",
    tat: "4h",
    gaps: [
      {
        id: "g1",
        title: "Validar domicilio fiscal vs CSF",
        description: "Discrepancia menor en colonia. Revisar captura OCR.",
        action: "Resolver en revisión",
      },
    ],
    steps: [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Documentos", state: "done", detail: "Completado" },
      { id: "04", label: "Riesgo", state: "current", detail: "En revisión" },
      { id: "05", label: "Firma", state: "todo", detail: "Pendiente" },
      { id: "06", label: "Verificación", state: "todo", detail: "Pendiente" },
    ],
    stats: { total: "1.1d", clientWait: "0d", internalQueue: "4h" },
    bars: [
      { label: "Ingesta", kind: "auto", left: 0, width: 15, tat: "1h" },
      { label: "Docs", kind: "auto", left: 15, width: 35, tat: "8h" },
      { label: "Riesgo", kind: "internal", left: 50, width: 30, tat: "4h" },
      { label: "Firma", kind: "idle", left: 80, width: 20, tat: "—" },
    ],
    timeline: [
      { time: "hace 4h", title: "Cola de riesgo", detail: "Asignado a Ana Martínez", tone: "warn" },
      { time: "hace 12h", title: "Documentos OK", detail: "Controles documentales PASS", tone: "ok" },
    ],
  },
  {
    id: "CSK-2026-08415",
    name: "CC Acme-03",
    rfc: "ACM120101XXX",
    kind: "cost_center",
    template: "T-CC-DRS",
    channel: "api",
    openFor: "45m",
    status: "processing",
    ownership: "engine",
    tat: "12m",
    parentName: "Acme Holdings SA de CV",
    gaps: [],
    steps: [
      { id: "01", label: "Alta CC", state: "done", detail: "Completado" },
      { id: "02", label: "Vínculo padre", state: "done", detail: "Completado" },
      { id: "03", label: "Gate GE", state: "current", detail: "Evaluando" },
      { id: "04", label: "Listas", state: "todo", detail: "Pendiente" },
      { id: "05", label: "Verificación", state: "todo", detail: "Pendiente" },
    ],
    stats: { total: "12m", clientWait: "0", internalQueue: "12m" },
    bars: [
      { label: "Alta", kind: "auto", left: 0, width: 40, tat: "3m" },
      { label: "GE / listas", kind: "auto", left: 40, width: 45, tat: "9m" },
      { label: "Verificación", kind: "idle", left: 85, width: 15, tat: "—" },
    ],
    timeline: [
      { time: "hace 12m", title: "Centro de costo creado", detail: "Persona hija · padre Acme Holdings · T-CC-DRS", tone: "ok" },
    ],
  },
  {
    id: "CSK-2026-08410",
    name: "Servicios Helios SA",
    rfc: "SHE780505XXX",
    kind: "legal_entity",
    template: "T-PM-STD",
    channel: "mail",
    openFor: "6d",
    status: "verified",
    ownership: "engine",
    tat: "—",
    verified: true,
    gaps: [],
    steps: [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Documentos", state: "done", detail: "Completado" },
      { id: "04", label: "Riesgo", state: "done", detail: "Completado" },
      { id: "05", label: "Firma", state: "done", detail: "Completado" },
      { id: "06", label: "Verificación", state: "done", detail: "Emitida" },
    ],
    stats: { total: "5.2d", clientWait: "1.0d", internalQueue: "1.4d" },
    bars: [{ label: "E2E", kind: "auto", left: 0, width: 100, tat: "5.2d" }],
    timeline: [
      { time: "hace 1d", title: "Persona verificada", detail: "Evento emitido hacia el core (stub)", tone: "ok" },
      { time: "hace 1.1d", title: "Firma de contrato OK", detail: "Contrato marco firmado", tone: "ok" },
    ],
  },
];

export const rules: Rule[] = [
  {
    id: "R-PODERES-VIGENTE",
    name: "Vigencia de poderes",
    description: "Máxima antigüedad del poder notarial del representante legal",
    from: "12 meses",
    to: "18 meses",
    appliesTo: ["legal_entity"],
    impact: { personas: 847, pass: 612, adequacy: 198, block: 37 },
  },
  {
    id: "R-CSF-MATCH",
    name: "CSF vs razón social / nombre",
    description: "Umbral de coincidencia OCR de la constancia de situación fiscal",
    from: "0.95",
    to: "0.92",
    appliesTo: ["legal_entity", "natural_person", "cost_center"],
    impact: { personas: 1204, pass: 1180, adequacy: 19, block: 5 },
  },
  {
    id: "R-GE-CC",
    name: "Gate GE centros de costo",
    description: "Obligatoriedad de GE en alta de centro de costo DRS",
    from: "siempre",
    to: "si padre ≥ medio",
    appliesTo: ["cost_center"],
    impact: { personas: 312, pass: 280, adequacy: 22, block: 10 },
  },
  {
    id: "R-INE-QUALITY",
    name: "Calidad de INE",
    description: "Umbral mínimo de legibilidad para INE en persona física",
    from: "0.90",
    to: "0.85",
    appliesTo: ["natural_person"],
    impact: { personas: 540, pass: 501, adequacy: 28, block: 11 },
  },
];

export function getCase(cases: Case[], id: string): Case | undefined {
  return cases.find((c) => c.id === id);
}

export function getCaseByIntakeToken(cases: Case[], token: string): Case | undefined {
  return cases.find((c) => c.intakeToken === token);
}

export function openReviewCount(cases: Case[]): number {
  return cases.filter((c) => c.status === "blocked" || c.status === "in_review").length;
}
