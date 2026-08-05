"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ProcessStepper } from "@/components/ProcessStepper";
import { useCases } from "@/lib/cases-context";
import { personKindLabel } from "@/lib/labels";
import {
  buildChecklist,
  formatBytes,
  mergeExtractedIntoForm,
  mockExtract,
  mockPackageForKind,
  templates,
  type ExtractedFields,
  type IngestedDoc,
} from "@/lib/onboarding-ingest";
import type { OnboardingDraft, PersonKind, ProcessStep } from "@/lib/types";

type UploadPhase = "idle" | "recognizing" | "done";
type FieldKey = "name" | "rfc" | "email";
type DirtyMap = Record<FieldKey, boolean>;
type Suggestions = Partial<Record<FieldKey, string>>;

function previewSteps(kind: PersonKind): ProcessStep[] {
  if (kind === "cost_center") {
    return [
      { id: "01", label: "Expediente", state: "current", detail: "Ahora" },
      { id: "02", label: "Vínculo padre", state: "todo", detail: "—" },
      { id: "03", label: "Gate GE", state: "todo", detail: "—" },
      { id: "04", label: "Listas", state: "todo", detail: "—" },
      { id: "05", label: "Verificación", state: "todo", detail: "—" },
    ];
  }
  if (kind === "natural_person") {
    return [
      { id: "01", label: "Expediente", state: "current", detail: "Ahora" },
      { id: "02", label: "Identidad", state: "todo", detail: "—" },
      { id: "03", label: "Listas", state: "todo", detail: "—" },
      { id: "04", label: "Firma", state: "todo", detail: "—" },
      { id: "05", label: "Verificación", state: "todo", detail: "—" },
    ];
  }
  return [
    { id: "01", label: "Expediente", state: "current", detail: "Ahora" },
    { id: "02", label: "Riesgo", state: "todo", detail: "—" },
    { id: "03", label: "Firma", state: "todo", detail: "—" },
    { id: "04", label: "Verificación", state: "todo", detail: "—" },
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

  const [step, setStep] = useState<1 | 2 | 3>(preset ? 2 : 1);
  const [kind, setKind] = useState<PersonKind | null>(
    preset && preset in templates ? preset : null,
  );
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [docs, setDocs] = useState<IngestedDoc[]>([]);
  const [extracted, setExtracted] = useState<ExtractedFields | null>(null);
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");
  const [email, setEmail] = useState("");
  const [parentCaseId, setParentCaseId] = useState("");
  const [dirty, setDirty] = useState<DirtyMap>({ name: false, rfc: false, email: false });
  const [suggestions, setSuggestions] = useState<Suggestions>({});
  const [createdId, setCreatedId] = useState<string | null>(null);

  const meta = kind ? templates[kind] : null;
  const recognizing = uploadPhase === "recognizing";
  const fieldsLocked = recognizing;
  const checklist = useMemo(
    () => (kind ? buildChecklist(kind, docs) : []),
    [kind, docs],
  );
  const requiredOk = checklist
    .filter((c) => c.required)
    .every((c) => c.state === "matched" || c.state === "low_confidence");
  const canCreate =
    uploadPhase === "done" &&
    requiredOk &&
    Boolean(name.trim() && email.trim()) &&
    (kind === "cost_center" ? Boolean(parentCaseId) : Boolean(rfc.trim()));

  function markDirty(key: FieldKey, value: string) {
    setDirty((d) => ({ ...d, [key]: true }));
    if (key === "name") setName(value);
    if (key === "rfc") setRfc(value.toUpperCase());
    if (key === "email") setEmail(value);
    setSuggestions((s) => {
      if (!s[key]) return s;
      const next = { ...s };
      delete next[key];
      return next;
    });
  }

  function applySuggestion(key: FieldKey) {
    const value = suggestions[key];
    if (!value) return;
    if (key === "name") setName(value);
    if (key === "rfc") setRfc(value);
    if (key === "email") setEmail(value);
    setDirty((d) => ({ ...d, [key]: true }));
    setSuggestions((s) => {
      const next = { ...s };
      delete next[key];
      return next;
    });
  }

  async function simulateUploadAndRecognize() {
    if (!kind || recognizing) return;

    const pack = mockPackageForKind(kind);
    setDocs(pack);
    setUploadPhase("recognizing");
    setSuggestions({});

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

    const { next, suggestions: pending } = mergeExtractedIntoForm(
      { name, rfc, email },
      dirty,
      fields,
    );
    setName(next.name);
    setRfc(next.rfc);
    setEmail(next.email);
    setSuggestions(pending);
    setUploadPhase("done");
  }

  function create() {
    if (!kind || !canCreate) return;
    const draft: OnboardingDraft = {
      kind,
      name: name.trim(),
      rfc: rfc.trim().toUpperCase() || (kind === "cost_center" ? "HEREDA-PADRE" : "PENDIENTE"),
      email: email.trim(),
      parentCaseId: parentCaseId || undefined,
    };
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
        <h1 className="m-0 text-[22px] font-bold tracking-tight">Alta asistida</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Una sola pantalla de expediente: carga (PDF/ZIP) + checklist del template + campos. Durante
          el reconocimiento los campos se bloquean para no pelear con el agente.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold">
        {[
          [1, "Tipo"],
          [2, "Expediente"],
          [3, "Listo"],
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
          {(Object.keys(templates) as PersonKind[]).map((id) => {
            const k = templates[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setKind(id);
                  setDocs([]);
                  setExtracted(null);
                  setUploadPhase("idle");
                  setName("");
                  setRfc("");
                  setEmail("");
                  setParentCaseId("");
                  setDirty({ name: false, rfc: false, email: false });
                  setSuggestions({});
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
                      {d.required ? "" : " (opc.)"}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      ) : null}

      {step === 2 && kind && meta ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
          <div className="grid gap-4">
            {/* Upload */}
            <section className="card mb-0">
              <h2 className="!mb-1">Carga documental</h2>
              <p className="mb-3 text-[13px] text-[var(--muted)]">
                Arrastrá o simulá un paquete (varios PDF o ZIP). El reconocimiento clasifica contra el
                template y propone valores en los campos de abajo.
              </p>
              <button
                type="button"
                disabled={recognizing}
                onClick={() => void simulateUploadAndRecognize()}
                aria-busy={recognizing}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed px-4 py-10 text-center transition-colors ${
                  recognizing
                    ? "border-[var(--warn)] bg-[var(--warn-bg)]"
                    : uploadPhase === "done"
                      ? "border-[var(--ok-line)] bg-[var(--ok-bg)]/40 hover:border-[var(--action)]"
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
                      Relacionando archivos del paquete con el template (~2s)
                    </span>
                  </>
                ) : uploadPhase === "done" ? (
                  <>
                    <span className="text-[14px] font-semibold tracking-tight text-[var(--ok)]">
                      Paquete cargado · clic para volver a simular
                    </span>
                    <span className="text-[12px] text-[var(--muted)]">
                      {docs.length} archivo{docs.length === 1 ? "" : "s"} · confianza{" "}
                      {extracted?.confidence ?? "—"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[14px] font-semibold tracking-tight">
                      Clic para simular carga (PDF / ZIP)
                    </span>
                    <span className="text-[12px] text-[var(--muted)]">
                      Prototipo: sin diálogo de archivos
                    </span>
                  </>
                )}
              </button>

              {docs.length > 0 ? (
                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {docs.map((d) => (
                    <li
                      key={d.id}
                      className="truncate rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[12px]"
                    >
                      <span className="font-medium">{d.name}</span>
                      <span className="text-[var(--muted)]">
                        {" "}
                        · {d.size ? formatBytes(d.size) : "ZIP"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            {/* Checklist + fields */}
            <section className="card mb-0">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="!mb-1">Template · {meta.title}</h2>
                  <p className="m-0 text-[13px] text-[var(--muted)]">
                    Checklist del template + campos del alta. Misma pantalla, una sola fuente de
                    verdad.
                  </p>
                </div>
                {extracted ? <ConfidencePill level={extracted.confidence} /> : null}
              </div>

              {recognizing ? (
                <div
                  className="mb-3 rounded-[var(--radius)] border border-[var(--warn-line)] bg-[var(--warn-bg)] px-3 py-2.5 text-[12.5px] text-[var(--warn)]"
                  role="status"
                >
                  El agente está relacionando documentos y campos. Los inputs quedan bloqueados unos
                  segundos para evitar pisar lo que estás tipeando.
                </div>
              ) : null}

              {Object.keys(suggestions).length > 0 ? (
                <div
                  className="mb-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] text-[var(--ink-2)]"
                  role="status"
                >
                  Hay valores del documento distintos a lo que editaste. No se sobrescribieron:
                  aplicá solo si querés.
                </div>
              ) : null}

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Checklist documental
                  </h3>
                  <ul className="grid gap-2">
                    {checklist.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-2 rounded-[var(--radius)] border border-[var(--line)] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold">{item.label}</div>
                          <div className="truncate text-[11px] text-[var(--muted)]">
                            {item.match
                              ? item.match.name
                              : item.required
                                ? "Pendiente en el paquete"
                                : "Opcional"}
                          </div>
                        </div>
                        <ChecklistState state={item.state} required={item.required} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Campos del template
                  </h3>
                  <div className="grid gap-3">
                    <Field
                      label={
                        kind === "natural_person"
                          ? "Nombre completo"
                          : kind === "cost_center"
                            ? "Nombre del centro de costo"
                            : "Razón social"
                      }
                      value={name}
                      locked={fieldsLocked}
                      suggestion={suggestions.name}
                      onChange={(v) => markDirty("name", v)}
                      onApplySuggestion={() => applySuggestion("name")}
                    />
                    <Field
                      label="RFC"
                      value={rfc}
                      locked={fieldsLocked}
                      suggestion={suggestions.rfc}
                      placeholder={kind === "cost_center" ? "Opcional / hereda del padre" : undefined}
                      onChange={(v) => markDirty("rfc", v)}
                      onApplySuggestion={() => applySuggestion("rfc")}
                    />
                    <Field
                      label="Correo de contacto"
                      value={email}
                      locked={fieldsLocked}
                      suggestion={suggestions.email}
                      type="email"
                      onChange={(v) => markDirty("email", v)}
                      onApplySuggestion={() => applySuggestion("email")}
                    />
                    {extracted?.representante ? (
                      <label className="grid gap-1 text-[13px]">
                        <span className="font-semibold text-[var(--ink-2)]">
                          Representante (solo lectura)
                        </span>
                        <input
                          value={extracted.representante}
                          readOnly
                          className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[var(--ink-2)]"
                        />
                      </label>
                    ) : null}
                    {kind === "cost_center" ? (
                      <label className="grid gap-1 text-[13px]">
                        <span className="font-semibold text-[var(--ink-2)]">Persona moral padre</span>
                        <select
                          value={parentCaseId}
                          disabled={fieldsLocked}
                          onChange={(e) => setParentCaseId(e.target.value)}
                          className="rounded-lg border border-[var(--line)] px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                </div>
              </div>

              {extracted?.notes.length ? (
                <ul className="mt-4 list-disc rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-[12px] text-[var(--ink-2)]">
                  {extracted.notes.map((n) => (
                    <li key={n} className="ml-3">
                      {n}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={recognizing}
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)] disabled:opacity-40"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={!canCreate || recognizing}
                  onClick={create}
                  className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)] disabled:opacity-40"
                >
                  Crear caso en revisión
                </button>
              </div>
            </section>
          </div>

          <aside className="card mb-0 h-fit">
            <h2>Recorrido {personKindLabel[kind]}</h2>
            <ProcessStepper steps={previewSteps(kind)} />
            <div className="mt-4 space-y-2 text-[12px] text-[var(--muted)]">
              <p className="m-0 font-semibold text-[var(--ink-2)]">Conflicto agente ↔ operador</p>
              <ul className="m-0 list-disc space-y-1 pl-4">
                <li>Mientras reconoce: campos bloqueados.</li>
                <li>Si ya editaste un campo: no se pisa; aparece «Usar valor del documento».</li>
                <li>Si el campo estaba vacío: se completa solo.</li>
              </ul>
            </div>
          </aside>
        </div>
      ) : null}

      {step === 3 && createdId ? (
        <section className="card text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--ok)]">Caso creado</div>
          <h2 className="!mb-2 mt-2">{createdId}</h2>
          <p className="text-[13px] text-[var(--muted)]">
            Expediente con paquete documental y campos verificados en la misma pantalla.
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

function Field({
  label,
  value,
  locked,
  suggestion,
  onChange,
  onApplySuggestion,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  locked: boolean;
  suggestion?: string;
  onChange: (v: string) => void;
  onApplySuggestion: () => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-[13px]">
      <span className="flex items-center justify-between gap-2 font-semibold text-[var(--ink-2)]">
        {label}
        {locked ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--warn)]">
            Bloqueado
          </span>
        ) : null}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--line)] px-3 py-2 disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:opacity-70"
      />
      {suggestion ? (
        <button
          type="button"
          onClick={onApplySuggestion}
          className="justify-self-start text-left text-[11px] font-semibold text-[var(--primary)] hover:underline"
        >
          Usar valor del documento: {suggestion}
        </button>
      ) : null}
    </label>
  );
}

function ChecklistState({
  state,
  required,
}: {
  state: "missing" | "matched" | "reading" | "low_confidence";
  required: boolean;
}) {
  if (state === "matched") {
    return <span className="shrink-0 text-[11px] font-bold text-[var(--ok)]">OK</span>;
  }
  if (state === "reading") {
    return <span className="shrink-0 text-[11px] font-bold text-[var(--warn)]">Leyendo</span>;
  }
  if (state === "low_confidence") {
    return <span className="shrink-0 text-[11px] font-bold text-[var(--warn)]">Revisar</span>;
  }
  return (
    <span className="shrink-0 text-[11px] font-bold text-[var(--muted)]">
      {required ? "Falta" : "Opc."}
    </span>
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
