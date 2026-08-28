"use client";

import { useState } from "react";

const EXAMPLES = ["recursion", "photosynthesis", "supply and demand", "HTTP caching"];

export function TopicPhase({
  onStart,
  loading,
  error,
}: {
  onStart: (topic: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [topic, setTopic] = useState("");

  function submit() {
    if (topic.trim().length >= 2 && !loading) onStart(topic.trim());
  }

  return (
    <div className="animate-rise">
      <p className="eyebrow">Socratic Checker</p>
      <h1 className="mt-5 font-display text-[2.6rem] leading-[1.1] sm:text-6xl">
        Find out which idea you
        <br />
        <em className="text-brass">actually</em> have wrong.
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-mute">
        Three questions built to expose misconceptions rather than test recall.
        Answer them in your own words and get back the one concept your
        understanding breaks on.
      </p>

      <div className="mt-10">
        <label htmlFor="topic" className="eyebrow">
          Topic
        </label>
        <input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Anything you think you understand"
          disabled={loading}
          className="mt-3 w-full rounded-lg px-4 py-3.5 text-base outline-none transition-colors focus:border-brass disabled:opacity-50"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setTopic(example)}
              disabled={loading}
              className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] text-mute transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={loading || topic.trim().length < 2}
          className="mt-8 w-full rounded-lg bg-brass px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-90 disabled:opacity-30 sm:w-auto"
        >
          {loading ? "Writing questions…" : "Start questioning"}
        </button>

        {error && (
          <p className="mt-5 border-l-2 border-rust pl-4 text-sm text-rust">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
