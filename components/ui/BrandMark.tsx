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
      <span className={styles.emblem} aria-hidden="true">
        KES
      </span>
      <span className={styles.text}>
        <span className={styles.name}>
          <span className={styles.kes}>KES</span>
          <span className={styles.english}>English</span>
        </span>
        {courseMeta ? <span className={styles.meta}>{courseMeta}</span> : null}
      </span>
    </div>
  );
}
