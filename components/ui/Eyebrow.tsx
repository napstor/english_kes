import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Eyebrow.module.css";

type EyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  tone?: "default" | "indigo" | "lime" | "amber" | "negative";
  children: ReactNode;
};

export function Eyebrow({ tone = "default", className, children, ...props }: EyebrowProps) {
  return (
    <p className={cn(styles.eyebrow, styles[tone], className)} {...props}>
      {children}
    </p>
  );
}
