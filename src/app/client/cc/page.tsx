"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCases } from "@/lib/cases-context";

/** Mock client portal: authenticated client creating a cost center under their parent.
 *  Ola 1: no real RBAC — simulates membership to a fixed parent. */
const MOCK_PARENT = {
  id: "CSK-2026-08410",
  name: "Comercializadora Delta SA de CV",
  rfc: "CDE850214XXX",
};

export default function ClientCostCenterPage() {
  const router = useRouter();
  const { addCaseFromOnboarding, cases } = useCases();
  const parent = cases.find((c) => c.id === MOCK_PARENT.id) ?? MOCK_PARENT;
  const [name, setName] = useState("");
  const [rfc, setRfc] = useState("");
  const [email, setEmail] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const created = addCaseFromOnboarding({
      kind: "cost_center",
      name: name.trim(),
      rfc: rfc.trim().toUpperCase(),
      email: email.trim(),
      parentCaseId: MOCK_PARENT.id,
    });
    setDoneId(created.id);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="prototype-banner">
        Vista cliente (mock) — membership fija al padre demo. RBAC real en ola 2.
      </div>
      <header className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Maak</div>
          <div className="text-[11px] text-[var(--muted)]">Portal cliente · centros de costo</div>
        </div>
        <div className="w-36">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-12">
        <div className="mb-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
            Cuenta padre autorizada
          </div>
          <div className="mt-1 text-[14px] font-semibold tracking-tight">{parent.name}</div>
          <div className="font-mono text-[11px] text-[var(--muted)]">
            {MOCK_PARENT.rfc} · {MOCK_PARENT.id}
          </div>
        </div>

        {doneId ? (
          <div className="rounded-[var(--radius)] border border-[var(--ok-line)] bg-[var(--ok-bg)] px-4 py-4">
            <h1 className="m-0 text-[16px] font-semibold tracking-tight text-[var(--ok)]">
              Solicitud de CC enviada
            </h1>
            <p className="mt-1 text-[13px] text-[var(--ink-2)]">
              Caso <span className="font-mono font-semibold">{doneId}</span> creado bajo{" "}
              {parent.name}. Ops/PLD lo revisarán en la cola HITL.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/cases/${doneId}`} className="btn btn-primary">
                Ver caso (vista ops)
              </Link>
              <button type="button" className="btn btn-secondary" onClick={() => setDoneId(null)}>
                Crear otro CC
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
          >
            <h1 className="m-0 text-[18px] font-semibold tracking-tight">
              Alta de centro de costo
            </h1>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              Solo podés dar de alta CC bajo el padre al que tenés acceso. Sin login real en esta
              ola — la membership está simulada.
            </p>

            <label className="mt-4 grid gap-1.5 text-[13px]">
              <span className="font-medium text-[var(--ink-2)]">Razón social / nombre CC</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2"
                placeholder="Ej. Delta Norte DRS"
              />
            </label>
            <label className="mt-3 grid gap-1.5 text-[13px]">
              <span className="font-medium text-[var(--ink-2)]">RFC</span>
              <input
                required
                value={rfc}
                onChange={(e) => setRfc(e.target.value)}
                className="px-3 py-2 font-mono uppercase"
                placeholder="RFC del CC"
              />
            </label>
            <label className="mt-3 grid gap-1.5 text-[13px]">
              <span className="font-medium text-[var(--ink-2)]">Email de contacto</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2"
                placeholder="ops@cliente.mx"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary">
                Enviar a revisión
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => router.push("/")}>
                Volver
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
