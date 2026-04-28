"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import type { Locale, TrainingStep } from "@/lib/course";
import styles from "./CompositionStep.module.css";

type CompositionFeedback = {
  verdict: "ready" | "needs_revision";
  score: number;
  summaryRu: string;
  theoryRu: string;
  issues: Array<{
    line: number;
    focusRu: string;
    questionRu: string;
    hintRu: string;
    severity: "fix" | "polish";
  }>;
  nextActionRu: string;
};

type CompositionStepProps = {
  step: TrainingStep;
  locale: Locale;
  lines: string[];
  feedback: CompositionFeedback | null;
  loading: boolean;
  error: string;
  onLinesChange: (lines: string[]) => void;
  onCheck: () => void;
  onComplete: () => void;
};

export function CompositionStep({
  step,
  locale,
  lines,
  feedback,
  loading,
  error,
  onLinesChange,
  onCheck,
  onComplete
}: CompositionStepProps) {
  const [showReveal, setShowReveal] = useState(false);
  const text = useMemo(() => lines.join("\n"), [lines]);
  const filledCount = lines.filter((line) => line.trim()).length;
  const minLines = step.composition?.minSentences ?? 3;
  const corrected = step.composition?.model[locale] ?? step.targetText;

  useEffect(() => {
    setShowReveal(false);
  }, [step.id]);

  useEffect(() => {
    if (feedback) setShowReveal(true);
  }, [feedback]);

  function changeText(value: string) {
    onLinesChange(value.split("\n"));
  }

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <span className={styles.chip}>Composition</span>
        <h2 className={styles.title}>{step.composition?.model[locale] ?? step.prompt[locale]}</h2>
        {step.composition?.requirements[locale].length ? (
          <ul className={styles.requirements}>
            {step.composition.requirements[locale].map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className={styles.editor}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(event) => changeText(event.target.value)}
          placeholder="Write your version here..."
          rows={8}
        />
        <span className={styles.meta}>
          {filledCount}/{minLines} lines minimum
        </span>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      {feedback ? (
        <section className={styles.feedback}>
          <div className={styles.feedbackHead}>
            <strong>{feedback.summaryRu}</strong>
            <span>{feedback.score}/100</span>
          </div>
          <p>{feedback.theoryRu}</p>
          {showReveal ? (
            <div className={styles.split}>
              <article className={styles.pane}>
                <h3>Your version</h3>
                <p>{renderUserVersion(lines, feedback)}</p>
              </article>
              <article className={styles.pane}>
                <h3>Corrected version</h3>
                <p>
                  <span className={styles.correction}>{corrected}</span>
                </p>
              </article>
            </div>
          ) : null}
          {feedback.issues.length ? (
            <div className={styles.questions}>
              {feedback.issues.map((issue) => (
                <article className={styles.question} key={`${issue.line}-${issue.focusRu}`}>
                  <strong>Line {issue.line}: {issue.focusRu}</strong>
                  <br />
                  {issue.questionRu}
                  <br />
                  {issue.hintRu}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <footer className={styles.footer}>
        <Button variant="ghost" type="button" onClick={() => setShowReveal((visible) => !visible)} disabled={!feedback}>
          Show example
        </Button>
        {feedback?.verdict === "ready" || (feedback?.score ?? 0) >= 80 ? (
          <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />} onClick={onComplete}>
            Done · Next
          </Button>
        ) : (
          <Button variant="primary" size="lg" loading={loading} disabled={loading || filledCount < minLines} onClick={onCheck}>
            Check
          </Button>
        )}
      </footer>
    </section>
  );
}

function renderUserVersion(lines: string[], feedback: CompositionFeedback) {
  const issueLines = new Set(feedback.issues.map((issue) => issue.line));
  return lines.map((line, index) => {
    const lineNumber = index + 1;
    if (!issueLines.has(lineNumber)) return `${lineNumber}. ${line}`;
    return (
      <span key={lineNumber}>
        {lineNumber}. <span className={styles.problem}>{line}</span>
        {"\n"}
      </span>
    );
  });
}
