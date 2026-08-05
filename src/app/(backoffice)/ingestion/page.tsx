"use client";

import Link from "next/link";
import { useState } from "react";
import { useCases } from "@/lib/cases-context";
import { personKindLabel } from "@/lib/labels";
import type { PersonKind } from "@/lib/types";

const demos: Record<
  PersonKind,
  { from: string; subject: string; attachments: string; name: string; rfc: string }
> = {
  legal_entity: {
    from: "comercial@delta.mx",
    subject: "Alta PM — docs adjuntos (4)",
    attachments: "Acta.pdf · CSF.pdf · Poder.pdf · INE_RL.pdf",
    name: "Comercializadora Nueva SA de CV",
    rfc: "CNU860101XXX",
  },
  natural_person: {
    from: "maria.ruiz@mail.com",
    subject: "Alta PF — INE y CSF",
    attachments: "INE_frente.jpg · INE_reverso.jpg · CSF.pdf",
    name: "Juan Carlos Pérez Díaz",
    rfc: "PEDJ900101XXX",
  },
  cost_center: {
    from: "ops@acme.mx",
    subject: "Alta CC Acme-07 bajo padre",
    attachments: "solicitud_cc.xlsx · autorizacion.pdf",
    name: "CC Acme-07",
    rfc: "ACM120101XXX",
  },
};

export default function IngestionPage() {
  const { addCaseFromIngestion } = useCases();
  const [kind, setKind] = useState<PersonKind>("legal_entity");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const demo = demos[kind];

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        Agente / <strong className="font-semibold text-[var(--ink-2)]">Ingesta</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 text-[22px] font-bold tracking-tight">
          Ingesta desde correo
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          El agente convierte un correo con adjuntos en un caso tipado (PM, PF o centro de costo).
        </p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(demos) as PersonKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setCreatedId(null);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              kind === k
                ? "bg-[var(--action)] text-[var(--action-fg)]"
                : "border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
            }`}
          >
            {personKindLabel[k]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2>Entrada</h2>
          <div className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] p-3">
            <div className="text-xs text-[var(--muted)]">De: {demo.from} · hace 12s</div>
            <div className="my-1 font-bold">{demo.subject}</div>
            <div className="text-xs text-[var(--muted)]">{demo.attachments}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              const c = addCaseFromIngestion(kind, demo.name, demo.rfc);
              setCreatedId(c.id);
            }}
            className="mt-3 w-full rounded-lg bg-[var(--action)] px-3 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]"
          >
            Ejecutar agente
          </button>
        </section>

        <section className="card">
          <h2>Salida</h2>
          {!createdId ? (
            <p className="m-0 text-[13px] text-[var(--muted)]">Esperando ejecución…</p>
          ) : (
            <div className="rounded-[10px] border border-[var(--primary)] bg-[var(--primary-soft)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>{createdId}</strong> · {personKindLabel[kind]}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ok-bg)] px-2.5 py-1 text-xs font-bold text-[var(--ok)]">
                  Caso en revisión
                </span>
              </div>
              <div className="mt-1.5 text-xs text-[var(--ink-2)]">
                {demo.name} · {demo.rfc}
              </div>
              <Link href={`/cases/${createdId}`} className="mt-3 inline-block text-[13px] font-bold text-[var(--primary)]">
                Abrir caso →
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
