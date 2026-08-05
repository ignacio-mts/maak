"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { useCases } from "@/lib/cases-context";
import { channelLabel, ownershipLabel, personKindLabel, statusLabel } from "@/lib/labels";
import type { CaseStatus, PersonKind } from "@/lib/types";

const kindFilters: { id: "all" | PersonKind; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "legal_entity", label: "Persona moral" },
  { id: "natural_person", label: "Persona física" },
  { id: "cost_center", label: "Centro de costo" },
];

const statusFilters: { id: "all" | CaseStatus; label: string }[] = [
  { id: "all", label: "Cualquier estado" },
  { id: "blocked", label: "Bloqueado" },
  { id: "in_review", label: "En revisión" },
  { id: "processing", label: "En proceso" },
  { id: "verified", label: "Verificada" },
];

export default function CasesPage() {
  const { cases } = useCases();
  const [kind, setKind] = useState<"all" | PersonKind>("all");
  const [status, setStatus] = useState<"all" | CaseStatus>("all");

  const filtered = useMemo(
    () =>
      cases.filter((c) => {
        if (kind !== "all" && c.kind !== kind) return false;
        if (status !== "all" && c.status !== status) return false;
        return true;
      }),
    [cases, kind, status],
  );

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        Operación / <strong className="font-semibold text-[var(--ink-2)]">Casos</strong>
      </div>
      <header className="card mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">Cola de casos</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Filtrá por tipo de persona y estado. “A cargo de” indica quién debe actuar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/onboarding" className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">
            Nueva alta
          </Link>
          <Link href="/ingestion" className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)]">
            Ingesta
          </Link>
        </div>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {kindFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setKind(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              kind === f.id
                ? "bg-[var(--action)] text-[var(--action-fg)]"
                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--line-strong)]"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | CaseStatus)}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold"
        >
          {statusFilters.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <section className="card overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-[1.5fr_120px_110px_100px_80px_1fr] gap-2 border-b border-[var(--line)] pb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
          <div>Caso</div>
          <div>Tipo</div>
          <div>Estado</div>
          <div>A cargo de</div>
          <div>TAT</div>
          <div>Canal / plantilla</div>
        </div>
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="grid min-w-[760px] grid-cols-[1.5fr_120px_110px_100px_80px_1fr] items-center gap-2 border-b border-[var(--line)] py-3 last:border-0 hover:bg-[var(--surface-2)]"
          >
            <div>
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-[var(--muted)]">{c.id}</div>
            </div>
            <div className="text-[13px] font-semibold text-[var(--ink-2)]">{personKindLabel[c.kind]}</div>
            <div>
              <StatusPill status={c.status} label={statusLabel[c.status]} />
            </div>
            <div className="text-[13px] font-semibold text-[var(--ink-2)]">{ownershipLabel[c.ownership]}</div>
            <div className={`text-[13px] font-bold ${c.status === "blocked" ? "text-[var(--fail)]" : ""}`}>{c.tat}</div>
            <div className="text-[13px] text-[var(--muted)]">
              {channelLabel[c.channel] ?? c.channel} · {c.template}
            </div>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--muted)]">No hay casos con ese filtro.</p>
        ) : null}
      </section>
    </>
  );
}
