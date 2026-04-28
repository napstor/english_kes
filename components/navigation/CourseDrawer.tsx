"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { type NavigationStep, stepTypeCode } from "./types";
import styles from "./CourseDrawer.module.css";

type CourseDrawerProps = {
  isOpen: boolean;
  steps: NavigationStep[];
  currentStepId: string;
  onClose: () => void;
  onStepClick: (stepId: string) => void;
  lessonTitle?: string;
  className?: string;
};

function splitSteps(steps: NavigationStep[], currentStepId: string) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);
  return {
    past: steps.filter((_, index) => index < currentIndex),
    current: steps.filter((step) => step.id === currentStepId),
    future: steps.filter((_, index) => index > currentIndex)
  };
}

export function CourseDrawer({ isOpen, steps, currentStepId, onClose, onStepClick, lessonTitle = "Lesson 1 of 44", className }: CourseDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const groups = splitSteps(steps, currentStepId);
  const completedCount = steps.filter((step) => step.completed).length;

  useEffect(() => {
    if (!isOpen) return;

    const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), details summary, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousActive?.focus();
    };
  }, [isOpen, onClose]);

  function selectStep(stepId: string) {
    onStepClick(stepId);
    onClose();
  }

  return (
    <div className={cn(styles.drawer, isOpen && styles.open, className)} aria-hidden={!isOpen}>
      <button className={styles.scrim} type="button" onClick={onClose} tabIndex={isOpen ? 0 : -1} aria-label="Закрыть карту курса" />
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-drawer-title"
        tabIndex={-1}
        ref={panelRef}
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id="course-drawer-title">Карта курса</h2>
            <p>
              {lessonTitle} · {completedCount}/{steps.length} шагов
            </p>
          </div>
          <IconButton ariaLabel="Закрыть карту курса" icon={X} onClick={onClose} />
        </header>
        <div className={styles.body}>
          <StepGroup title="Прошло" steps={groups.past} currentStepId={currentStepId} onStepClick={selectStep} />
          <StepGroup title="Сейчас" steps={groups.current} currentStepId={currentStepId} onStepClick={selectStep} defaultOpen />
          <StepGroup title="Впереди" steps={groups.future} currentStepId={currentStepId} onStepClick={selectStep} />
        </div>
      </aside>
    </div>
  );
}

function StepGroup({
  title,
  steps,
  currentStepId,
  onStepClick,
  defaultOpen = false
}: {
  title: string;
  steps: NavigationStep[];
  currentStepId: string;
  onStepClick: (stepId: string) => void;
  defaultOpen?: boolean;
}) {
  if (!steps.length) return null;

  return (
    <details className={styles.group} open={defaultOpen || title !== "Впереди"}>
      <summary className={styles.summary}>
        {title}
        <span>{steps.length}</span>
      </summary>
      <div className={styles.steps}>
        {steps.map((step) => {
          const active = step.id === currentStepId;
          return (
            <button
              className={cn(styles.row, active && styles.active, step.completed && styles.completed)}
              type="button"
              onClick={() => onStepClick(step.id)}
              aria-current={active ? "step" : undefined}
              key={step.id}
            >
              <span className={styles.marker}>{step.index + 1}</span>
              <span className={styles.text}>
                <span className={styles.title}>{step.title}</span>
                <span className={styles.type}>{step.typeLabel}</span>
              </span>
              <span className={styles.type}>{stepTypeCode(step.type)}</span>
            </button>
          );
        })}
      </div>
    </details>
  );
}
