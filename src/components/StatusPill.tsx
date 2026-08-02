import type { CaseStatus } from "@/lib/types";

const styles: Record<CaseStatus, string> = {
  FALLA: "bg-[var(--fail-bg)] text-[var(--fail)]",
  HITL: "bg-[var(--warn-bg)] text-[var(--warn)]",
  AUTO: "bg-[var(--ok-bg)] text-[var(--ok)]",
  OK: "bg-[var(--ok-bg)] text-[var(--ok)]",
};

export function StatusPill({ status, label }: { status: CaseStatus; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}
