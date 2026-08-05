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
export function mockExtract(
  kind: PersonKind,
  docs: IngestedDoc[],
): ExtractedFields {
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

  // cost center
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
