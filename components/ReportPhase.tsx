"use client";

import { Spine, type NodeState } from "./Spine";
import type { Question, Report, Verdict } from "@/lib/types";

const VERDICT_LABEL: Record<Verdict, string> = {
  solid: "Solid",
  partial: "Partial",
  misconception: "Misconception",
};

const VERDICT_STYLE: Record<Verdict, string> = {
  solid: "border-verdigris text-verdigris",
  partial: "border-amber text-amber",
  misconception: "border-rust text-rust",
};

export function ReportPhase({
  topic,
  questions,
  report,
  onReset,
}: {
  topic: string;
  questions: Question[];
  report: Report;
  onReset: () => void;
}) {
  const byId = new Map(report.per_question.map((p) => [p.id, p]));
  const states: NodeState[] = questions.map(
    (q) => (byId.get(q.id)?.verdict ?? "pending") as NodeState
  );

  return (
    <div className="animate-rise">
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow truncate">{topic}</p>
        <p className="eyebrow shrink-0">Report</p>
      </div>

      <div className="mt-4">
        <Spine states={states} />
      </div>

      <section className="mt-12 border-l-2 border-brass pl-5 sm:pl-7">
        <p className="eyebrow text-brass">The gap</p>
        <p className="mt-4 font-display text-[1.8rem] leading-[1.3] sm:text-[2.3rem]">
          {report.primary_gap}
        </p>
        <p className="mt-5 text-[15px] leading-relaxed text-mute">
          {report.next_step}
        </p>
      </section>

      <section className="mt-14 space-y-10">
        <p className="eyebrow">Question by question</p>
        {questions.map((q) => {
          const result = byId.get(q.id);
          if (!result) return null;
          return (
            <article key={q.id} className="border-t border-line pt-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-mute">
                  {String(q.id).padStart(2, "0")}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    VERDICT_STYLE[result.verdict]
                  }`}
                >
                  {VERDICT_LABEL[result.verdict]}
                </span>
              </div>

              <p className="mt-4 font-display text-xl italic leading-snug">
                {q.question}
              </p>

              <p className="mt-4 text-[15px] leading-relaxed text-chalk/80">
                {result.what_you_showed}
              </p>

              {result.the_gap && (
                <p className="mt-3 text-[15px] leading-relaxed text-mute">
                  {result.the_gap}
                </p>
              )}
            </article>
          );
        })}
      </section>

      <button
        type="button"
        onClick={onReset}
        className="mt-14 rounded-lg border border-line px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-chalk transition-colors hover:border-brass hover:text-brass"
      >
        Try another topic
      </button>
    </div>
  );
}
