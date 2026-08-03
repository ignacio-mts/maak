"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ProcessStepper } from "@/components/ProcessStepper";
import { useCases } from "@/lib/cases-context";
import { personKindLabel } from "@/lib/labels";
import type { OnboardingDraft, PersonKind, ProcessStep } from "@/lib/types";

const kinds: { id: PersonKind; title: string; blurb: string; docs: string[] }[] = [
  {
    id: "legal_entity",
    title: "Persona moral",
    blurb: "Onboarding completo: expediente, riesgo, firma de contrato y verificación.",
    docs: ["Acta constitutiva", "CSF", "Poderes", "INE del RL"],
  },
  {
    id: "natural_person",
    title: "Persona física",
    blurb: "Identidad (INE), domicilio, listas y firma.",
    docs: ["INE frente/reverso", "CSF", "Comprobante de domicilio"],
  },
  {
    id: "cost_center",
    title: "Centro de costo",
    blurb: "Persona hija bajo un padre verificado. Gate GE + listas.",
    docs: ["Datos del CC", "Autorización del padre", "GE si aplica"],
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
  const { cases, addCaseFromOnboarding } = useCases();
  const parents = useMemo(
    () => cases.filter((c) => c.kind === "legal_entity" && (c.verified || c.status === "verified" || c.status === "in_review")),
    [cases],
  );

  const [step, setStep] = useState<1 | 2 | 3>(preset ? 2 : 1);
  const [kind, setKind] = useState<PersonKind | null>(preset && kinds.some((k) => k.id === preset) ? preset : null);
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");
  const [email, setEmail] = useState("");
  const [parentCaseId, setParentCaseId] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const meta = kinds.find((k) => k.id === kind);

  function create() {
    if (!kind || !name || !rfc || !email) return;
    if (kind === "cost_center" && !parentCaseId) return;
    const draft: OnboardingDraft = { kind, name, rfc, email, parentCaseId: parentCaseId || undefined };
    const created = addCaseFromOnboarding(draft);
    setCreatedId(created.id);
    setStep(3);
  }

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        Operación / <strong className="font-semibold text-[var(--ink-2)]">Nueva alta</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">Alta asistida</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Elegí el tipo de persona, capturá datos mínimos y abrí el caso en la cola de revisión.
        </p>
      </header>

      <div className="mb-4 flex gap-2 text-xs font-bold">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`rounded-full px-3 py-1.5 ${
              step === n ? "bg-[var(--primary)] text-white" : step > n ? "bg-[var(--ok-bg)] text-[var(--ok)]" : "bg-[#E2E8F0] text-[var(--muted)]"
            }`}
          >
            {n === 1 ? "Tipo" : n === 2 ? "Datos" : "Listo"}
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
                setStep(2);
              }}
              className="card mb-0 text-left hover:border-[var(--primary)]"
            >
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">{k.title}</div>
              <p className="mt-2 text-[13px] text-[var(--muted)]">{k.blurb}</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-[var(--ink-2)]">
                {k.docs.map((d) => (
                  <li key={d}>{d}</li>
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
                  {kind === "natural_person" ? "Nombre completo" : kind === "cost_center" ? "Nombre del centro de costo" : "Razón social"}
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2"
                  placeholder={kind === "natural_person" ? "Nombre y apellidos" : "Razón social / CC"}
                />
              </label>
              <label className="grid gap-1 text-[13px]">
                <span className="font-semibold text-[var(--ink-2)]">RFC</span>
                <input value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} className="rounded-lg border border-[var(--line)] px-3 py-2" />
              </label>
              <label className="grid gap-1 text-[13px]">
                <span className="font-semibold text-[var(--ink-2)]">Correo de contacto</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-[var(--line)] px-3 py-2" />
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
              <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-[13px] font-bold">
                Atrás
              </button>
              <button
                type="button"
                onClick={create}
                className="rounded-lg bg-[var(--primary)] px-3.5 py-2.5 text-[13px] font-bold text-white"
              >
                Crear caso
              </button>
            </div>
          </section>
          <section className="card">
            <h2>Recorrido {personKindLabel[kind]}</h2>
            <ProcessStepper steps={previewSteps(kind)} />
            <p className="mt-3 text-[13px] text-[var(--muted)]">
              Documentos típicos: {meta.docs.join(" · ")}.
            </p>
          </section>
        </div>
      ) : null}

      {step === 3 && createdId ? (
        <section className="card text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--ok)]">Caso creado</div>
          <h2 className="!mb-2 mt-2">{createdId}</h2>
          <p className="text-[13px] text-[var(--muted)]">
            Quedó en cola de revisión. Desde el detalle podés avanzar etapas, pedir documentos al cliente o emitir la verificación.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/cases/${createdId}`)}
              className="rounded-lg bg-[var(--primary)] px-3.5 py-2.5 text-[13px] font-bold text-white"
            >
              Abrir caso
            </button>
            <Link href="/cases" className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-[13px] font-bold">
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
