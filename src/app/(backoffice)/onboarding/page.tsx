"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ProcessStepper } from "@/components/ProcessStepper";
import { useCases } from "@/lib/cases-context";
import { personKindLabel } from "@/lib/labels";
import {
  formatBytes,
  kindHintLabel,
  mockExtract,
  mockPackageForKind,
  type ExtractedFields,
  type IngestedDoc,
} from "@/lib/onboarding-ingest";
import type { OnboardingDraft, PersonKind, ProcessStep } from "@/lib/types";

const kinds: {
  id: PersonKind;
  title: string;
  blurb: string;
  expected: { id: string; label: string }[];
}[] = [
  {
    id: "legal_entity",
    title: "Persona moral",
    blurb: "Subí el paquete documental; Maak extrae RFC y razón social para que solo verifiques.",
    expected: [
      { id: "acta", label: "Acta constitutiva" },
      { id: "csf", label: "CSF" },
      { id: "poder", label: "Poder del RL" },
      { id: "ine", label: "INE del RL" },
    ],
  },
  {
    id: "natural_person",
    title: "Persona física",
    blurb: "INE + CSF (y domicilio si aplica). La extracción prellena identidad y RFC.",
    expected: [
      { id: "ine", label: "INE frente/reverso" },
      { id: "csf", label: "CSF" },
      { id: "dom", label: "Comprobante de domicilio (opc.)" },
    ],
  },
  {
    id: "cost_center",
    title: "Centro de costo",
    blurb: "Documentos del CC; el operador confirma el padre autorizado y los datos extraídos.",
    expected: [
      { id: "datos", label: "Datos del CC" },
      { id: "auth", label: "Autorización del padre" },
      { id: "ge", label: "GE (si aplica)" },
    ],
  },
];

type DocsScreen = "list" | "upload";
type UploadPhase = "idle" | "recognizing" | "done";

