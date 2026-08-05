"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useCases } from "@/lib/cases-context";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function IntakePage() {
  const params = useParams<{ token: string }>();
  const { cases, markGapUploaded } = useCases();
  const c = useMemo(
    () => cases.find((x) => x.intakeToken === params.token),
    [cases, params.token],
  );
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

  if (!c) {
    return (
      <div className="mx-auto max-w-[520px] px-5 py-16 text-center">
        <h1 className="font-[family-name:var(--font-ui)] text-xl font-bold">Enlace no válido o vencido</h1>
        <p className="mt-2 text-[13px] text-[var(--muted)]">Pedí un nuevo enlace al equipo de STP.</p>
      </div>
    );
  }

  const pending = c.gaps.filter((g) => !uploaded[g.id]).length;

  return (
    <div className="mx-auto min-h-screen max-w-[520px] px-5 py-10">
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">Cliente</div>
      <h1 className="m-0 font-[family-name:var(--font-ui)] text-[24px] font-extrabold tracking-tight">
        Documentos pendientes
      </h1>
      <p className="mt-1 text-[13px] text-[var(--muted)]">
        Solo ves lo que falta. No se muestra el expediente completo ni datos sensibles en la URL.
      </p>

      <div className="card mt-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-xs text-[var(--muted)]">stp.mx/i/{params.token} · TTL 47h</div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warn-bg)] px-2.5 py-1 text-xs font-bold text-[var(--warn)]">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {pending} pendientes
          </span>
        </div>

        {c.gaps.length === 0 ? (
          <p className="m-0 text-[13px] font-semibold text-[var(--ok)]">
            No hay pendientes. El caso volvió a la cola de revisión.
          </p>
        ) : (
          c.gaps.map((g) => {
            const ok = uploaded[g.id];
            return (
              <div
                key={g.id}
                className={`mb-2 rounded-lg border px-3 py-2.5 ${
                  ok ? "border-[var(--ok-line)] bg-[var(--ok-bg)]" : "border-[var(--fail-line)] bg-[var(--fail-bg)]"
                }`}
              >
                <strong className="mb-0.5 block text-[13px]">{g.title}</strong>
                <p className="m-0 text-xs text-[var(--muted)]">{g.description}</p>
                {ok ? (
                  <p className="mt-2 text-xs font-bold text-[var(--ok)]">Recibido · en cola de revisión</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setUploaded((u) => ({ ...u, [g.id]: true }));
                      markGapUploaded(c.id, g.id);
                    }}
                    className="mt-2 w-full rounded-lg bg-[var(--action)] px-3 py-2.5 text-[13px] font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]"
                  >
                    {g.action}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
