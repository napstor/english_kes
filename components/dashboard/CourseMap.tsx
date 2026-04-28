import type { NavigationStep } from "@/components/navigation";
import type { CourseLessonMock } from "@/lib/mockData";
import { MasteryRing } from "./MasteryRing";
import type { ProgressStateLike } from "./types";
import styles from "./CourseMap.module.css";

type CourseMapProps = {
  steps: NavigationStep[];
  lessons: CourseLessonMock[];
  progress: ProgressStateLike;
  onLessonClick: (lessonId: string) => void;
  onStepClick: (stepId: string) => void;
};

export function CourseMap({ steps, lessons, progress, onLessonClick, onStepClick }: CourseMapProps) {
  const completedCount = progress.completedSteps.length;

  return (
    <section className={styles.map}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Course map</span>
        <h1>Карта курса</h1>
        <p>Урок 1 / 44 · {completedCount}/{steps.length} шагов</p>
      </header>

      <div className={styles.timeline}>
        {lessons.map((lesson) => {
          const current = lesson.number === 1;
          return (
            <article className={current ? styles.currentLesson : styles.lesson} key={lesson.id}>
              <button className={styles.lessonButton} type="button" onClick={() => onLessonClick(lesson.id)}>
                <span className={styles.num}>{String(lesson.number).padStart(2, "0")}</span>
                <div>
                  <h2>{lesson.title}</h2>
                  <p>{lesson.description}</p>
                  <span className={styles.meta}>
                    {lesson.stepCount} шагов · {lesson.completedSteps}/{lesson.stepCount}
                  </span>
                </div>
                <MasteryRing progress={current ? Math.max(lesson.mastery, progress.score) : lesson.mastery} active={current} size={54} />
              </button>

              {current ? (
                <div className={styles.steps}>
                  {steps.map((step, index) => (
                    <button className={step.id === steps[progress.activeStep]?.id ? styles.activeStep : styles.step} type="button" onClick={() => onStepClick(step.id)} key={step.id}>
                      <span>{index + 1}</span>
                      <small>{step.typeLabel}</small>
                      <strong>{step.title}</strong>
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <section className={styles.placeholder}>
        <div className={styles.placeholderLine} aria-hidden="true" />
        <h2>Уроки 2–44</h2>
        <p>В разработке. Сейчас доступен Lesson 1 — Я делаю это обычно (Present Simple).</p>
      </section>
    </section>
  );
}