function previewSteps(kind: PersonKind): ProcessStep[] {
  if (kind === "cost_center") {
    return [
      { id: "01", label: "Documentos", state: "current", detail: "Ingesta" },
      { id: "02", label: "Vínculo padre", state: "todo", detail: "—" },
      { id: "03", label: "Gate GE", state: "todo", detail: "—" },
      { id: "04", label: "Listas", state: "todo", detail: "—" },
      { id: "05", label: "Verificación", state: "todo", detail: "—" },
    ];
  }
  if (kind === "natural_person") {
    return [
      { id: "01", label: "Documentos", state: "current", detail: "Ingesta" },
      { id: "02", label: "Identidad", state: "todo", detail: "—" },
      { id: "03", label: "Listas", state: "todo", detail: "—" },
      { id: "04", label: "Firma", state: "todo", detail: "—" },
      { id: "05", label: "Verificación", state: "todo", detail: "—" },
    ];
  }
  return [
    { id: "01", label: "Documentos", state: "current", detail: "Ingesta" },
    { id: "02", label: "Extracción", state: "todo", detail: "—" },
    { id: "03", label: "Riesgo", state: "todo", detail: "—" },
    { id: "04", label: "Firma", state: "todo", detail: "—" },
    { id: "05", label: "Verificación", state: "todo", detail: "—" },
  ];
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
  const [docsScreen, setDocsScreen] = useState<DocsScreen>("list");
  const [focusDoc, setFocusDoc] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [docs, setDocs] = useState<IngestedDoc[]>([]);
  const [extracted, setExtracted] = useState<ExtractedFields | null>(null);
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");
  const [email, setEmail] = useState("");
  const [parentCaseId, setParentCaseId] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const meta = kinds.find((k) => k.id === kind);
  const recognizing = uploadPhase === "recognizing";
  const canVerify =
    uploadPhase === "done" &&
    docs.length > 0 &&
    Boolean(name.trim() && email.trim()) &&
    (kind === "cost_center" ? Boolean(parentCaseId) : Boolean(rfc.trim()));

  function openUpload(docId?: string) {
    setFocusDoc(docId ?? null);
    setDocsScreen("upload");
    setUploadPhase("idle");
  }

  async function simulateUploadAndRecognize() {
    if (!kind || recognizing) return;

    const pack = mockPackageForKind(kind);
    setDocs(pack);
    setUploadPhase("recognizing");

    // Brief “files landed” beat, then backend recognition (~2s total).
    await wait(400);
    setDocs((prev) => prev.map((d) => ({ ...d, status: "reading" })));
    await wait(1600);
    const fields = mockExtract(kind, pack);
    setDocs((prev) =>
      prev.map((d) => ({
        ...d,
        status: d.kindHint === "otros" ? "low_confidence" : "extracted",
      })),
    );
    setExtracted(fields);
    setName(fields.name);
    setRfc(fields.rfc === "— (hereda del padre)" ? "" : fields.rfc);
    setEmail(fields.email);
    setUploadPhase("done");
    setDocsScreen("list");
    setStep(3);
  }

  function create() {
    if (!kind || !canVerify) return;
    const draft: OnboardingDraft = {
      kind,
      name: name.trim(),
      rfc: rfc.trim().toUpperCase() || (kind === "cost_center" ? "HEREDA-PADRE" : "PENDIENTE"),
      email: email.trim(),
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
        <h1 className="m-0 text-[22px] font-bold tracking-tight">Alta asistida</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Documentos primero: cargá el paquete → reconocimiento automático (~2s) → verificá RFC y
          datos.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold">
        {[
          [1, "Tipo"],
          [2, "Documentos"],
          [3, "Verificar"],
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
                setDocs([]);
                setExtracted(null);
                setUploadPhase("idle");
                setDocsScreen("list");
                setFocusDoc(null);
                setName("");
                setRfc("");
                setEmail("");
                setParentCaseId("");
                setStep(2);
              }}
              className="card mb-0 text-left hover:border-[var(--primary)]"
            >
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                {k.title}
              </div>
              <p className="mt-2 text-[13px] text-[var(--muted)]">{k.blurb}</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-[var(--ink-2)]">
                {k.expected.map((d) => (
                  <li key={d.id}>{d.label}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 && kind && meta ? (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          {docsScreen === "list" ? (
            <section className="card">
              <h2>Documentos requeridos</h2>
              <p className="mb-3 text-[13px] text-[var(--muted)]">
                Tocá un documento (o el botón de carga) para abrir la pantalla de subida. En el
                prototipo la carga es simulada.
              </p>
              <ul className="grid gap-2">
                {meta.expected.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      disabled={recognizing}
                      onClick={() => openUpload(d.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] disabled:opacity-50"
                    >
                      <div>
                        <div className="text-[13px] font-semibold">{d.label}</div>
                        <div className="text-[11px] text-[var(--muted)]">
                          Clic para cargar / simular paquete
                        </div>
                      </div>
                      <span className="text-[12px] font-bold text-[var(--primary)]">Cargar</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={recognizing}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)] disabled:opacity-40"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={recognizing}
                  onClick={() => openUpload()}
                  className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)] disabled:opacity-40"
                >
                  Cargar documentos
                </button>
              </div>
            </section>
          ) : (
            <section className="card">
              <h2>Subir documentos</h2>
              <p className="mb-3 text-[13px] text-[var(--muted)]">
                {focusDoc
                  ? `Carga iniciada desde «${meta.expected.find((d) => d.id === focusDoc)?.label}». `
                  : null}
                En el prototipo, un clic simula el paquete (ZIP descomprimido) y dispara el
                reconocimiento en backend.
              </p>

              <button
                type="button"
                disabled={recognizing}
                onClick={() => void simulateUploadAndRecognize()}
                aria-busy={recognizing}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed px-4 py-12 text-center transition-colors ${
                  recognizing
                    ? "border-[var(--warn)] bg-[var(--warn-bg)]"
                    : "border-[var(--line-strong)] bg-[var(--surface-2)]/40 hover:border-[var(--action)]"
                } disabled:cursor-wait`}
              >
                {recognizing ? (
                  <>
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-[var(--warn)] border-t-transparent" />
                    <span className="text-[14px] font-semibold tracking-tight text-[var(--warn)]">
                      Reconocimiento de datos en curso…
                    </span>
                    <span className="text-[12px] text-[var(--muted)]">
                      Clasificando documentos y extrayendo RFC / identidad (mock backend)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[14px] font-semibold tracking-tight">
                      Clic para simular carga del paquete
                    </span>
                    <span className="text-[12px] text-[var(--muted)]">
                      PDF / ZIP mock · sin diálogo de archivos
                    </span>
                  </>
                )}
              </button>

              {docs.length > 0 && recognizing ? (
                <ul className="mt-4 grid gap-2">
                  {docs.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-start justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold">{d.name}</div>
                        <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                          {kindHintLabel[d.kindHint]}
                          {d.source === "zip" ? ` · ${d.zipName}` : ""}
                          {d.size ? ` · ${formatBytes(d.size)}` : ""}
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-[var(--muted)]">
                        {d.status === "reading" ? "Leyendo" : "En cola"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={recognizing}
                  onClick={() => {
                    setDocsScreen("list");
                    setFocusDoc(null);
                  }}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)] disabled:opacity-40"
                >
                  Atrás
                </button>
              </div>
            </section>
          )}

          <section className="card">
            <h2>Recorrido {personKindLabel[kind]}</h2>
            <ProcessStepper steps={previewSteps(kind)} />
            <p className="mt-3 text-[12px] text-[var(--muted)]">
              Prototipo clickable: el reconocimiento dura ~2s y luego pasa a verificar datos.
            </p>
          </section>
        </div>
      ) : null}

      {step === 3 && kind && meta ? (
        <section className="card">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="!mb-1">Verificar datos extraídos</h2>
              <p className="m-0 text-[13px] text-[var(--muted)]">
                El reconocimiento ya corrió. Confirmá o corregí lo que salió del paquete.
              </p>
            </div>
            {extracted ? <ConfidencePill level={extracted.confidence} /> : null}
          </div>

          {docs.length > 0 ? (
            <div className="mb-4">
              <div className="mb-2 text-[12px] font-semibold text-[var(--ink-2)]">
                Paquete reconocido ({docs.length})
              </div>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {docs.map((d) => (
                  <li
                    key={d.id}
                    className="truncate rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[12px]"
                  >
                    <span className="font-medium">{d.name}</span>
                    <span className="text-[var(--muted)]"> · {kindHintLabel[d.kindHint]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {extracted?.notes.length ? (
            <ul className="mb-4 list-disc rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-[12px] text-[var(--ink-2)]">
              {extracted.notes.map((n) => (
                <li key={n} className="ml-3">
                  {n}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-[13px] md:col-span-2">
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
                placeholder={kind === "cost_center" ? "Opcional / hereda del padre" : undefined}
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
            {extracted?.representante ? (
              <label className="grid gap-1 text-[13px]">
                <span className="font-semibold text-[var(--ink-2)]">Representante (extraído)</span>
                <input
                  value={extracted.representante}
                  readOnly
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[var(--ink-2)]"
                />
              </label>
            ) : null}
            {extracted?.domicilio ? (
              <label className="grid gap-1 text-[13px]">
                <span className="font-semibold text-[var(--ink-2)]">Domicilio (extraído)</span>
                <input
                  value={extracted.domicilio}
                  readOnly
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[var(--ink-2)]"
                />
              </label>
            ) : null}
            {kind === "cost_center" ? (
              <label className="grid gap-1 text-[13px] md:col-span-2">
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
              onClick={() => {
                setStep(2);
                setDocsScreen("list");
              }}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)]"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={!canVerify}
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
            Quedó en casos pendientes con el paquete documental y los datos verificados por el
            operador.
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
              Ver casos pendientes
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}

function ConfidencePill({ level }: { level: ExtractedFields["confidence"] }) {
  const label =
    level === "high" ? "Alta confianza" : level === "medium" ? "Media confianza" : "Baja confianza";
  const cls =
    level === "high"
      ? "bg-[var(--ok-bg)] text-[var(--ok)]"
      : level === "medium"
        ? "bg-[var(--warn-bg)] text-[var(--warn)]"
        : "bg-[var(--fail-bg)] text-[var(--fail)]";
  return <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${cls}`}>{label}</span>;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="card">Cargando…</div>}>
      <OnboardingInner />
    </Suspense>
  );
}
