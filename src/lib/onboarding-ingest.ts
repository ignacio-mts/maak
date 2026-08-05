import JSZip from "jszip";
import type { PersonKind } from "@/lib/types";

export type IngestedDoc = {
  id: string;
  name: string;
  size: number;
  source: "file" | "zip";
  zipName?: string;
  /** Heuristic classification for the mock evaluator */
  kindHint:
    | "acta"
    | "csf"
    | "poder"
    | "ine"
    | "domicilio"
    | "autorizacion"
    | "ge"
    | "otros";
  status: "queued" | "reading" | "extracted" | "low_confidence";
};

export type ExtractedFields = {
  name: string;
  rfc: string;
  email: string;
  domicilio?: string;
  representante?: string;
  confidence: "high" | "medium" | "low";
  notes: string[];
};

export type TemplateDoc = {
  id: string;
  label: string;
  required: boolean;
  hints: IngestedDoc["kindHint"][];
};

export type ChecklistItem = TemplateDoc & {
  match: IngestedDoc | null;
  state: "missing" | "matched" | "reading" | "low_confidence";
};

const DOC_HINTS: { re: RegExp; hint: IngestedDoc["kindHint"] }[] = [
  { re: /acta|constitut/i, hint: "acta" },
  { re: /csf|situaci[oó]n\s*fiscal|constancia/i, hint: "csf" },
  { re: /poder|notarial/i, hint: "poder" },
  { re: /ine|identificaci[oó]n|credencial/i, hint: "ine" },
  { re: /domicilio|comprobante|cfe|telmex/i, hint: "domicilio" },
  { re: /autoriz|padre|vincul/i, hint: "autorizacion" },
  { re: /\bge\b|grupo\s*empresarial/i, hint: "ge" },
];

function classifyName(name: string): IngestedDoc["kindHint"] {
  for (const { re, hint } of DOC_HINTS) {
    if (re.test(name)) return hint;
  }
  return "otros";
}

function isArchive(file: File) {
  return (
    file.name.toLowerCase().endsWith(".zip") ||
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed"
  );
}

export const templates: Record<
  PersonKind,
  { title: string; blurb: string; docs: TemplateDoc[] }
> = {
  legal_entity: {
    title: "Persona moral",
    blurb: "Paquete documental → reconocimiento → el operador confirma campos del template.",
    docs: [
      { id: "acta", label: "Acta constitutiva (PDF completo)", required: true, hints: ["acta"] },
      { id: "csf", label: "Constancia de situación fiscal", required: true, hints: ["csf"] },
      { id: "poder", label: "Poder notarial del RL", required: true, hints: ["poder"] },
      { id: "ine", label: "INE del representante legal", required: true, hints: ["ine"] },
    ],
  },
  natural_person: {
    title: "Persona física",
    blurb: "INE + CSF (y domicilio si aplica). La extracción prellena identidad y RFC.",
    docs: [
      { id: "ine", label: "INE — frente / reverso", required: true, hints: ["ine"] },
      { id: "csf", label: "Constancia de situación fiscal", required: true, hints: ["csf"] },
      {
        id: "dom",
        label: "Comprobante de domicilio",
        required: false,
        hints: ["domicilio"],
      },
    ],
  },
  cost_center: {
    title: "Centro de costo",
    blurb: "Docs del CC + confirmación del padre autorizado.",
    docs: [
      { id: "datos", label: "Datos del centro de costo", required: true, hints: ["otros"] },
      {
        id: "auth",
        label: "Autorización del padre",
        required: true,
        hints: ["autorizacion"],
      },
      { id: "ge", label: "Información GE", required: false, hints: ["ge"] },
    ],
  },
};

/** Expand selected files; ZIP archives are unzipped client-side. */
export async function expandUploads(files: FileList | File[]): Promise<IngestedDoc[]> {
  const list = Array.from(files);
  const out: IngestedDoc[] = [];
  let seq = 0;

  for (const file of list) {
    if (isArchive(file)) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const entries = Object.values(zip.files).filter(
        (e) => !e.dir && !e.name.startsWith("__MACOSX/") && !e.name.split("/").pop()?.startsWith("."),
      );
      for (const entry of entries) {
        const base = entry.name.split("/").pop() || entry.name;
        out.push({
          id: `doc-${++seq}`,
          name: base,
          size: 0,
          source: "zip",
          zipName: file.name,
          kindHint: classifyName(base),
          status: "queued",
        });
      }
      continue;
    }

    out.push({
      id: `doc-${++seq}`,
      name: file.name,
      size: file.size,
      source: "file",
      kindHint: classifyName(file.name),
      status: "queued",
    });
  }

  return out;
}

