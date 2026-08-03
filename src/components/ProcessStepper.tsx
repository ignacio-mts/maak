import type { ProcessStep } from "@/lib/types";

const stepClass: Record<ProcessStep["state"], string> = {
  done: "bg-[var(--ok-bg)] border-[var(--ok-line)] [&_.detail]:text-[var(--ok)]",
  current: "bg-[var(--primary-soft)] border-[var(--primary)] shadow-[inset_0_0_0_1px_var(--primary)] [&_.detail]:text-[var(--primary)]",
  blocked: "bg-[var(--fail-bg)] border-[var(--fail-line)] [&_.detail]:text-[var(--fail)]",
  todo: "bg-[var(--surface-2)] border-[var(--line)] [&_.detail]:text-[var(--muted)]",
};

export function ProcessStepper({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="flex overflow-x-auto">
      {steps.map((step, i) => (
        <div
          key={step.id}
          className={`min-w-[108px] flex-1 border px-2.5 py-3 ${stepClass[step.state]} ${
            i === 0 ? "rounded-l-lg" : "border-l-0"
          } ${i === steps.length - 1 ? "rounded-r-lg" : ""}`}
        >
          <div className="mb-1 text-[11px] font-semibold text-[var(--muted)]">{step.id}</div>
          <div className="mb-1 text-[13px] font-bold">{step.label}</div>
          <div className="detail text-xs font-semibold">{step.detail}</div>
        </div>
      ))}
    </div>
  );
}
