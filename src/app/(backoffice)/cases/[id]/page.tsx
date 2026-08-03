"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ProcessStepper } from "@/components/ProcessStepper";
import { StatusPill } from "@/components/StatusPill";
import { useCases } from "@/lib/cases-context";
import { channelLabel, ownershipLabel, personKindLabel, statusLabel } from "@/lib/labels";

const barColor = {
  auto: "bg-[var(--ok)]",
  internal: "bg-[var(--primary)]",
  client: "bg-[var(--warn)]",
  idle: "bg-[var(--idle)] opacity-55",
} as const;

const toneDot = {
  ok: "border-[var(--ok)] bg-[var(--ok)]",
  fail: "border-[var(--fail)] bg-[var(--fail)]",
  warn: "border-[var(--warn)] bg-[var(--warn)]",
  neutral: "border-[var(--primary)] bg-white",
} as const;

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const { cases, advanceCase, resolveGap, requestClientDocs } = useCases();
  const c = cases.find((x) => x.id === params.id);

  if (!c) {
    return (
      <div className="card">
        <h1 className="m-0 font-[family-name:var(--font-ui)] text-xl font-bold">Caso no encontrado</h1>
        <Link href="/cases" className="mt-3 inline-block text-[13px] font-bold text-[var(--primary)]">
          Volver a la cola
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">
        <Link href="/cases" className="text-[var(--muted)]">Casos</Link> / {personKindLabel[c.kind]} /{" "}
        <strong className="font-semibold text-[var(--ink-2)]">{c.id}</strong>
      </div>

      <header className="card mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">{c.name}</h1>
          <div className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] text-[var(--muted)]">
            <span>{c.id}</span>
            <span>RFC <b className="font-semibold text-[var(--ink)]">{c.rfc}</b></span>
            <span>{personKindLabel[c.kind]}</span>
            <span>{c.template}</span>
            <span>{channelLabel[c.channel] ?? c.channel}</span>
            {c.parentName ? <span>Padre <b className="font-semibold text-[var(--ink)]">{c.parentName}</b></span> : null}
            <span>Abierto <b className="font-semibold text-[var(--ink)]">{c.openFor}</b></span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusPill
            status={c.status}
            label={
              c.verified || c.status === "verified"
                ? "Persona verificada"
                : c.status === "blocked"
                  ? `Bloqueado · ${c.gaps.length} pendientes`
                  : statusLabel[c.status]
            }
          />
          {c.intakeToken && c.status === "blocked" ? (
            <StatusPill status="in_review" label="Enlace de documentos enviado" />
          ) : null}
        </div>
      </header>

      {(c.verified || c.status === "verified") && (
        <section className="card mb-4 border-[#A7F3D0] bg-gradient-to-br from-[var(--ok-bg)] to-[var(--primary-soft)] text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{c.name}</div>
          <div className="my-2 font-[family-name:var(--font-ui)] text-[22px] font-extrabold text-[var(--ok)]">
            Persona verificada
          </div>
          <code className="mt-2 inline-block rounded-md bg-white px-2 py-2 font-mono text-xs text-[var(--ink-2)]">
            evento PersonaVerificada → core
          </code>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          <section className="card">
            <h2>Proceso</h2>
            <ProcessStepper steps={c.steps} />
          </section>

          <section className="card">
            <h2>Tiempos</h2>
            <div className="mb-3.5 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-[var(--line)] bg-[#F8FAFC] px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">TAT total</div>
                <div className="mt-0.5 text-xl font-bold text-[var(--warn)]">{c.stats.total}</div>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#F8FAFC] px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Espera cliente</div>
                <div className="mt-0.5 text-xl font-bold text-[var(--fail)]">{c.stats.clientWait}</div>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#F8FAFC] px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Cola interna</div>
                <div className="mt-0.5 text-xl font-bold">{c.stats.internalQueue}</div>
              </div>
            </div>
            {c.bars.map((b) => (
              <div key={b.label} className="mb-2 grid grid-cols-[120px_1fr_52px] items-center gap-2.5">
                <div className="text-xs font-semibold text-[var(--ink-2)]">{b.label}</div>
                <div className="relative h-5 overflow-hidden rounded bg-[#F1F5F9]">
                  <div
                    className={`absolute top-[3px] bottom-[3px] rounded-sm ${barColor[b.kind]}`}
                    style={{ left: `${b.left}%`, width: `${b.width}%` }}
                  />
                </div>
                <div className="text-right text-xs font-bold tabular-nums">{b.tat}</div>
              </div>
            ))}
            <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
              <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--ok)]" />Automático</span>
              <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--primary)]" />Interno</span>
              <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--warn)]" />Cliente</span>
              <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--idle)]" />Bloqueado</span>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-[1.15fr_.85fr]">
            <section className="card">
              <h2>Actividad</h2>
              <ul className="m-0 list-none p-0">
                {c.timeline.map((ev) => (
                  <li key={ev.title + ev.time} className="grid grid-cols-[64px_12px_1fr] gap-2.5 pb-3.5 last:pb-0">
                    <div className="pt-0.5 text-[11px] tabular-nums text-[var(--muted)]">{ev.time}</div>
                    <div>
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full border-2 ${toneDot[ev.tone]}`} />
                    </div>
                    <div>
                      <strong className="mb-0.5 block text-[13px] font-semibold">{ev.title}</strong>
                      <p className="m-0 text-xs text-[var(--muted)]">{ev.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card">
              <h2>Pendientes</h2>
              {c.gaps.length === 0 ? (
                <p className="m-0 text-[13px] text-[var(--muted)]">Sin pendientes abiertas.</p>
              ) : (
                c.gaps.map((g) => (
                  <div key={g.id} className="mb-2 rounded-lg border border-[#FECACA] bg-[var(--fail-bg)] px-3 py-2.5">
                    <strong className="mb-0.5 block text-[13px]">{g.title}</strong>
                    <p className="m-0 text-xs text-[var(--muted)]">{g.description}</p>
                    <button
                      type="button"
                      onClick={() => resolveGap(c.id, g.id)}
                      className="mt-2 text-xs font-bold text-[var(--primary)]"
                    >
                      Marcar resuelta (equipo)
                    </button>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>

        <aside>
          <section className="card">
            <h2>Acciones</h2>
            {!(c.verified || c.status === "verified") ? (
              <>
                <button
                  type="button"
                  onClick={() => advanceCase(c.id)}
                  disabled={c.gaps.length > 0}
                  className="mb-2 w-full rounded-lg bg-[var(--primary)] px-3 py-2.5 text-[13px] font-bold text-white disabled:opacity-40"
                >
                  Avanzar etapa
                </button>
                <button
                  type="button"
                  onClick={() => requestClientDocs(c.id)}
                  className="mb-2 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] font-bold"
                >
                  Pedir docs al cliente
                </button>
              </>
            ) : null}
            {c.intakeToken ? (
              <Link
                href={`/intake/${c.intakeToken}`}
                className="mb-2 block w-full rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-2.5 text-center text-[13px] font-bold text-[var(--primary)]"
              >
                Abrir enlace del cliente
              </Link>
            ) : null}
            <div className="mt-3 grid gap-2 text-[13px] text-[var(--muted)]">
              <div className="flex justify-between gap-3">
                <span>A cargo de</span>
                <b className="font-semibold text-[var(--ink)]">{ownershipLabel[c.ownership]}</b>
              </div>
              <div className="flex justify-between gap-3">
                <span>Plantilla</span>
                <b className="font-semibold text-[var(--ink)]">{c.template}</b>
              </div>
              <div className="flex justify-between gap-3">
                <span>Tipo</span>
                <b className="font-semibold text-[var(--ink)]">{personKindLabel[c.kind]}</b>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