/** Mock OCR / extraction — prototype only; no real document AI. */
export function mockExtract(kind: PersonKind, docs: IngestedDoc[]): ExtractedFields {
  const hasCsf = docs.some((d) => d.kindHint === "csf");
  const hasActa = docs.some((d) => d.kindHint === "acta");
  const hasIne = docs.some((d) => d.kindHint === "ine");
  const notes: string[] = [];

  if (kind === "legal_entity") {
    if (hasCsf) notes.push("RFC y razón social sugeridos desde CSF.");
    if (hasActa) notes.push("Representante legal detectado en acta (mock).");
    if (!hasCsf) notes.push("Sin CSF clara: confianza media en RFC.");
    return {
      name: hasActa || hasCsf ? "Comercializadora Norte del Pacífico SA de CV" : "",
      rfc: hasCsf ? "CNP850214XX1" : "",
      email: "altas@nortepacifico.example",
      representante: hasActa || hasIne ? "María Elena Ruiz Soto" : "",
      domicilio: hasCsf ? "Av. Reforma 222, CDMX" : "",
      confidence: hasCsf && hasActa ? "high" : hasCsf || hasActa ? "medium" : "low",
      notes,
    };
  }

  if (kind === "natural_person") {
    if (hasIne) notes.push("Nombre y CURP/RFC sugeridos desde INE (mock).");
    if (hasCsf) notes.push("RFC cruzado con CSF.");
    return {
      name: hasIne ? "Juan Carlos Pérez Gómez" : "",
      rfc: hasCsf || hasIne ? "PEGJ850214XXX" : "",
      email: "juan.perez@example.com",
      domicilio: docs.some((d) => d.kindHint === "domicilio")
        ? "Calle Cedros 14, Guadalajara, Jal."
        : "",
      confidence: hasIne && hasCsf ? "high" : hasIne || hasCsf ? "medium" : "low",
      notes,
    };
  }

  notes.push("Nombre de CC sugerido; el vínculo al padre lo confirma el operador.");
  return {
    name: "CC Operaciones Noreste",
    rfc: hasCsf ? "CNP850214XX1" : "— (hereda del padre)",
    email: "cc.noreste@nortepacifico.example",
    confidence: "medium",
    notes,
  };
}

export function formatBytes(n: number) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Prototype: fake ZIP unpack without a real file dialog. */
export function mockPackageForKind(kind: PersonKind): IngestedDoc[] {
  const packs: Record<PersonKind, { name: string; hint: IngestedDoc["kindHint"] }[]> = {
    legal_entity: [
      { name: "Acta_constitutiva.pdf", hint: "acta" },
      { name: "CSF_CNP850214XX1.pdf", hint: "csf" },
      { name: "Poder_notarial_RL.pdf", hint: "poder" },
      { name: "INE_representante.pdf", hint: "ine" },
    ],
    natural_person: [
      { name: "INE_frente.jpg", hint: "ine" },
      { name: "INE_reverso.jpg", hint: "ine" },
      { name: "CSF.pdf", hint: "csf" },
      { name: "Comprobante_domicilio.pdf", hint: "domicilio" },
    ],
    cost_center: [
      { name: "Datos_CC_Noreste.pdf", hint: "otros" },
      { name: "Autorizacion_padre.pdf", hint: "autorizacion" },
      { name: "GE_grupo.pdf", hint: "ge" },
    ],
  };

  return packs[kind].map((item, i) => ({
    id: `mock-${i + 1}`,
    name: item.name,
    size: 240_000 + i * 37_000,
    source: "zip" as const,
    zipName: "paquete_cliente.zip",
    kindHint: item.hint,
    status: "queued" as const,
  }));
}

export function buildChecklist(kind: PersonKind, docs: IngestedDoc[]): ChecklistItem[] {
  const used = new Set<string>();
  return templates[kind].docs.map((slot) => {
    const match =
      docs.find((d) => slot.hints.includes(d.kindHint) && !used.has(d.id)) ?? null;
    if (match) used.add(match.id);
    let state: ChecklistItem["state"] = "missing";
    if (match) {
      if (match.status === "reading" || match.status === "queued") state = "reading";
      else if (match.status === "low_confidence") state = "low_confidence";
      else state = "matched";
    }
    return { ...slot, match, state };
  });
}

export const kindHintLabel: Record<IngestedDoc["kindHint"], string> = {
  acta: "Acta",
  csf: "CSF",
  poder: "Poder",
  ine: "INE",
  domicilio: "Domicilio",
  autorizacion: "Autorización",
  ge: "GE",
  otros: "Sin clasificar",
};

/**
 * Merge extraction into form values without clobbering operator edits.
 * Dirty fields keep their value and surface a suggestion instead.
 */
export function mergeExtractedIntoForm(
  current: { name: string; rfc: string; email: string },
  dirty: { name: boolean; rfc: boolean; email: boolean },
  extracted: ExtractedFields,
): {
  next: { name: string; rfc: string; email: string };
  suggestions: Partial<{ name: string; rfc: string; email: string }>;
} {
  const extractedRfc =
    extracted.rfc === "— (hereda del padre)" ? "" : extracted.rfc;
  const suggestions: Partial<{ name: string; rfc: string; email: string }> = {};
  const next = { ...current };

  (["name", "rfc", "email"] as const).forEach((key) => {
    const proposed = key === "rfc" ? extractedRfc : extracted[key];
    if (!proposed) return;
    if (dirty[key] && current[key].trim() && current[key].trim() !== proposed.trim()) {
      suggestions[key] = proposed;
      return;
    }
    if (!dirty[key] || !current[key].trim()) {
      next[key] = proposed;
    }
  });

  return { next, suggestions };
}
