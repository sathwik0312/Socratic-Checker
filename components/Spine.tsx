import type { Verdict } from "@/lib/types";

export type NodeState = "pending" | "current" | "done" | Verdict;

const FILL: Record<NodeState, string> = {
  pending: "bg-ink border-line",
  current: "bg-brass border-brass",
  done: "bg-mute border-mute",
  solid: "bg-verdigris border-verdigris",
  partial: "bg-amber border-amber",
  misconception: "bg-rust border-rust",
};

const RING: Partial<Record<NodeState, string>> = {
  current: "ring-brass/25",
  misconception: "ring-rust/25",
  partial: "ring-amber/20",
};

/**
 * Three nodes on a rail. Used as progress while answering and as the verdict
 * summary on the report, so the same shape carries the sequence through the
 * whole session.
 */
export function Spine({ states }: { states: NodeState[] }) {
  return (
    <div className="flex items-center gap-0" aria-hidden="true">
      {states.map((state, i) => (
        <div key={i} className="flex flex-1 items-center last:flex-none">
          <span
            className={`h-3 w-3 shrink-0 rounded-full border transition-colors duration-500 ${
              FILL[state]
            } ${RING[state] ? `ring-4 ${RING[state]}` : ""}`}
          />
          {i < states.length - 1 && (
            <span className="h-px flex-1 bg-line" />
          )}
        </div>
      ))}
    </div>
  );
}
