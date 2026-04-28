"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TrainingStep } from "@/lib/course";
import type { compareAnswer } from "@/lib/scoring";
import styles from "./DrillStep.module.css";

type AnswerResult = ReturnType<typeof compareAnswer>;

type CoachFeedback = {
  verdict: "correct" | "almost" | "incorrect";
  score: number;
  bestAnswer: string;
  shortRu: string;
  grammarMiniLessonRu?: string;
  drillRu: string;
};

type DrillStepProps = {
  step: TrainingStep;
  answer: string;
  checked: AnswerResult | null;
  attemptCount: number;
  coachFeedback: CoachFeedback | null;
  coachLoading: boolean;
  coachError: string;
  onAnswer: (value: string) => void;
  onCheck: () => void;
  onComplete: () => void;
};

export function DrillStep({
  step,
  answer,
  checked,
  attemptCount,
  coachFeedback,
  coachLoading,
  coachError,
  onAnswer,
  onCheck,
  onComplete
}: DrillStepProps) {
  const [showExample, setShowExample] = useState(false);
  const tryNumber = Math.min(Math.max(attemptCount + 1, 1), 3);
  const passed = checked?.status === "exact" || checked?.status === "partial";
  const canReveal = attemptCount >= 3 || showExample;

  useEffect(() => {
    setShowExample(false);
  }, [step.id]);

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <span className={styles.chip}>Drill</span>
        <span className={cn(styles.counter, tryNumber === 2 && styles.counterWarm, tryNumber >= 3 && styles.counterNegative)}>
          Try <b>{tryNumber}</b>/3
        </span>
      </header>

      <div className={styles.hero}>
        <p className={styles.title}>Drill: повтори трехмерно</p>
        <h2 className={styles.phrase}>{step.sourceText ?? step.prompt.ru}</h2>
        <p className={styles.hint}>{step.hint.ru}</p>
        <div className={styles.pips} aria-label={`Attempt ${tryNumber} of 3`}>
          {[1, 2, 3].map((item) => (
            <span className={`${styles.pip} ${item < tryNumber ? styles.pipDone : item === tryNumber ? styles.pipActive : ""}`} key={item} />
          ))}
        </div>
      </div>

      <div className={styles.form}>
        <textarea
          className={styles.textarea}
          value={answer}
          onChange={(event) => onAnswer(event.target.value)}
          placeholder="Type the positive, question, and negative forms..."
          rows={4}
        />
        <Button variant="primary" size="lg" disabled={!answer.trim() || coachLoading} loading={coachLoading} onClick={onCheck}>
          Check
        </Button>
      </div>

      {checked ? (
        <section className={`${styles.feedback} ${passed ? styles.correct : styles.wrong}`}>
          <strong>{checked.message}</strong>
          {canReveal || passed ? (
            <div className={styles.split}>
              <article className={styles.pane}>
                <span>Your version</span>
                <p className={passed ? styles.good : styles.bad}>{answer}</p>
              </article>
              <article className={styles.pane}>
                <span>Example</span>
                <p className={styles.good}>{step.acceptedAnswers[0]}</p>
              </article>
            </div>
          ) : (
            <p className={styles.coach}>Try again before opening the standard. The formula matters more than guessing.</p>
          )}
        </section>
      ) : null}

      {coachError ? <section className={`${styles.feedback} ${styles.wrong}`}>{coachError}</section> : null}
      {coachFeedback ? (
        <section className={styles.feedback}>
          <strong>{coachFeedback.shortRu}</strong>
          {coachFeedback.grammarMiniLessonRu ? <p className={styles.coach}>{coachFeedback.grammarMiniLessonRu}</p> : null}
          <p className={styles.coach}>{coachFeedback.drillRu}</p>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <Button variant="ghost" onClick={() => setShowExample((visible) => !visible)}>
          Show example
        </Button>
        <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />} disabled={!passed} onClick={onComplete}>
          Done · Next
        </Button>
      </footer>
    </section>
  );
}
