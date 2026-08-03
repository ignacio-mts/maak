import type { CaseStatus, Ownership, PersonKind } from "./types";

export const personKindLabel: Record<PersonKind, string> = {
  legal_entity: "Persona moral",
  natural_person: "Persona física",
  cost_center: "Centro de costo",
};

export const statusLabel: Record<CaseStatus, string> = {
  blocked: "Bloqueado",
  in_review: "En revisión",
  processing: "En proceso",
  verified: "Verificada",
};

export const ownershipLabel: Record<Ownership, string> = {
  client: "Cliente",
  reviewer: "Revisión",
  engine: "Motor",
  compliance: "PLD",
};

export const channelLabel: Record<string, string> = {
  mail: "Correo",
  portal: "Portal",
  api: "API",
  wizard: "Alta asistida",
};
