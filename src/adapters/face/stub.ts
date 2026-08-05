import type {
  FaceBinding,
  FaceSession,
  FaceSessionRequest,
  LivenessResult,
} from "./types";

export class StubFaceBinding implements FaceBinding {
  readonly bindingRef = "stub";

  async createSession(req: FaceSessionRequest): Promise<FaceSession> {
    const sessionId = `stub-face-${req.caseId}-${Date.now()}`;
    return {
      sessionId,
      provider: this.bindingRef,
      clientPayload: {
        personaId: req.personaId,
        caseId: req.caseId,
        returnUrl: req.returnUrl ?? null,
        mode: "stub",
      },
    };
  }

  async completeSession(
    sessionId: string,
    payload: unknown,
  ): Promise<LivenessResult> {
    void payload;
    return {
      status: "PASS",
      score: 1,
      vendorRawRef: `stub:${sessionId}`,
      evidenceIds: [`evidence:stub:${sessionId}`],
    };
  }
}
