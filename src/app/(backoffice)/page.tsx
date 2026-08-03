"use client";

import Link from "next/link";
import { useCases } from "@/lib/cases-context";
import { openReviewCount } from "@/lib/data";
import { personKindLabel, statusLabel } from "@/lib/labels";
import { StatusPill } from "@/components/StatusPill";

export default function HomePage() {
  const { cases } = useCases();
  const review = openReviewCount(cases);
  const verified = cases.filter((c) => c.verified || c.status === "verified").length;
  const byKind = {
    legal_entity: cases.filter((c) => c.kind === "legal_entity").length,
    natural_person: cases.filter((c) => c.kind === "natural_person").length,
    cost_center: cases.filter((c) => c.kind === "cost_center").length,
  };
  const recent = cases.slice(0, 4);

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        <strong className="font-semibold text-[var(--ink-2)]">Inicio</strong>
      </div>
      <header className="card mb-4">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">
          Operación de altas
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Onboarding de personas morales, físicas y centros de costo. Maak certifica la identidad; el core activa la cuenta.
        </p>
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="card mb-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">En revisión / bloqueados</div>
          <div className="mt-1 text-2xl font-bold text-[var(--warn)]">{review}</div>
        </div>
        <div className="card mb-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Personas verificadas</div>
          <div className="mt-1 text-2xl font-bold text-[var(--ok)]">{verified}</div>
        </div>
        <div className="card mb-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Casos abiertos</div>
          <div className="mt-1 text-2xl font-bold">{cases.length}</div>
          <div className="mt-1 text-xs text-[var(--muted)]">
            {byKind.legal_entity} PM · {byKind.natural_person} PF · {byKind.cost_center} CC
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Link href="/onboarding?kind=legal_entity" className="card mb-0 block hover:border-[var(--primary)]">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">Flujo</div>
          <h2 className="!mb-1 mt-1">Alta persona moral</h2>
          <p className="m-0 text-[13px] text-[var(--muted)]">Datos → docs → riesgo → firma → verificación</p>
        </Link>
        <Link href="/onboarding?kind=natural_person" className="card mb-0 block hover:border-[var(--primary)]">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">Flujo</div>
          <h2 className="!mb-1 mt-1">Alta persona física</h2>
          <p className="m-0 text-[13px] text-[var(--muted)]">INE / identidad → listas → firma → verificación</p>
        </Link>
        <Link href="/onboarding?kind=cost_center" className="card mb-0 block hover:border-[var(--primary)]">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">Flujo</div>
          <h2 className="!mb-1 mt-1">Alta centro de costo</h2>
          <p className="m-0 text-[13px] text-[var(--muted)]">Vínculo al padre → GE → listas → verificación</p>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/cases" className="rounded-lg bg-[var(--action)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]">
          Ir a cola de casos
        </Link>
        <Link href="/ingestion" className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)]">
          Simular ingesta por correo
        </Link>
        <Link href="/rules" className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] font-bold hover:border-[var(--line-strong)]">
          Configurar reglas
        </Link>
      </div>

      <section className="card">
        <h2>Recientes</h2>
        <div className="grid gap-2">
          {recent.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--line)] px-3 py-2.5 hover:bg-[var(--surface-2)]"
            >
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-xs text-[var(--muted)]">
                  {c.id} · {personKindLabel[c.kind]}
                </div>
              </div>
              <StatusPill status={c.status} label={statusLabel[c.status]} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
