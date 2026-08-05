import { StubFaceBinding } from "./stub";
import type { FaceBinding } from "./types";

export type { FaceBinding, FaceSession, FaceSessionRequest, LivenessResult, LivenessStatus } from "./types";
export { StubFaceBinding } from "./stub";

/**
 * Factory for FaceBinding adapters.
 * FACE_BINDING=stub (default) | future vendor ids.
 */
export function getFaceBinding(): FaceBinding {
  const id = (process.env.FACE_BINDING ?? "stub").toLowerCase();

  switch (id) {
    case "stub":
      return new StubFaceBinding();
    default:
      console.warn(
        `[face] Unknown FACE_BINDING="${id}", falling back to stub`,
      );
      return new StubFaceBinding();
  }
}
