"use client";

import { useState } from "react";
import { rules } from "@/lib/data";
import type { Rule } from "@/lib/types";

export default function ReglasPage() {
  const [preview, setPreview] = useState<Rule | null>(null);
  const [published, setPublished] = useState<string | null>(null);

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        PLD / Ops / <strong className="font-semibold text-[var(--ink-2)]">Reglas</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">Diccionario de reglas</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Al publicar, el motor muestra impacto (RecheckJob) antes de confirmar.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <section className="card">
          <h2>Reglas</h2>
          {rules.map((r) => (
            <div
              key={r.id}
              className="mb-2 grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-[var(--line)] p-2.5"
            >
              <div>
                <div className="font-bold">{r.id}</div>
                <div className="text-xs text-[var(--muted)]">{r.description}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {r.from} → <b className="text-[var(--primary)]">{r.to}</b>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreview(r);
                  setPublished(null);
                }}
                className="rounded-lg bg-[var(--primary)] px-3.5 py-2.5 text-[13px] font-bold text-white"
              >
                Publicar
              </button>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>RecheckJob preview</h2>
          {!preview ? (
            <p className="m-0 text-[13px] text-[var(--muted)]">Seleccioná una regla para ver impacto.</p>
          ) : (
            <>
              <div className="rounded-[10px] bg-[var(--ink)] p-3.5 text-white">
                RecheckJob preview · <b className="text-[#93C5FD]">{preview.impact.personas} Personas</b>
                <br />
                <span className="text-xs opacity-85">
                  {preview.impact.pass} PASS · {preview.impact.adequacy} → AdequacyPlan · {preview.impact.block} bloqueo potencial
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPublished(preview.id)}
                className="mt-3 w-full rounded-lg bg-[var(--primary)] px-3 py-2.5 text-[13px] font-bold text-white"
              >
                Confirmar publicación
              </button>
              {published ? (
                <p className="mt-2 text-[13px] font-semibold text-[var(--ok)]">
                  {published} publicada (mock). Job encolado.
                </p>
              ) : null}
            </>
          )}
        </section>
      </div>
    </>
  );
}
