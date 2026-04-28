import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Callout.module.css";

type CalloutProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "warn" | "error" | "ok";
  children: ReactNode;
};

export function Callout({ tone = "info", className, children, role, ...props }: CalloutProps) {
  return (
    <div className={cn(styles.callout, styles[tone], className)} role={role ?? (tone === "error" ? "alert" : undefined)} {...props}>
      {children}
    </div>
  );
}
