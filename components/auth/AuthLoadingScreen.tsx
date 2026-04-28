import { BrandMark } from "@/components/ui";
import styles from "./AuthLoadingScreen.module.css";

export function AuthLoadingScreen() {
  return (
    <main className={styles.shell} aria-busy="true" aria-live="polite">
      <section className={styles.panel} aria-label="Загрузка тренажёра">
        <div className={styles.mark}>
          <BrandMark courseMeta="Методика Гивенталя" />
        </div>
        <p>Загружаем</p>
      </section>
    </main>
  );
}
