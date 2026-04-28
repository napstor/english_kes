import { BookOpen } from "lucide-react";
import { TypeChip } from "@/components/ui";
import { cn } from "@/lib/cn";
import { type NavigationStep, stepTypeCode } from "./types";
import styles from "./StepRail.module.css";

type StepRailProps = {
  steps: NavigationStep[];
  currentStepId: string;
  onStepClick: (stepId: string) => void;
  onCourseClick?: () => void;
  className?: string;
};

export function StepRail({ steps, currentStepId, onStepClick, onCourseClick, className }: StepRailProps) {
  return (
    <nav className={cn(styles.rail, className)} aria-label="Nearby lesson steps">
      <div className={styles.track}>
        {steps.map((step) => {
          const active = step.id === currentStepId;
          return (
            <button
              className={cn(styles.step, active && styles.active, step.completed && styles.completed)}
              type="button"
              onClick={() => onStepClick(step.id)}
              aria-current={active ? "step" : undefined}
              key={step.id}
            >
              <span className={styles.number}>{step.index + 1}</span>
              <span className={styles.meta}>
                <TypeChip code={stepTypeCode(step.type)} title={step.typeLabel} />
                <span className={styles.label}>{step.title}</span>
              </span>
            </button>
          );
        })}
      </div>
      {onCourseClick ? (
        <button className={styles.courseButton} type="button" onClick={onCourseClick}>
          <BookOpen size={16} aria-hidden="true" />
          Открыть курс
        </button>
      ) : null}
    </nav>
  );
}
