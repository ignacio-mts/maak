"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ProcessStepper } from "@/components/ProcessStepper";
import { useCases } from "@/lib/cases-context";
import { personKindLabel } from "@/lib/labels";
import type { OnboardingDraft, PersonKind, ProcessStep } from "@/lib/types";

const kinds: {
  id: PersonKind;
  title: string;
  blurb: string;
  docs: { id: string; label: string; required: boolean }[];
}[] = [
  {
    id: "legal_entity",
    title: "Persona moral",
    blurb: "Onboarding completo: expediente, riesgo, firma de contrato y verificación.",
    docs: [
      { id: "acta", label: "Acta constitutiva (PDF completo)", required: true },
      { id: "csf", label: "Constancia de situación fiscal", required: true },
      { id: "poder", label: "Poder notarial del RL (≥ 12 meses)", required: true },
      { id: "ine", label: "INE del representante legal", required: true },
    ],
  },
  {
    id: "natural_person",
    title: "Persona física",
    blurb: "Identidad (INE), domicilio, listas y firma.",
    docs: [
      { id: "ine_f", label: "INE — frente", required: true },
      { id: "ine_r", label: "INE — reverso", required: true },
      { id: "csf", label: "Constancia de situación fiscal", required: true },
      { id: "dom", label: "Comprobante de domicilio", required: false },
    ],
  },
  {
    id: "cost_center",
    title: "Centro de costo",
    blurb: "Persona hija bajo un padre verificado. Gate GE + listas.",
    docs: [
      { id: "datos", label: "Datos del centro de costo", required: true },
      { id: "auth", label: "Autorización del padre", required: true },
      { id: "ge", label: "Información GE (si el padre lo exige)", required: false },
    ],
  },
];

function previewSteps(kind: PersonKind): ProcessStep[] {
  if (kind === "cost_center") {
    return [
      { id: "01", label: "Alta CC", state: "current", detail: "Ahora" },
      { id: "02", label: "Vínculo padre", state: "todo", detail: "—" },
      { id: "03", label: "Gate GE", state: "todo", detail: "—" },
      { id: "04", label: "Listas", state: "todo", detail: "—" },
      { id: "05", label: "Verificación", state: "todo", detail: "—" },
    ];
  }
  if (kind === "natural_person") {
    return [
      { id: "01", label: "Datos", state: "current", detail: "Ahora" },
      { id: "02", label: "Identidad", state: "todo", detail: "—" },
      { id: "03", label: "Listas", state: "todo", detail: "—" },
      { id: "04", label: "Firma", state: "todo", detail: "—" },
      { id: "05", label: "Verificación", state: "todo", detail: "—" },
    ];
  }
  return [
    { id: "01", label: "Datos", state: "current", detail: "Ahora" },
    { id: "02", label: "Documentos", state: "todo", detail: "—" },
    { id: "03", label: "Riesgo", state: "todo", detail: "—" },
    { id: "04", label: "Firma", state: "todo", detail: "—" },
    { id: "05", label: "Verificación", state: "todo", detail: "—" },
  ];
}

