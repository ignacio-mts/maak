import { StubAdapterSicli } from "./stub";
import type { AdapterSicli } from "./types";

export type { AdapterSicli, PersonaOK, SicliHandoffResult } from "./types";
export { StubAdapterSicli } from "./stub";

/**
 * Factory for Adapter SICLI.
 * SICLI_ADAPTER=stub (default) until a real coexistence adapter exists.
 */
export function getSicliAdapter(): AdapterSicli {
  const id = (process.env.SICLI_ADAPTER ?? "stub").toLowerCase();

  switch (id) {
    case "stub":
      return new StubAdapterSicli();
    default:
      console.warn(
        `[sicli] Unknown SICLI_ADAPTER="${id}", falling back to stub`,
      );
      return new StubAdapterSicli();
  }
}
