import type { CaseStatus } from "@/lib/types";
import { statusLabel } from "@/lib/labels";

const styles: Record<CaseStatus, string> = {
  blocked: "bg-[var(--fail-bg)] text-[var(--fail)]",
  in_review: "bg-[var(--warn-bg)] text-[var(--warn)]",
  processing: "bg-[var(--primary-soft)] text-[var(--primary)]",
  verified: "bg-[var(--ok-bg)] text-[var(--ok)]",
};

export function StatusPill({ status, label }: { status: CaseStatus; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? statusLabel[status]}
    </span>
  );
}
