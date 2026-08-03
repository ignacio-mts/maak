"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCases } from "@/lib/cases-context";
import { openReviewCount, operator } from "@/lib/data";

const nav = [
  { href: "/", label: "Inicio", match: (p: string) => p === "/" },
  { href: "/cases", label: "Casos", match: (p: string) => p.startsWith("/cases"), badge: true },
  { href: "/onboarding", label: "Nueva alta", match: (p: string) => p.startsWith("/onboarding") },
  { href: "/ingestion", label: "Ingesta", match: (p: string) => p.startsWith("/ingestion") },
  { href: "/people", label: "Personas", match: (p: string) => p.startsWith("/people") },
  { href: "/rules", label: "Reglas", match: (p: string) => p.startsWith("/rules") },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cases } = useCases();
  const badge = openReviewCount(cases);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-1 border-r border-[var(--line)] bg-[var(--sidebar)] px-3.5 py-5">
        <div className="mb-4 px-2.5 font-[family-name:var(--font-ui)] text-xl font-extrabold tracking-tight">
          Maak
          <span className="mt-0.5 block text-xs font-semibold tracking-normal text-[var(--muted)]">
            Gestión de clientes
          </span>
        </div>
        {nav.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] font-medium ${
                active
                  ? "bg-[var(--primary-soft)] font-bold text-[var(--primary)]"
                  : "text-[var(--ink-2)] hover:bg-[#EEF2FF]"
              }`}
            >
              {item.label}
              {item.badge && badge > 0 ? (
                <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        <div className="mt-auto border-t border-[var(--line)] px-2.5 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              {operator.initials}
            </div>
            <div>
              <div className="text-[13px] font-semibold">{operator.name}</div>
              <div className="text-[11px] text-[var(--muted)]">{operator.role}</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="max-w-[1180px] px-5 py-5 md:px-6">{children}</main>
    </div>
  );
}
