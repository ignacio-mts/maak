"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { ProcessStepper } from "@/components/ProcessStepper";
import { useCases } from "@/lib/cases-context";
import { personKindLabel } from "@/lib/labels";
import {
  expandUploads,
  formatBytes,
  kindHintLabel,
  mockExtract,
  type ExtractedFields,
  type IngestedDoc,
} from "@/lib/onboarding-ingest";
import type { OnboardingDraft, PersonKind, ProcessStep } from "@/lib/types";

const kinds: {
  id: PersonKind;
  title: string;
  blurb: string;
  expected: string[];
}[] = [
  {
    id: "legal_entity",
    title: "Persona moral",
    blurb: "Subí el paquete documental; Maak extrae RFC y razón social para que solo verifiques.",
    expected: ["Acta constitutiva", "CSF", "Poder del RL", "INE del RL"],
  },
  {
    id: "natural_person",
    title: "Persona física",
    blurb: "INE + CSF (y domicilio si aplica). La extracción prellena identidad y RFC.",
    expected: ["INE frente/reverso", "CSF", "Comprobante de domicilio (opc.)"],
  },
  {
    id: "cost_center",
    title: "Centro de costo",
    blurb: "Documentos del CC; el operador confirma el padre autorizado y los datos extraídos.",
    expected: ["Datos del CC", "Autorización del padre", "GE (si aplica)"],
  },
];

type EvalPhase = "idle" | "unpacking" | "classifying" | "extracting" | "done";

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
  const [docs, setDocs] = useState<IngestedDoc[]>([]);
  const [evalPhase, setEvalPhase] = useState<EvalPhase>("idle");
  const [extracted, setExtracted] = useState<ExtractedFields | null>(null);
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");
  const [email, setEmail] = useState("");
  const [parentCaseId, setParentCaseId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const meta = kinds.find((k) => k.id === kind);
  const evaluating = evalPhase !== "idle" && evalPhase !== "done";
  const canVerify =
    evalPhase === "done" &&
    docs.length > 0 &&
    Boolean(name.trim() && email.trim()) &&
    (kind === "cost_center" ? Boolean(parentCaseId) : Boolean(rfc.trim()));

  async function ingestFiles(fileList: FileList | File[]) {
    if (!kind) return;
    setError(null);
    setBusy(true);
    setEvalPhase("unpacking");
    setExtracted(null);
    try {
      const expanded = await expandUploads(fileList);
      if (!expanded.length) {
        setError("No se encontraron archivos útiles (¿ZIP vacío o solo carpetas?).");
        setEvalPhase("idle");
        setDocs([]);
        return;
      }
      setDocs(expanded.map((d) => ({ ...d, status: "queued" })));
      setEvalPhase("classifying");
      await wait(450);
      setDocs((prev) => prev.map((d) => ({ ...d, status: "reading" })));
      setEvalPhase("extracting");
      await wait(700);
      const fields = mockExtract(kind, expanded);
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
      setEvalPhase("done");
    } catch {
      setError("No se pudo leer el archivo. Probá PDFs sueltos o un ZIP válido.");
      setEvalPhase("idle");
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) void ingestFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void ingestFiles(e.dataTransfer.files);
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
          Documentos primero: cargá PDF/ZIP → extracción automática → el operador solo verifica RFC y
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
                setEvalPhase("idle");
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
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 && kind && meta ? (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <section className="card">
            <h2>Carga documental</h2>
            <p className="mb-3 text-[13px] text-[var(--muted)]">
              Subí uno o varios archivos, o un <strong className="font-semibold text-[var(--ink-2)]">ZIP</strong>{" "}
              que se descomprime acá. Después corre la evaluación automática (clasificación + extracción
              mock).
            </p>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.zip,application/pdf,application/zip,image/*"
              className="sr-only"
              onChange={onPick}
            />

            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={onDrop}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed px-4 py-10 text-center transition-colors ${
                dragOver
                  ? "border-[var(--action)] bg-[var(--surface-2)]"
                  : "border-[var(--line-strong)] bg-[var(--surface-2)]/40 hover:border-[var(--action)]"
              } disabled:opacity-50`}
            >
              <span className="text-[14px] font-semibold tracking-tight">
                {busy ? "Procesando…" : "Soltá archivos o hacé clic para elegir"}
              </span>
              <span className="text-[12px] text-[var(--muted)]">
                PDF, imágenes o ZIP · varios a la vez
              </span>
            </button>

            {error ? (
              <p className="mt-3 text-[13px] font-medium text-[var(--fail)]" role="alert">
                {error}
              </p>
            ) : null}

            {docs.length > 0 ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="m-0 text-[13px] font-semibold">
                    {docs.length} documento{docs.length === 1 ? "" : "s"} en el paquete
                  </h3>
                  <EvalBadge phase={evalPhase} />
                </div>
                <ul className="grid gap-2">
                  {docs.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-start justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold">{d.name}</div>
                        <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                          {kindHintLabel[d.kindHint]}
                          {d.source === "zip" ? ` · desde ${d.zipName}` : ""}
                          {d.size ? ` · ${formatBytes(d.size)}` : ""}
                        </div>
                      </div>
                      <DocStatus status={d.status} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4 text-[12px] text-[var(--muted)]">
                Esperados para {meta.title}: {meta.expected.join(" · ")}
              </div>
            )}

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
                disabled={evalPhase !== "done" || !docs.length}
                onClick={() => setStep(3)}
                className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)] disabled:opacity-40"
              >
                Revisar datos extraídos
              </button>
            </div>
          </section>

          <section className="card">
            <h2>Recorrido {personKindLabel[kind]}</h2>
            <ProcessStepper steps={previewSteps(kind)} />
            <p className="mt-3 text-[12px] text-[var(--muted)]">
              Prototipo: la extracción es simulada. En ola 2 corre el worker de ingesta + reglas
              documentales.
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
                No hace falta cargar todo a mano: confirmá o corregí lo que salió del paquete
                documental.
              </p>
            </div>
            {extracted ? <ConfidencePill level={extracted.confidence} /> : null}
          </div>

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

          <div className="mt-3 text-[12px] text-[var(--muted)]">
            Paquete: {docs.length} archivo{docs.length === 1 ? "" : "s"} ·{" "}
            {docs.filter((d) => d.status === "extracted").length} clasificados
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
              disabled={!canVerify || evaluating}
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

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function EvalBadge({ phase }: { phase: EvalPhase }) {
  const map: Record<EvalPhase, string> = {
    idle: "Sin evaluar",
    unpacking: "Descomprimiendo…",
    classifying: "Clasificando…",
    extracting: "Extrayendo datos…",
    done: "Evaluación lista",
  };
  const done = phase === "done";
  return (
    <span
      className={`rounded-md px-2 py-1 text-[11px] font-bold ${
        done
          ? "bg-[var(--ok-bg)] text-[var(--ok)]"
          : phase === "idle"
            ? "bg-[var(--surface-2)] text-[var(--muted)]"
            : "bg-[var(--warn-bg)] text-[var(--warn)]"
      }`}
    >
      {map[phase]}
    </span>
  );
}

function DocStatus({ status }: { status: IngestedDoc["status"] }) {
  const label =
    status === "extracted"
      ? "OK"
      : status === "low_confidence"
        ? "Revisar"
        : status === "reading"
          ? "Leyendo"
          : "En cola";
  return (
    <span className="shrink-0 text-[11px] font-bold tabular-nums text-[var(--muted)]">{label}</span>
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
