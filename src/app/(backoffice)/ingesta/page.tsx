"use client";

import Link from "next/link";
import { useState } from "react";

export default function IngestaPage() {
  const [done, setDone] = useState(false);

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        Agente / <strong className="font-semibold text-[var(--ink-2)]">Ingesta</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">Ingesta desde mail</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          El agente convierte un mail con adjuntos en un ComplianceCase tipado.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2>Entrada</h2>
          <div className="rounded-[10px] border border-[var(--line)] bg-[#F8FAFC] p-3">
            <div className="text-xs text-[var(--muted)]">De: comercial@delta.mx · hace 12s</div>
            <div className="my-1 font-bold">Alta PM — docs adjuntos (4)</div>
            <div className="text-xs text-[var(--muted)]">Acta.pdf · CSF.pdf · Poder.pdf · INE_RL.pdf</div>
          </div>
          <button
            type="button"
            onClick={() => setDone(true)}
            className="mt-3 w-full rounded-lg bg-[var(--primary)] px-3 py-2.5 text-[13px] font-bold text-white"
          >
            Ejecutar agente Maak
          </button>
        </section>

        <section className="card">
          <h2>Salida</h2>
          {!done ? (
            <p className="m-0 text-[13px] text-[var(--muted)]">Esperando ejecución…</p>
          ) : (
            <div className="rounded-[10px] border border-[var(--primary)] bg-[var(--primary-soft)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>CSK-2026-08422</strong> creado · T-PM-STD
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ok-bg)] px-2.5 py-1 text-xs font-bold text-[var(--ok)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  CSF auto-OK
                </span>
              </div>
              <div className="mt-1.5 text-xs text-[var(--ink-2)]">Cola HITL · gap preliminar: validar poderes</div>
              <Link href="/cola" className="mt-3 inline-block text-[13px] font-bold text-[var(--primary)]">
                Ver en cola →
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
