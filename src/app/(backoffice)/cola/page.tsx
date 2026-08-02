import Link from "next/link";
import { cases } from "@/lib/data";
import { StatusPill } from "@/components/StatusPill";

export default function ColaPage() {
  return (
    <>
      <div className="mb-3.5 text-xs text-[var(--muted)]">HITL / <strong className="font-semibold text-[var(--ink-2)]">Cola</strong></div>
      <header className="card mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-[family-name:var(--font-ui)] text-[22px] font-bold tracking-tight">Cola de casos</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Ordenada por estado y quién tiene la pelota.</p>
        </div>
        <Link href="/ingesta" className="rounded-lg bg-[var(--primary)] px-3.5 py-2.5 text-[13px] font-bold text-white">
          Simular ingesta
        </Link>
      </header>

      <section className="card overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-[1.4fr_100px_100px_80px_1fr] gap-2 border-b border-[var(--line)] pb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
          <div>Caso</div>
          <div>Estado</div>
          <div>Pelota</div>
          <div>TAT</div>
          <div>Template</div>
        </div>
        {cases.map((c) => (
          <Link
            key={c.id}
            href={`/casos/${c.id}`}
            className="grid min-w-[640px] grid-cols-[1.4fr_100px_100px_80px_1fr] items-center gap-2 border-b border-[var(--line)] py-3 last:border-0 hover:bg-[#F8FAFC]"
          >
            <div>
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-[var(--muted)]">{c.id}</div>
            </div>
            <div><StatusPill status={c.status} /></div>
            <div className="text-[13px] font-semibold text-[var(--ink-2)]">{c.ball}</div>
            <div className={`text-[13px] font-bold ${c.status === "FALLA" ? "text-[var(--fail)]" : ""}`}>{c.tat}</div>
            <div className="text-[13px] text-[var(--muted)]">{c.template}</div>
          </Link>
        ))}
      </section>
    </>
  );
}
