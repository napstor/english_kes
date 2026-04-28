"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./MasteryRing.module.css";

type MasteryRingProps = {
  progress: number;
  label?: string;
  mastered?: boolean;
  active?: boolean;
  size?: number;
  className?: string;
};

export function MasteryRing({ progress, label, mastered = false, active = false, size = 54, className }: MasteryRingProps) {
  const [masteredAcknowledged, setMasteredAcknowledged] = useState(false);
  const normalized = Math.min(Math.max(progress, 0), 100);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  useEffect(() => {
    if (!mastered) {
      setMasteredAcknowledged(false);
      return;
    }

    const timeout = window.setTimeout(() => setMasteredAcknowledged(true), 650);
    return () => window.clearTimeout(timeout);
  }, [mastered]);

  return (
    <span
      className={cn(
        styles.ring,
        active && styles.active,
        mastered && styles.mastered,
        mastered && !masteredAcknowledged && styles.masteredGlow,
        className
      )}
      style={{ width: size, height: size }}
      aria-label={label ?? `Mastery ${Math.round(normalized)} percent`}
    >
      <svg className={styles.svg} viewBox="0 0 48 48" aria-hidden="true">
        <circle className={styles.track} cx="24" cy="24" r={radius} />
        <circle
          className={styles.progress}
          cx="24"
          cy="24"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={styles.value}>{Math.round(normalized)}</span>
    </span>
  );
}
