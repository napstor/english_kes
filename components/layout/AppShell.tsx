import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./AppShell.module.css";

type AppShellProps = {
  topBar: ReactNode;
  sidebar?: ReactNode;
  bottomTabs?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AppShell({ topBar, sidebar, bottomTabs, children, className }: AppShellProps) {
  return (
    <div className={cn(styles.shell, className)}>
      {topBar}
      <div className={styles.body}>
        {sidebar}
        <main className={styles.content} id="main-content">
          <div className={styles.canvas}>{children}</div>
        </main>
      </div>
      {bottomTabs}
    </div>
  );
}
