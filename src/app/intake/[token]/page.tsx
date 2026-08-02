"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { getCaseByIntakeToken } from "@/lib/data";

export default function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const c = getCaseByIntakeToken(token);
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

  if (!c) notFound();

  const pending = c.gaps.filter((g) => !uploaded[g.id]).length;

  return (
    <div className="mx-auto min-h-screen max-w-[520px] px-5 py-10">
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">Cliente</div>
      <h1 className="m-0 font-[family-name:var(--font-ui)] text-[24px] font-extrabold tracking-tight">IntakeLink</h1>
      <p className="mt-1 text-[13px] text-[var(--muted)]">
        Write-only: solo gaps tipados, sin expediente ni PII en la URL.
      </p>

      <div className="card mt-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-xs text-[var(--muted)]">stp.mx/i/{token} · TTL 47h</div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warn-bg)] px-2.5 py-1 text-xs font-bold text-[var(--warn)]">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {pending} pendientes
          </span>
        </div>

        {c.gaps.map((g) => {
          const ok = uploaded[g.id];
          return (
            <div
              key={g.id}
              className={`mb-2 rounded-lg border px-3 py-2.5 ${
                ok ? "border-[#A7F3D0] bg-[var(--ok-bg)]" : "border-[#FECACA] bg-[var(--fail-bg)]"
              }`}
            >
              <strong className="mb-0.5 block text-[13px]">{g.title}</strong>
              <p className="m-0 text-xs text-[var(--muted)]">{g.description}</p>
              {ok ? (
                <p className="mt-2 text-xs font-bold text-[var(--ok)]">Recibido · en cola de revisión</p>
              ) : (
                <button
                  type="button"
                  onClick={() => setUploaded((u) => ({ ...u, [g.id]: true }))}
                  className="mt-2 w-full rounded-lg bg-[var(--primary)] px-3 py-2.5 text-[13px] font-bold text-white"
                >
                  {g.action}
                </button>
              )}
            </div>
          );
        })}

        {pending === 0 ? (
          <p className="mt-3 text-center text-[13px] font-semibold text-[var(--ok)]">
            Listo. El caso vuelve a cola HITL.
          </p>
        ) : null}
      </div>
    </div>
  );
}
