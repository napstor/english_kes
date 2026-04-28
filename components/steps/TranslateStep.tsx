"use client";

import { ArrowRight, Check, Eye, Lightbulb, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TrainingStep } from "@/lib/course";
import { tokenize } from "@/lib/scoring";
import type { compareAnswer } from "@/lib/scoring";
import styles from "./TranslateStep.module.css";

type AnswerResult = ReturnType<typeof compareAnswer>;

type CoachFeedback = {
  verdict: "correct" | "almost" | "incorrect";
  score: number;
  bestAnswer: string;
  shortRu: string;
  grammarMiniLessonRu?: string;
  issues: Array<{
    fragment: string;
    correction: string;
    reasonRu: string;
    grammarRu?: string;
    category: string;
  }>;
  drillRu: string;
};

type TranslateStepProps = {
  step: TrainingStep;
  answer: string;
  checked: AnswerResult | null;
  coachFeedback: CoachFeedback | null;
  coachLoading: boolean;
  coachError: string;
  attemptCount: number;
  onAnswer: (value: string) => void;
  onCheck: () => void;
  onComplete: () => void;
};

export function TranslateStep({
  step,
  answer,
  checked,
  coachFeedback,
  coachLoading,
  coachError,
  attemptCount,
  onAnswer,
  onCheck,
  onComplete
}: TranslateStepProps) {
  const [showExample, setShowExample] = useState(false);
  const tryNumber = Math.min(Math.max(attemptCount + 1, 1), 3);
  const isCorrect = checked?.status === "exact" || checked?.status === "partial";
  const isWrong = checked?.status === "wrong";
  const canReveal = attemptCount >= 2 || showExample;
  const reveal = isCorrect || showExample || attemptCount >= 3;

  useEffect(() => {
    setShowExample(false);
  }, [step.id]);

  return (
    <section className={styles.step}>
      <header className={styles.meta}>
        <span className={cn(styles.chip, isCorrect && styles.chipPositive)}>Translate</span>
        <span className={cn(styles.counter, tryNumber === 2 && styles.counterWarm, tryNumber >= 3 && styles.counterNegative)}>
          Try <b>{tryNumber}</b>/3
        </span>
      </header>

      <div className={styles.prompt}>
        <span className={styles.ruLabel}>Русская фраза</span>
        <h2>{step.sourceText ?? step.prompt.ru}</h2>
        <p>Скажи по-английски сам, затем при необходимости сверся.</p>
      </div>

      <div className={cn(styles.inputWrap, isCorrect && styles.successInput, isWrong && styles.errorInput)}>
        <span className={styles.langTag}>English</span>
        <textarea
          className={styles.textarea}
          value={answer}
          onChange={(event) => onAnswer(event.target.value)}
          placeholder="Type your answer..."
          rows={3}
        />
        <div className={styles.inputFoot}>
          <span className={styles.metaText}>{answer.trim() ? `${tokenize(answer).length} tokens` : "Answer first, check second"}</span>
          <button
            className={cn(styles.showExample, canReveal && styles.showExampleAvailable, attemptCount >= 3 && styles.showExampleProminent)}
            type="button"
            onClick={() => setShowExample((visible) => !visible)}
            disabled={!canReveal}
          >
            <Eye size={14} aria-hidden="true" />
            Show example
          </button>
          <Button variant="primary" disabled={!answer.trim() || coachLoading} loading={coachLoading} onClick={onCheck}>
            Check
          </Button>
        </div>
      </div>

      {checked ? (
        <section className={cn(styles.verdict, isCorrect ? styles.correct : styles.wrong)}>
          <span className={styles.verdictIcon}>{isCorrect ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}</span>
          <div>
            <strong>{checked.message}</strong>
            <p>{isCorrect ? "Готово. Теперь сравни свою версию с эталоном." : "Try again before opening the standard."}</p>
          </div>
        </section>
      ) : null}

      {reveal ? (
        <section className={styles.split}>
          <article className={styles.card}>
            <span>Your version</span>
            <p className={isCorrect ? styles.match : styles.diff}>{answer || "—"}</p>
            {checked?.badTokens.length ? (
              <div className={styles.tokenRow}>
                {tokenize(answer).map((token, index) => (
                  <mark className={checked.badTokens.includes(token) ? styles.badToken : styles.goodToken} key={`${token}-${index}`}>
                    {token}
                  </mark>
                ))}
              </div>
            ) : null}
          </article>
          <article className={styles.card}>
            <span>Standard</span>
            <p className={styles.standard}>{step.acceptedAnswers[0]}</p>
          </article>
        </section>
      ) : null}

      {coachLoading ? (
        <section className={styles.feedback}>
          <span className={styles.avatar}>AI</span>
          <div>
            <strong>Проверяю конструкцию...</strong>
            <p>Смотрю на порядок слов, do/does и форму глагола.</p>
          </div>
        </section>
      ) : null}

      {coachError ? (
        <section className={cn(styles.feedback, styles.feedbackError)}>
          <span className={styles.avatar}>!</span>
          <div>
            <strong>Coach feedback unavailable</strong>
            <p>{coachError}</p>
          </div>
        </section>
      ) : null}

      {coachFeedback ? (
        <section className={styles.feedback}>
          <span className={styles.avatar}>AI</span>
          <div className={styles.feedbackBody}>
            <div className={styles.feedbackHead}>
              <strong>{coachFeedback.shortRu}</strong>
              <span>{coachFeedback.score}/100</span>
            </div>
            {coachFeedback.grammarMiniLessonRu ? (
              <div className={styles.lesson}>
                <Lightbulb size={14} aria-hidden="true" />
                <p>{coachFeedback.grammarMiniLessonRu}</p>
              </div>
            ) : null}
            {coachFeedback.issues.length ? (
              <div className={styles.issues}>
                {coachFeedback.issues.slice(0, 3).map((issue, index) => (
                  <article key={`${issue.fragment}-${index}`}>
                    <strong>
                      <del>{issue.fragment}</del>
                      <span>→</span>
                      <ins>{issue.correction}</ins>
                    </strong>
                    <p>{issue.reasonRu}</p>
                  </article>
                ))}
              </div>
            ) : null}
            <p className={styles.drill}>{coachFeedback.drillRu}</p>
          </div>
        </section>
      ) : null}

      <footer className={styles.actions}>
        <Button variant="ghost" onClick={() => setShowExample((visible) => !visible)} disabled={!canReveal}>
          Show example
        </Button>
        <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />} disabled={!isCorrect && !reveal} onClick={onComplete}>
          Done · Next
        </Button>
      </footer>
    </section>
  );
}