function OnboardingInner() {
  const router = useRouter();
  const search = useSearchParams();
  const preset = search.get("kind") as PersonKind | null;
  const { cases, addCaseFromOnboarding, completeCaseToVerified } = useCases();
  const parents = useMemo(
    () =>
      cases.filter(
        (c) =>
          c.kind === "legal_entity" &&
          (c.verified || c.status === "verified" || c.status === "in_review"),
      ),
    [cases],
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(preset ? 2 : 1);
  const [kind, setKind] = useState<PersonKind | null>(
    preset && kinds.some((k) => k.id === preset) ? preset : null,
  );
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");
  const [email, setEmail] = useState("");
  const [parentCaseId, setParentCaseId] = useState("");
  const [docsOk, setDocsOk] = useState<Record<string, boolean>>({});
  const [createdId, setCreatedId] = useState<string | null>(null);

  const meta = kinds.find((k) => k.id === kind);
  const requiredDocs = meta?.docs.filter((d) => d.required) ?? [];
  const docsReady = requiredDocs.every((d) => docsOk[d.id]);

  function create() {
    if (!kind || !name || !rfc || !email || !docsReady) return;
    if (kind === "cost_center" && !parentCaseId) return;
    const draft: OnboardingDraft = {
      kind,
      name,
      rfc,
      email,
      parentCaseId: parentCaseId || undefined,
    };
    const created = addCaseFromOnboarding(draft);
    setCreatedId(created.id);
    setStep(4);
  }

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        Operación / <strong className="font-semibold text-[var(--ink-2)]">Nueva alta</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">
          Alta asistida
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Recorrido guiado: tipo → datos → documentos → caso en revisión.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold">
        {[
          [1, "Tipo"],
          [2, "Datos"],
          [3, "Documentos"],
          [4, "Listo"],
        ].map(([n, label]) => (
          <div
            key={n as number}
            className={`rounded-full px-3 py-1.5 ${
              step === n
                ? "bg-[var(--action)] text-[var(--action-fg)]"
                : step > (n as number)
                  ? "bg-[var(--ok-bg)] text-[var(--ok)]"
                  : "bg-[var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            {label as string}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                setKind(k.id);
                setDocsOk({});
                setStep(2);
              }}
              className="card mb-0 text-left hover:border-[var(--primary)]"
            >
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                {k.title}
              </div>
              <p className="mt-2 text-[13px] text-[var(--muted)]">{k.blurb}</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-[var(--ink-2)]">
                {k.docs.map((d) => (
                  <li key={d.id}>
                    {d.label}
                    {d.required ? "" : " (opcional)"}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 && kind && meta ? (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <section className="card">
            <h2>{meta.title}</h2>
            <div className="grid gap-3">
              <label className="grid gap-1 text-[13px]">
                <span className="font-semibold text-[var(--ink-2)]">
                  {kind === "natural_person"
                    ? "Nombre completo"
                    : kind === "cost_center"
                      ? "Nombre del centro de costo"
                      : "Razón social"}
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-[13px]">
                <span className="font-semibold text-[var(--ink-2)]">RFC</span>
                <input
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  className="rounded-lg border border-[var(--line)] px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-[13px]">
                <span className="font-semibold text-[var(--ink-2)]">Correo de contacto</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2"
                />
              </label>
              {kind === "cost_center" ? (
                <label className="grid gap-1 text-[13px]">
                  <span className="font-semibold text-[var(--ink-2)]">Persona moral padre</span>
                  <select
                    value={parentCaseId}
                    onChange={(e) => setParentCaseId(e.target.value)}
                    className="rounded-lg border border-[var(--line)] px-3 py-2"
                  >
                    <option value="">Seleccionar…</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)]"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={
                  !name || !rfc || !email || (kind === "cost_center" && !parentCaseId)
                }
                onClick={() => setStep(3)}
                className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)] disabled:opacity-40"
              >
                Continuar a documentos
              </button>
            </div>
          </section>
          <section className="card">
            <h2>Recorrido {personKindLabel[kind]}</h2>
            <ProcessStepper steps={previewSteps(kind)} />
          </section>
        </div>
      ) : null}

      {step === 3 && kind && meta ? (
        <section className="card">
          <h2>Checklist documental</h2>
          <p className="mb-3 text-[13px] text-[var(--muted)]">
            En el prototipo, marcá cada ítem como cargado. Los obligatorios desbloquean la creación del caso.
          </p>
          <div className="grid gap-2">
            {meta.docs.map((d) => (
              <label
                key={d.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--line)] px-3 py-3"
              >
                <div>
                  <div className="text-[13px] font-semibold">{d.label}</div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {d.required ? "Obligatorio" : "Opcional"}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!docsOk[d.id]}
                  onChange={(e) => setDocsOk((s) => ({ ...s, [d.id]: e.target.checked }))}
                  className="h-4 w-4"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)]"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={!docsReady}
              onClick={create}
              className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)] disabled:opacity-40"
            >
              Crear caso en revisión
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 && createdId ? (
        <section className="card text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--ok)]">Caso creado</div>
          <h2 className="!mb-2 mt-2">{createdId}</h2>
          <p className="text-[13px] text-[var(--muted)]">
            Quedó en cola de revisión. Podés seguir el detalle etapa por etapa, o simular el cierre E2E hasta
            persona verificada.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/cases/${createdId}`)}
              className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]"
            >
              Abrir caso
            </button>
            <button
              type="button"
              onClick={() => {
                completeCaseToVerified(createdId);
                router.push(`/cases/${createdId}`);
              }}
              className="rounded-lg border border-[var(--ok)] bg-[var(--ok-bg)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--ok)]"
            >
              Simular hasta verificación
            </button>
            <Link
              href="/cases"
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)]"
            >
              Ver cola
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="card">Cargando…</div>}>
      <OnboardingInner />
    </Suspense>
  );
}
