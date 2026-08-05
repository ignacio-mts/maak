import type { CaseStatus } from "@/lib/types";
import { statusLabel } from "@/lib/labels";

const styles: Record<CaseStatus, string> = {
  blocked: "pill pill-fail",
  in_review: "pill pill-warn",
  processing: "pill bg-[var(--primary-soft)] text-[var(--primary-fg)] border-[var(--primary)]/20",
  verified: "pill pill-ok",
};

export function StatusPill({ status, label }: { status: CaseStatus; label?: string }) {
  return (
    <span className={styles[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label ?? statusLabel[status]}
    </span>
  );
}
