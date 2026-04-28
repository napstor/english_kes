"use client";

import { ArrowRight, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import type { Locale, TrainingStep, VocabularyItem } from "@/lib/course";
import styles from "./VocabularyStep.module.css";

type VocabularyStepProps = {
  step: TrainingStep;
  locale: Locale;
  onPlay: (text: string) => void;
  onComplete: () => void;
};

function parseNote(note: string): VocabularyItem {
  const [ru, ...englishParts] = note.split(" - ");
  return {
    ru: ru?.trim() || note,
    en: englishParts.join(" - ").trim() || note
  };
}

export function VocabularyStep({ step, locale, onPlay, onComplete }: VocabularyStepProps) {
  const items = useMemo(() => step.vocabulary ?? step.notes[locale].map(parseNote), [locale, step.notes, step.vocabulary]);
  const [heard, setHeard] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setHeard(new Set());
  }, [step.id]);

  function playItem(item: VocabularyItem) {
    setHeard((current) => new Set(current).add(item.en));
    onPlay(item.en);
  }

  const allHeard = items.length > 0 && heard.size >= items.length;

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <span className={styles.chip}>Vocabulary</span>
        <h2 className={styles.title}>{step.label[locale]}</h2>
        <p className={styles.summary}>
          {heard.size}/{items.length} listened
        </p>
      </header>

      <div className={styles.list}>
        {items.map((item, index) => {
          const isHeard = heard.has(item.en);
          return (
            <article className={`${styles.card} ${isHeard ? styles.heard : ""}`} key={`${item.ru}-${item.en}-${index}`}>
              <div className={styles.word}>
                <strong>{item.en}</strong>
                <code>{item.note ?? "listen and repeat"}</code>
                <span>{item.ru}</span>
              </div>
              <button className={styles.play} type="button" onClick={() => playItem(item)} aria-label={`Play ${item.en}`}>
                <Play size={17} fill="currentColor" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>

      <footer className={styles.footer}>
        <span className={styles.hint}>{allHeard ? "All words listened." : "Listen to every card to continue."}</span>
        <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />} disabled={!allHeard} onClick={onComplete}>
          Done · Next
        </Button>
      </footer>
    </section>
  );
}
