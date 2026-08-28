export type Question = {
  id: number;
  question: string;
  targets_misconception: string;
  correct_reasoning: string;
};

export type QuestionSet = {
  topic: string;
  questions: Question[];
};

export type Verdict = "solid" | "partial" | "misconception";

export type PerQuestion = {
  id: number;
  verdict: Verdict;
  what_you_showed: string;
  the_gap: string;
};

export type Report = {
  per_question: PerQuestion[];
  primary_gap: string;
  next_step: string;
};

export type Phase = "topic" | "answering" | "report";
