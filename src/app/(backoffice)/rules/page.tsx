"use client";

import { useMemo, useState } from "react";
import { rules } from "@/lib/data";
import { personKindLabel } from "@/lib/labels";
import type { PersonKind, Rule } from "@/lib/types";

export default function RulesPage() {
  const [filter, setFilter] = useState<"all" | PersonKind>("all");
  const [preview, setPreview] = useState<Rule | null>(null);
  const [published, setPublished] = useState<string | null>(null);

  const list = useMemo(
    () => (filter === "all" ? rules : rules.filter((r) => r.appliesTo.includes(filter))),
    [filter],
  );

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        Configuración / <strong className="font-semibold text-[var(--ink-2)]">Reglas</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">
          Diccionario de reglas
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Un motor para agente, portal y revisión. Al publicar, se muestra el impacto (reproceso) antes de confirmar.
        </p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["all", "Todas"],
            ["legal_entity", "Persona moral"],
            ["natural_person", "Persona física"],
            ["cost_center", "Centro de costo"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              filter === id
                ? "bg-[var(--action)] text-[var(--action-fg)]"
                : "border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <section className="card">
          <h2>Reglas</h2>
          {list.map((r) => (
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
                <div className="mt-1 text-[11px] text-[var(--muted)]">
                  Aplica: {r.appliesTo.map((k) => personKindLabel[k]).join(" · ")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreview(r);
                  setPublished(null);
                }}
                className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]"
              >
                Publicar
              </button>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>Vista previa de impacto</h2>
          {!preview ? (
            <p className="m-0 text-[13px] text-[var(--muted)]">Seleccioná una regla para ver el reproceso.</p>
          ) : (
            <>
              <div className="rounded-[10px] border border-[var(--line)] bg-[var(--emph-bg)] p-3.5 text-[var(--emph-fg)]">
                Reproceso estimado · <b className="text-[var(--emph-accent)]">{preview.impact.personas} personas</b>
                <br />
                <span className="text-xs opacity-85">
                  {preview.impact.pass} OK · {preview.impact.adequacy} plan de adecuación · {preview.impact.block}{" "}
                  bloqueo potencial
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPublished(preview.id)}
                className="mt-3 w-full rounded-lg bg-[var(--action)] px-3 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]"
              >
                Confirmar publicación
              </button>
              {published ? (
                <p className="mt-2 text-[13px] font-semibold text-[var(--ok)]">
                  {published} publicada (simulado). Trabajo de reproceso encolado.
                </p>
              ) : null}
            </>
          )}
        </section>
      </div>
    </>
  );
}
