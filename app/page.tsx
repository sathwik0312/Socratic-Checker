"use client";

import { useState } from "react";
import { TopicPhase } from "@/components/TopicPhase";
import { AnswerPhase } from "@/components/AnswerPhase";
import { ReportPhase } from "@/components/ReportPhase";
import type { Phase, Question, QuestionSet, Report } from "@/lib/types";

export default function Page() {
  const [phase, setPhase] = useState<Phase>("topic");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post<T>(path: string, payload: unknown): Promise<T> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "The request failed.");
    return data as T;
  }

  async function start(nextTopic: string) {
    setLoading(true);
    setError(null);
    try {
      const set = await post<QuestionSet>("/api/questions", { topic: nextTopic });
      setTopic(nextTopic);
      setQuestions(set.questions);
      setAnswers([]);
      setIndex(0);
      setPhase("answering");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the session.");
    } finally {
      setLoading(false);
    }
  }

  async function answer(text: string) {
    const next = [...answers, text];
    setAnswers(next);

    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await post<Report>("/api/evaluate", {
        topic,
        questions,
        answers: next,
      });
      setReport(result);
      setPhase("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not evaluate your answers.");
      setAnswers(answers);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPhase("topic");
    setTopic("");
    setQuestions([]);
    setAnswers([]);
    setIndex(0);
    setReport(null);
    setError(null);
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      {phase === "topic" && (
        <TopicPhase onStart={start} loading={loading} error={error} />
      )}

      {phase === "answering" && (
        <AnswerPhase
          topic={topic}
          questions={questions}
          index={index}
          onAnswer={answer}
          loading={loading}
          error={error}
        />
      )}

      {phase === "report" && report && (
        <ReportPhase
          topic={topic}
          questions={questions}
          report={report}
          onReset={reset}
        />
      )}

      <footer className="mt-24 border-t border-line pt-6">
        <p className="font-mono text-[11px] leading-relaxed text-mute/70">
          Socratic Checker reads reasoning, not correctness of fact. It can
          misjudge an unusual but valid answer, and it does not know your
          syllabus. Treat the gap as a place to look, not a grade.
        </p>
      </footer>
    </main>
  );
}
