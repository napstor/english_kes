"use client";

import styles from "./ConsistencyCalendar.module.css";

export type ConsistencyDay = {
  date: string;
  load: number;
  label: string;
};

type ConsistencyCalendarProps = {
  weeks: ConsistencyDay[][];
};

export function ConsistencyCalendar({ weeks }: ConsistencyCalendarProps) {
  return (
    <section className={styles.calendar} aria-label="Consistency calendar">
      <div className={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <div className={styles.week} key={`week-${weekIndex}`}>
            {week.map((day) => (
              <button className={styles.cell} data-grade={getGrade(day.load)} title={day.label} type="button" key={day.date}>
                <span>{day.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className={styles.caption}>1-3 light · 4-7 mid · 8-12 dark · 13+ darkest</p>
    </section>
  );
}

function getGrade(load: number) {
  if (load >= 13) return "4";
  if (load >= 8) return "3";
  if (load >= 4) return "2";
  if (load >= 1) return "1";
  return "0";
}
