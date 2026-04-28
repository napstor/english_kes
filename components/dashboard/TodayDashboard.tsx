import { ArrowRight, CheckCircle2, RotateCw, Waves } from "lucide-react";
import { Button } from "@/components/ui";
import { StreakDisplay } from "./StreakDisplay";
import styles from "./TodayDashboard.module.css";

type TodayDashboardProps = {
  userName: string;
  streakDays: boolean[];
  onContinue: () => void;
  onCourse: () => void;
  onReview: () => void;
};

export function TodayDashboard({ userName, streakDays, onContinue, onCourse, onReview }: TodayDashboardProps) {
  return (
    <section className={styles.dashboard}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Понедельник, 07:48</span>
        <h1>Доброе утро, {userName}.</h1>
        <StreakDisplay days={streakDays} streak={5} />
      </header>

      <p className={styles.statusRow}>
        Past Simple negative · 98% mastery · 142 паттерна в автоматизме · 5 в работе ·{" "}
        <a href="/review" onClick={(event) => {
          event.preventDefault();
          onReview();
        }}>
          Полный разбор →
        </a>
      </p>

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

        <article className={styles.reviewCard}>
          <RotateCw size={22} aria-hidden="true" />
          <span>Review</span>
          <h2>14 паттернов нуждаются в speaking-rep</h2>
          <p>Фокус на do-support и артикулированном окончании regular -ed.</p>
          <Button variant="secondary" onClick={onReview}>
            Открыть
          </Button>
        </article>

        <article className={styles.speechCard}>
          <Waves size={22} aria-hidden="true" />
          <span>Speech drill</span>
          <h2>3 паттерна с низким автоматизмом</h2>
          <p>Короткая speaking-сессия на проблемные места без нового материала.</p>
          <Button variant="secondary" onClick={onContinue}>
            Drill
          </Button>
        </article>
      </section>

      <p className={styles.footerRow}>
        Stage 2 / 4 · Past tenses · 32% курса пройдено ·{" "}
        <a href="/course" onClick={(event) => {
          event.preventDefault();
          onCourse();
        }}>
          Программа →
        </a>
      </p>
    </section>
  );
}
