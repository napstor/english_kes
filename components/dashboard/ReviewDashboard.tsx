"use client";

import { Play, RotateCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import type { ReviewPatternMock } from "@/lib/mockData";
import { MasteryRing } from "./MasteryRing";
import styles from "./ReviewDashboard.module.css";

type ReviewDashboardProps = {
  patterns: ReviewPatternMock[];
  onPlay: (text: string) => void;
};

export function ReviewDashboard({ patterns, onPlay }: ReviewDashboardProps) {
  const [openId, setOpenId] = useState(patterns[0]?.id ?? "");
  const phraseCount = patterns.reduce((sum, pattern) => sum + pattern.phrases.length, 0);
  const averageScore = Math.round(
    patterns.reduce((sum, pattern) => sum + pattern.phrases.reduce((inner, phrase) => inner + phrase.score, 0), 0) / Math.max(phraseCount, 1)
  );

  return (
    <section className={styles.review}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Review queue</span>
        <h1>К повтору · Speaking {phraseCount} фраз · 3 зоны фокуса · крайняя — 16 дней</h1>
        <p>Нейтральная очередь повторения: поддерживаем автоматизм без драматизации.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.patterns}>
          {patterns.map((pattern) => {
            const open = pattern.id === openId;
            return (
              <article className={styles.pattern} key={pattern.id}>
                <button className={styles.patternHead} type="button" onClick={() => setOpenId(open ? "" : pattern.id)}>
                  <RotateCw size={18} aria-hidden="true" />
                  <div>
                    <h2>{pattern.name}</h2>
                    <span>{pattern.phrases.length} phrases · {pattern.age}</span>
                  </div>
                  <MasteryRing progress={Math.round(pattern.phrases.reduce((sum, phrase) => sum + phrase.score, 0) / pattern.phrases.length)} active size={48} />
                </button>
                {open ? (
                  <div className={styles.phrases}>
                    {pattern.phrases.map((phrase) => (
                      <article className={styles.phrase} key={phrase.id}>
                        <div>
                          <p>{phrase.russian}</p>
                          <strong>{phrase.english}</strong>
                        </div>
                        <span>{phrase.score}/100</span>
                        <Button variant="secondary" size="sm" iconLeft={<Play size={14} aria-hidden="true" fill="currentColor" />} onClick={() => onPlay(phrase.english)}>
                          Listen
                        </Button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <aside className={styles.sidebar}>
          <span className={styles.eyebrow}>Mastery breakdown</span>
          <MasteryRing progress={averageScore} active size={86} />
          <dl>
            <div>
              <dt>Accuracy</dt>
              <dd>78%</dd>
            </div>
            <div>
              <dt>Speaking interval</dt>
              <dd>84%</dd>
            </div>
            <div>
              <dt>Focus zones</dt>
              <dd>3</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
