"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCases } from "@/lib/cases-context";
import { openReviewCount, operator } from "@/lib/data";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="flex min-h-screen flex-col">
      <div className="prototype-banner">
        Prototipo Maak — datos mock, sin API. No es producción.
      </div>
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[232px_1fr]">
        <aside className="flex flex-col gap-0.5 border-r border-[var(--line)] bg-[var(--sidebar)] px-3 py-4">
          <div className="mb-3 px-2.5">
            <div className="text-[15px] font-semibold tracking-tight">Maak</div>
            <div className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">
              Personas · onboarding · cumplimiento
            </div>
          </div>
          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-[var(--radius)] px-2.5 py-2 text-[13px] font-medium tracking-tight ${
                    active
                      ? "bg-[var(--surface)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)]"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                  }`}
                >
                  {item.label}
                  {item.badge && badge > 0 ? (
                    <span className="rounded-md bg-[var(--action)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--action-fg)]">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col gap-2.5 border-t border-[var(--line)] px-0.5 pt-3">
            <ThemeToggle />
            <div className="flex items-center gap-2.5 px-1">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-[var(--action)] text-[11px] font-bold text-[var(--action-fg)]">
                {operator.initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-semibold tracking-tight">
                  {operator.name}
                </div>
                <div className="truncate text-[11px] text-[var(--muted)]">{operator.role}</div>
              </div>
            </div>
          </div>
        </aside>
        <main className="max-w-[1180px] px-5 py-5 md:px-7">{children}</main>
      </div>
    </div>
  );
}
