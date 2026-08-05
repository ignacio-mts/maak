import type { ProcessStep } from "@/lib/types";

const stepClass: Record<ProcessStep["state"], string> = {
  done: "bg-[var(--ok-bg)] border-[var(--ok-line)] [&_.detail]:text-[var(--ok)]",
  current:
    "bg-[var(--primary-soft)] border-[var(--primary)] [&_.detail]:text-[var(--primary-fg)]",
  blocked: "bg-[var(--fail-bg)] border-[var(--fail-line)] [&_.detail]:text-[var(--fail)]",
  todo: "bg-[var(--surface-2)] border-[var(--line)] [&_.detail]:text-[var(--muted)]",
};

export function ProcessStepper({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="flex overflow-x-auto rounded-[var(--radius)] border border-[var(--line)]">
      {steps.map((step, i) => (
        <div
          key={step.id}
          className={`min-w-[108px] flex-1 border-r border-[var(--line)] px-2.5 py-3 last:border-r-0 ${stepClass[step.state]}`}
        >
          <div className="mb-1 font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="mb-1 text-[12.5px] font-semibold tracking-tight">{step.label}</div>
          <div className="detail text-[11px] font-medium">{step.detail}</div>
        </div>
      ))}
    </div>
  );
}
