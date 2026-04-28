import styles from "./StreakDisplay.module.css";

type StreakDisplayProps = {
  days: boolean[];
  streak: number;
};

export function StreakDisplay({ days, streak }: StreakDisplayProps) {
  return (
    <div className={styles.streak} aria-label={`Streak ${streak} дней`}>
      <span>Streak · {streak} дней</span>
      <div className={styles.dots}>
        {days.slice(0, 30).map((active, index) => (
          <i className={active ? styles.active : undefined} key={`${index}-${active}`} />
        ))}
      </div>
    </div>
  );
}
