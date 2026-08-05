export type LivenessStatus = "PASS" | "FAIL" | "ERROR" | "SKIP";
export type LivenessResult = {
  status: LivenessStatus;
  score?: number;
  vendorRawRef?: string;
  evidenceIds: string[];
};
export type FaceSessionRequest = {
  personaId: string;
  caseId: string;
  returnUrl?: string;
};
export type FaceSession = {
  sessionId: string;
  provider: string;
  clientPayload: Record<string, unknown>;
};
export interface FaceBinding {
  readonly bindingRef: string;
  createSession(req: FaceSessionRequest): Promise<FaceSession>;
  completeSession(sessionId: string, payload: unknown): Promise<LivenessResult>;
}
