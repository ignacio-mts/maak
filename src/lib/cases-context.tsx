"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialCases } from "./data";
import type { Case, Gap, OnboardingDraft, PersonKind, ProcessStep } from "./types";

type CasesContextValue = {
  cases: Case[];
  addCaseFromOnboarding: (draft: OnboardingDraft) => Case;
  addCaseFromIngestion: (kind: PersonKind, name: string, rfc: string) => Case;
  markGapUploaded: (caseId: string, gapId: string) => void;
  advanceCase: (caseId: string) => void;
  resolveGap: (caseId: string, gapId: string) => void;
  requestClientDocs: (caseId: string) => void;
};

const CasesContext = createContext<CasesContextValue | null>(null);

function templateFor(kind: PersonKind): string {
  if (kind === "natural_person") return "T-PF-STD";
  if (kind === "cost_center") return "T-CC-DRS";
  return "T-PM-STD";
}

function stepsFor(kind: PersonKind): ProcessStep[] {
  if (kind === "cost_center") {
    return [
      { id: "01", label: "Alta CC", state: "done", detail: "Completado" },
      { id: "02", label: "Vínculo padre", state: "done", detail: "Completado" },
      { id: "03", label: "Gate GE", state: "current", detail: "Evaluando" },
      { id: "04", label: "Listas", state: "todo", detail: "Pendiente" },
      { id: "05", label: "Verificación", state: "todo", detail: "Pendiente" },
    ];
  }
  if (kind === "natural_person") {
    return [
      { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
      { id: "02", label: "Datos", state: "done", detail: "Completado" },
      { id: "03", label: "Identidad", state: "current", detail: "En revisión" },
      { id: "04", label: "Listas", state: "todo", detail: "Pendiente" },
      { id: "05", label: "Firma", state: "todo", detail: "Pendiente" },
      { id: "06", label: "Verificación", state: "todo", detail: "Pendiente" },
    ];
  }
  return [
    { id: "01", label: "Ingesta", state: "done", detail: "Completado" },
    { id: "02", label: "Datos", state: "done", detail: "Completado" },
    { id: "03", label: "Documentos", state: "current", detail: "En revisión" },
    { id: "04", label: "Riesgo", state: "todo", detail: "Pendiente" },
    { id: "05", label: "Firma", state: "todo", detail: "Pendiente" },
    { id: "06", label: "Verificación", state: "todo", detail: "Pendiente" },
  ];
}

function nextId(cases: Case[]): string {
  const n = 84000 + cases.length + 1;
  return `CSK-2026-${n}`;
}

export function CasesProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>(initialCases);

  const addCaseFromOnboarding = useCallback((draft: OnboardingDraft) => {
    const created: Case = {
      id: "",
      name: draft.name,
      rfc: draft.rfc,
      kind: draft.kind,
      template: templateFor(draft.kind),
      channel: "wizard",
      openFor: "0m",
      status: "in_review",
      ownership: "reviewer",
      tat: "0m",
      gaps: [],
      steps: stepsFor(draft.kind),
      stats: { total: "0m", clientWait: "0", internalQueue: "0m" },
      bars: [{ label: "Alta", kind: "auto", left: 0, width: 30, tat: "0m" }],
      timeline: [
        {
          time: "ahora",
          title: "Alta asistida creada",
          detail: `Correo contacto: ${draft.email}`,
          tone: "ok",
        },
      ],
    };
    let saved!: Case;
    setCases((prev) => {
      const parent = draft.parentCaseId
        ? prev.find((c) => c.id === draft.parentCaseId)
        : undefined;
      saved = {
        ...created,
        id: nextId(prev),
        parentName: draft.kind === "cost_center" ? parent?.name : undefined,
      };
      return [saved, ...prev];
    });
    return saved;
  }, []);

  const addCaseFromIngestion = useCallback((kind: PersonKind, name: string, rfc: string) => {
    let saved!: Case;
    setCases((prev) => {
      saved = {
        id: nextId(prev),
        name,
        rfc,
        kind,
        template: templateFor(kind),
        channel: "mail",
        openFor: "0m",
        status: "in_review",
        ownership: "reviewer",
        tat: "0m",
        gaps:
          kind === "legal_entity"
            ? [
                {
                  id: "g-prelim",
                  title: "Validar poderes",
                  description: "Revisión preliminar sugerida por el agente.",
                  action: "Revisar",
                },
              ]
            : [],
        steps: stepsFor(kind),
        stats: { total: "0m", clientWait: "0", internalQueue: "0m" },
        bars: [{ label: "Ingesta", kind: "auto", left: 0, width: 20, tat: "12s" }],
        timeline: [
          {
            time: "ahora",
            title: "Caso creado por ingesta",
            detail: "Correo con adjuntos procesado por el agente",
            tone: "ok",
          },
        ],
        intakeToken: kind === "legal_entity" ? `tok-${Date.now().toString(36).slice(-6)}` : undefined,
      };
      return [saved, ...prev];
    });
    return saved;
  }, []);

  const markGapUploaded = useCallback((caseId: string, gapId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const gaps = c.gaps.filter((g) => g.id !== gapId);
        const allClear = gaps.length === 0;
        return {
          ...c,
          gaps,
          status: allClear ? "in_review" : c.status,
          ownership: allClear ? "reviewer" : c.ownership,
          timeline: [
            {
              time: "ahora",
              title: "Documento recibido del cliente",
              detail: `Pendiente ${gapId} cargado por enlace de documentos`,
              tone: "ok",
            },
            ...c.timeline,
          ],
        };
      }),
    );
  }, []);

  const resolveGap = useCallback((caseId: string, gapId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const gaps = c.gaps.filter((g) => g.id !== gapId);
        return {
          ...c,
          gaps,
          timeline: [
            { time: "ahora", title: "Observación resuelta", detail: gapId, tone: "ok" },
            ...c.timeline,
          ],
        };
      }),
    );
  }, []);

  const requestClientDocs = useCallback((caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const token = c.intakeToken ?? `tok-${caseId.slice(-5).toLowerCase()}`;
        const gaps: Gap[] =
          c.gaps.length > 0
            ? c.gaps
            : [
                {
                  id: "g-new",
                  title: "Documento solicitado",
                  description: "El equipo pidió información adicional.",
                  action: "Subir documento",
                },
              ];
        return {
          ...c,
          intakeToken: token,
          gaps,
          status: "blocked",
          ownership: "client",
          timeline: [
            {
              time: "ahora",
              title: "Enlace de documentos enviado",
              detail: "El cliente debe completar las pendientes",
              tone: "warn",
            },
            ...c.timeline,
          ],
        };
      }),
    );
  }, []);

  const advanceCase = useCallback((caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        if (c.gaps.length > 0) return c;

        const idx = c.steps.findIndex((s) => s.state === "current" || s.state === "blocked");
        if (idx === -1) {
          return {
            ...c,
            status: "verified",
            verified: true,
            ownership: "engine",
            timeline: [
              {
                time: "ahora",
                title: "Persona verificada",
                detail: "Evento emitido hacia el core (stub)",
                tone: "ok",
              },
              ...c.timeline,
            ],
            steps: c.steps.map((s) => ({ ...s, state: "done" as const, detail: "Completado" })),
          };
        }

        const steps = c.steps.map((s, i) => {
          if (i < idx) return { ...s, state: "done" as const, detail: "Completado" };
          if (i === idx) return { ...s, state: "done" as const, detail: "Completado" };
          if (i === idx + 1) return { ...s, state: "current" as const, detail: "En curso" };
          return s;
        });

        const finished = idx + 1 >= c.steps.length;
        if (finished) {
          return {
            ...c,
            steps: c.steps.map((s) => ({ ...s, state: "done" as const, detail: "Completado" })),
            status: "verified",
            verified: true,
            ownership: "engine",
            timeline: [
              {
                time: "ahora",
                title: "Persona verificada",
                detail: "Evento emitido hacia el core (stub)",
                tone: "ok",
              },
              ...c.timeline,
            ],
          };
        }

        const nextLabel = steps[idx + 1]?.label ?? "Siguiente";
        return {
          ...c,
          steps,
          status: "processing",
          ownership: "engine",
          timeline: [
            {
              time: "ahora",
              title: `Avanzó a ${nextLabel}`,
              detail: "Acción de revisión en el prototipo",
              tone: "ok",
            },
            ...c.timeline,
          ],
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      cases,
      addCaseFromOnboarding,
      addCaseFromIngestion,
      markGapUploaded,
      advanceCase,
      resolveGap,
      requestClientDocs,
    }),
    [
      cases,
      addCaseFromOnboarding,
      addCaseFromIngestion,
      markGapUploaded,
      advanceCase,
      resolveGap,
      requestClientDocs,
    ],
  );

  return <CasesContext.Provider value={value}>{children}</CasesContext.Provider>;
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error("useCases must be used within CasesProvider");
  return ctx;
}
