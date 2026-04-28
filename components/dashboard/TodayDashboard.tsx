import { ArrowRight, BookOpen, CheckCircle2, RotateCw, Waves } from "lucide-react";
import { Button } from "@/components/ui";
import type { ProgressStateLike } from "./types";
import { ConsistencyCalendar } from "./ConsistencyCalendar";
import { MasteryRing } from "./MasteryRing";
import { StreakDisplay } from "./StreakDisplay";
import type { ConsistencyDay } from "./ConsistencyCalendar";
import styles from "./TodayDashboard.module.css";

type TodayDashboardProps = {
  userName: string;
  progress: ProgressStateLike;
  streakDays: boolean[];
  consistencyWeeks: ConsistencyDay[][];
  onContinue: () => void;
  onReview: () => void;
};

export function TodayDashboard({ userName, progress, streakDays, consistencyWeeks, onContinue, onReview }: TodayDashboardProps) {
  const mastery = Math.min(100, Math.max(0, Math.round(progress.score || 32)));

  return (
    <section className={styles.dashboard}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Понедельник, 07:48</span>
          <h1>Доброе утро, {userName}.</h1>
          <StreakDisplay days={streakDays} streak={5} />
        </div>
        <MasteryRing progress={mastery} active mastered={mastery >= 90} size={74} />
      </header>

      <p className={styles.meta}>Streak 5 · Past Simple negative · {mastery}% mastery · 142 паттерна в автоматизме · 5 в работе</p>

      <section className={styles.recap}>
        <span>Open-line recap · 14 stage · Past Simple negative · 92% · +12% mastery</span>
      </section>

      <section className={styles.plan} aria-label="Today's plan">
        <article className={styles.primaryCard}>
          <CheckCircle2 size={22} aria-hidden="true" />
          <span>Continue</span>
          <h2>Past Simple - вопросы и do-support</h2>
          <p>Продолжи с текущего шага и доведи конструкцию до speaking repetition.</p>
          <Button variant="primary" iconRight={<ArrowRight size={18} aria-hidden="true" />} onClick={onContinue}>
            Продолжить
          </Button>
        </article>

        <article className={styles.card}>
          <RotateCw size={22} aria-hidden="true" />
          <span>Review</span>
          <h2>14 паттернов нуждаются в speaking-rep</h2>
          <p>Фокус на do-support и артикулированном окончании regular -ed.</p>
          <Button variant="secondary" onClick={onReview}>
            Открыть
          </Button>
        </article>

        <article className={styles.card}>
          <Waves size={22} aria-hidden="true" />
          <span>Speech drill</span>
          <h2>3 паттерна с низким автоматизмом</h2>
          <p>Короткая speaking-сессия на проблемные места без нового материала.</p>
          <Button variant="secondary" onClick={onContinue}>
            Drill
          </Button>
        </article>

        <article className={styles.progressCard}>
          <BookOpen size={22} aria-hidden="true" />
          <span>Course progress</span>
          <h2>Stage 2 / 4 · Past tenses</h2>
          <p>32% курса пройдено</p>
          <div className={styles.bar}>
            <i style={{ width: "32%" }} />
          </div>
        </article>
      </section>

      <section className={styles.consistency}>
        <div>
          <span className={styles.eyebrow}>Consistency</span>
          <h2>12 недель нагрузки</h2>
        </div>
        <ConsistencyCalendar weeks={consistencyWeeks} />
      </section>
    </section>
  );
}
