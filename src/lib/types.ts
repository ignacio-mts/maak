export type PersonKind = "legal_entity" | "natural_person" | "cost_center";

/** Internal status codes (English). UI labels live in labels.ts */
export type CaseStatus = "blocked" | "in_review" | "processing" | "verified";

export type Ownership = "client" | "reviewer" | "engine" | "compliance";

export type StepState = "done" | "current" | "blocked" | "todo";

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
  kind: "auto" | "internal" | "client" | "idle";
  left: number;
  width: number;
  tat: string;
};

export type Case = {
  id: string;
  name: string;
  rfc: string;
  kind: PersonKind;
  template: string;
  channel: string;
  openFor: string;
  status: CaseStatus;
  ownership: Ownership;
  tat: string;
  gaps: Gap[];
  steps: ProcessStep[];
  stats: { total: string; clientWait: string; internalQueue: string };
  bars: TimeBar[];
  timeline: TimelineEvent[];
  verified?: boolean;
  intakeToken?: string;
  parentName?: string;
};

export type Rule = {
  id: string;
  name: string;
  description: string;
  from: string;
  to: string;
  appliesTo: PersonKind[];
  impact: {
    personas: number;
    pass: number;
    adequacy: number;
    block: number;
  };
};

export type OnboardingDraft = {
  kind: PersonKind;
  name: string;
  rfc: string;
  email: string;
  parentCaseId?: string;
};
