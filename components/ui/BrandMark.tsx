import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./BrandMark.module.css";

type BrandMarkProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "auth-hero" | "compact";
  courseMeta?: string;
};

const variantClass = {
  default: styles.default,
  "auth-hero": styles.authHero,
  compact: styles.compact
};

export function BrandMark({ variant = "default", courseMeta = "Conversational trainer", className, ...props }: BrandMarkProps) {
  return (
    <div className={cn(styles.brandMark, variantClass[variant], className)} aria-label="English KES" {...props}>
      <svg className={styles.emblem} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="9" y="8" width="3" height="16" fill="currentColor" rx="1" />
        <path
          d="M 12 16 L 22 8 M 12 16 L 22 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={styles.text}>
        <span className={styles.name}>
          <span className={styles.english}>English</span>
          <span className={styles.kes}>KES</span>
        </span>
        {courseMeta ? <span className={styles.meta}>{courseMeta}</span> : null}
      </span>
    </div>
  );
}
