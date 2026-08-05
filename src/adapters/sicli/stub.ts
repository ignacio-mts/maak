import type { AdapterSicli, PersonaOK, SicliHandoffResult } from "./types";

export class StubAdapterSicli implements AdapterSicli {
  readonly adapterRef = "sicli-stub";

  async handoff(payload: PersonaOK): Promise<SicliHandoffResult> {
    const handoffId = `sicli-handoff-${payload.personaId}-${Date.now()}`;
    return {
      ack: true,
      handoffId,
    };
  }
}
