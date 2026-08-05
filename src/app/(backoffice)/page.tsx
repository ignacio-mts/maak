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
      <header className="mb-6">
        <h1 className="m-0 text-[22px] font-semibold tracking-tight">Operación de altas</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-[var(--muted)]">
          Onboarding de personas morales, físicas y centros de costo. Maak certifica la identidad
          (Persona verificada); el core materializa la cuenta activa.
        </p>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "En revisión / bloqueados", value: review, tone: "text-[var(--warn)]" },
          { label: "Personas verificadas", value: verified, tone: "text-[var(--ok)]" },
          {
            label: "Casos en sesión",
            value: cases.length,
            tone: "text-[var(--ink)]",
            sub: `${byKind.legal_entity} PM · ${byKind.natural_person} PF · ${byKind.cost_center} CC`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
              {stat.label}
            </div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight tabular-nums ${stat.tone}`}>
              {stat.value}
            </div>
            {"sub" in stat && stat.sub ? (
              <div className="mt-1 text-[11px] text-[var(--muted)]">{stat.sub}</div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          {
            href: "/onboarding?kind=legal_entity",
            title: "Alta persona moral",
            body: "Expediente unificado: carga + checklist + campos",
          },
          {
            href: "/onboarding?kind=natural_person",
            title: "Alta persona física",
            body: "Expediente unificado: carga + checklist + campos",
          },
          {
            href: "/onboarding?kind=cost_center",
            title: "Alta centro de costo",
            body: "Expediente unificado + padre autorizado",
          },
        ].map((flow) => (
          <Link
            key={flow.href}
            href={flow.href}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]"
          >
            <div className="text-[11px] font-semibold tracking-tight text-[var(--primary)]">Flujo</div>
            <h2 className="mt-1 text-[14px] font-semibold tracking-tight">{flow.title}</h2>
            <p className="m-0 mt-1 text-[12.5px] text-[var(--muted)]">{flow.body}</p>
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/cases" className="btn btn-primary">
          Ir a casos pendientes
        </Link>
        <Link href="/client/cc" className="btn btn-secondary">
          Vista cliente · alta CC
        </Link>
        <Link href="/ingestion" className="btn btn-secondary">
          Simular ingesta
        </Link>
        <Link href="/rules" className="btn btn-secondary">
          Reglas
        </Link>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <h2 className="m-0 mb-3 text-[13px] font-semibold tracking-tight">Recientes</h2>
        <div className="grid gap-1.5">
          {recent.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius)] px-2.5 py-2 hover:bg-[var(--surface-2)]"
            >
              <div>
                <div className="text-[13px] font-semibold tracking-tight">{c.name}</div>
                <div className="font-mono text-[11px] text-[var(--muted)]">
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
