import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Pill.module.css";

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Pill({ className, children, ...props }: PillProps) {
  return (
    <span className={cn(styles.pill, className)} {...props}>
      {children}
    </span>
  );
}
