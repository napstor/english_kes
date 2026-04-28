import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import type { Locale, TrainingStep } from "@/lib/course";
import styles from "./TheoryStep.module.css";

type TheoryStepProps = {
  step: TrainingStep;
  locale: Locale;
  onComplete: () => void;
};

export function TheoryStep({ step, locale, onComplete }: TheoryStepProps) {
  const title = step.theory?.cards.find((card) => card.formula)?.formula ?? step.label[locale];

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <span className={styles.chip}>Theory</span>
        <h2 className={styles.title}>{title}</h2>
        {step.theory?.lead ? <p className={styles.lead}>{step.theory.lead[locale]}</p> : <p className={styles.lead}>{step.prompt[locale]}</p>}
      </header>

      {step.theory ? (
        <div className={styles.content}>
          {step.theory.cards.length ? (
            <section className={styles.cards} aria-label="Theory rules">
              {step.theory.cards.map((card) => (
                <article className={styles.card} key={card.title[locale]}>
                  <h3>{card.title[locale]}</h3>
                  <p>{card.body[locale]}</p>
                  {card.formula ? <code>{card.formula}</code> : null}
                  {card.example ? <small>{card.example[locale]}</small> : null}
                </article>
              ))}
            </section>
          ) : null}

          {step.theory.examples.length ? (
            <section aria-label="Examples">
              <p className={styles.sectionTitle}>Examples</p>
              <div className={styles.examples}>
                {step.theory.examples.map((example) => (
                  <article className={styles.example} key={example.ru}>
                    <p>{example.ru}</p>
                    <strong>{example.en}</strong>
                    <small>{example.note[locale]}</small>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {step.theory.method[locale]?.length ? (
            <section className={styles.pattern}>
              <span>Method</span>
              <code>{step.theory.method[locale].join(" · ")}</code>
            </section>
          ) : null}
        </div>
      ) : (
        <section className={styles.pattern}>
          <span>Focus</span>
          <code>{step.notes[locale].join(" · ")}</code>
        </section>
      )}

      <footer className={styles.footer}>
        <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />} onClick={onComplete}>
          Done · Next
        </Button>
      </footer>
    </section>
  );
}
