import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./TypeChip.module.css";

export type TypeChipCode = "CTX" | "THR" | "RCG" | "TRN" | "DRL" | "SPK";

type TypeChipProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  code: TypeChipCode;
};

export function TypeChip({ code, className, ...props }: TypeChipProps) {
  return (
    <span className={cn(styles.chip, styles[code.toLowerCase()], className)} {...props}>
      {code}
    </span>
  );
}
