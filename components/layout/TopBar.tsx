import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "./TopBar.module.css";

type TopBarProps = {
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  brandMeta?: string;
  className?: string;
};

export function TopBar({ breadcrumb, actions, brandMeta, className }: TopBarProps) {
  return (
    <header className={cn(styles.topBar, className)}>
      <div className={styles.brand}>
        <BrandMark courseMeta={brandMeta} />
      </div>
      <div className={styles.crumb}>{breadcrumb}</div>
      <div className={styles.actions}>{actions}</div>
    </header>
  );
}
