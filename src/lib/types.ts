export type CaseStatus = "FALLA" | "HITL" | "AUTO" | "OK";
export type BallOwner = "Cliente" | "HITL" | "Motor" | "PLD";
export type StepState = "done" | "now" | "blocked" | "todo";

export type ProcessStep = {
  id: string;
  label: string;
  state: StepState;
  detail: string;
};

export type Gap = {
  id: string;
  title: string;
  description: string;
  action: string;
};

export type TimelineEvent = {
  time: string;
  title: string;
  detail: string;
  tone: "ok" | "fail" | "warn" | "neutral";
};

export type TimeBar = {
  label: string;
  kind: "auto" | "hitl" | "client" | "idle";
  left: number;
  width: number;
  tat: string;
};

export type Case = {
  id: string;
  name: string;
  rfc: string;
  template: string;
  channel: string;
  openFor: string;
  status: CaseStatus;
  ball: BallOwner;
  tat: string;
  gaps: Gap[];
  steps: ProcessStep[];
  stats: { total: string; clientWait: string; internalQueue: string };
  bars: TimeBar[];
  timeline: TimelineEvent[];
  personaOk?: boolean;
  intakeToken?: string;
};

export type Rule = {
  id: string;
  name: string;
  description: string;
  from: string;
  to: string;
  impact: {
    personas: number;
    pass: number;
    adequacy: number;
    block: number;
  };
};
