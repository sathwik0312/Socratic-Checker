"use client";

import { useEffect, useRef, useState } from "react";
import { Spine, type NodeState } from "./Spine";
import type { Question } from "@/lib/types";

export function AnswerPhase({
  topic,
  questions,
  index,
  onAnswer,
  loading,
  error,
}: {
  topic: string;
  questions: Question[];
  index: number;
  onAnswer: (answer: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft("");
    ref.current?.focus();
  }, [index]);

  const question = questions[index];
  const last = index === questions.length - 1;

  const states: NodeState[] = questions.map((_, i) =>
    i < index ? "done" : i === index ? "current" : "pending"
  );

  return (
    <div key={index} className="animate-rise">
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow truncate">{topic}</p>
        <p className="eyebrow shrink-0">
          {index + 1} / {questions.length}
        </p>
      </div>

      <div className="mt-4">
        <Spine states={states} />
      </div>

      <h2 className="mt-10 font-display text-[1.9rem] italic leading-[1.25] sm:text-[2.4rem]">
        {question.question}
      </h2>

      <label htmlFor="answer" className="eyebrow mt-10 block">
        Your answer — one to three sentences
      </label>
      <textarea
        id="answer"
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && draft.trim()) {
            onAnswer(draft.trim());
          }
        }}
        rows={4}
        disabled={loading}
        placeholder="Reason it through. Wrong answers are the useful ones."
        className="mt-3 w-full resize-none rounded-lg px-4 py-3.5 text-base leading-relaxed outline-none transition-colors focus:border-brass disabled:opacity-50"
      />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => onAnswer(draft.trim())}
          disabled={loading || !draft.trim()}
          className="rounded-lg bg-brass px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {loading ? "Reading your answers…" : last ? "See the gap" : "Next question"}
        </button>
        <button
          type="button"
          onClick={() => onAnswer("")}
          disabled={loading}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute underline-offset-4 transition-colors hover:text-chalk disabled:opacity-30"
        >
          Skip
        </button>
      </div>

      {error && (
        <p className="mt-5 border-l-2 border-rust pl-4 text-sm text-rust">{error}</p>
      )}
    </div>
  );
}
