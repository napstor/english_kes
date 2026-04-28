"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const showBreadcrumb = pathname !== "/" && pathname !== "/today";

  return (
    <header className={cn(styles.topBar, className)}>
      <div className={styles.brand}>
        <BrandMark courseMeta={brandMeta} />
      </div>
      <div className={styles.crumb}>{showBreadcrumb ? breadcrumb : null}</div>
      <div className={styles.actions}>{actions}</div>
    </header>
  );
}
