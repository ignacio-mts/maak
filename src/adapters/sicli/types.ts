/**
 * PersonaOK payload emitted when a persona reaches VERIFICADA.
 * Opaque snapshot is for Adapter SICLI mapping — not a domain vendor type.
 */
export type PersonaOK = {
  personaId: string;
  caseId?: string;
  correlationId?: string;
  emittedAt?: string;
  snapshot?: Record<string, unknown>;
};

export type SicliHandoffResult = {
  ack: boolean;
  handoffId: string;
};

export interface AdapterSicli {
  readonly adapterRef: string;
  handoff(payload: PersonaOK): Promise<SicliHandoffResult>;
}
