import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./IconButton.module.css";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  size?: "sm" | "md";
  ariaLabel: string;
  icon: LucideIcon;
};

export function IconButton({
  size = "md",
  ariaLabel,
  icon: Icon,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button className={cn(styles.button, styles[size], className)} type={type} aria-label={ariaLabel} {...props}>
      <Icon size={size === "sm" ? 16 : 18} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
