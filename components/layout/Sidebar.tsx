"use client";

import { BookOpen, Calendar, ChevronLeft, ChevronRight, RotateCw, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./Sidebar.module.css";

type SidebarItemKey = "today" | "course" | "review" | "profile";

type SidebarItem = {
  key: SidebarItemKey;
  label: string;
  href: string;
  icon: typeof Calendar;
};

type SidebarProps = {
  activeKey?: SidebarItemKey;
  items?: SidebarItem[];
  className?: string;
  onItemClick?: (key: SidebarItemKey) => void;
};

const collapsedKey = "english-kes-sidebar-collapsed-v2";

const defaultItems: SidebarItem[] = [
  { key: "today", label: "Today", href: "/today", icon: Calendar },
  { key: "course", label: "Course", href: "/course", icon: BookOpen },
  { key: "review", label: "Review", href: "/review", icon: RotateCw },
  { key: "profile", label: "Profile", href: "/profile", icon: User }
];

export function Sidebar({ activeKey = "today", items = defaultItems, className, onItemClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(collapsedKey);
    setCollapsed(stored === null ? true : stored === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(collapsedKey, String(next));
      return next;
    });
  }

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed, className)} aria-label="Primary navigation">
      <nav className={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;
          return (
            <a
              className={cn(styles.item, active && styles.active)}
              href={item.href}
              onClick={(event) => {
                if (!onItemClick) return;
                event.preventDefault();
                onItemClick(item.key);
              }}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              key={item.key}
            >
              <span className={styles.icon}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className={styles.label}>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <button className={styles.toggle} type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <span className={styles.icon}>
          {collapsed ? <ChevronRight size={18} aria-hidden="true" /> : <ChevronLeft size={18} aria-hidden="true" />}
        </span>
        <span className={styles.label}>{collapsed ? "Expand" : "Collapse"}</span>
      </button>
    </aside>
  );
}
