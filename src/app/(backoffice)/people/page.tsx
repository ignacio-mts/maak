"use client";

import Link from "next/link";
import { useCases } from "@/lib/cases-context";
import { personKindLabel } from "@/lib/labels";
import { StatusPill } from "@/components/StatusPill";

export default function PeoplePage() {
  const { cases } = useCases();
  const people = cases.filter((c) => c.verified || c.status === "verified");

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        Catálogo / <strong className="font-semibold text-[var(--ink-2)]">Personas</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">
          Personas verificadas
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Identidades certificadas por Maak. La activación de cuenta ocurre en el core (fuera de este prototipo).
        </p>
      </header>

      <section className="card">
        {people.length === 0 ? (
          <p className="m-0 text-[13px] text-[var(--muted)]">
            Todavía no hay personas verificadas. Completá un caso desde la cola.
          </p>
        ) : (
          <div className="grid gap-2">
            {people.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--line)] px-3 py-3 hover:bg-[#F8FAFC]"
              >
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {c.rfc} · {personKindLabel[c.kind]} · {c.id}
                    {c.parentName ? ` · Padre: ${c.parentName}` : ""}
                  </div>
                </div>
                <StatusPill status="verified" label="Verificada" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
