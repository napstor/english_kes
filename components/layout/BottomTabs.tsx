import { BookOpen, Calendar, RotateCw, User } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./BottomTabs.module.css";

type BottomTabKey = "today" | "course" | "review" | "profile";

type BottomTab = {
  key: BottomTabKey;
  label: string;
  href: string;
  icon: typeof Calendar;
};

type BottomTabsProps = {
  activeKey?: BottomTabKey;
  tabs?: BottomTab[];
  className?: string;
};

const defaultTabs: BottomTab[] = [
  { key: "today", label: "Today", href: "/today", icon: Calendar },
  { key: "course", label: "Course", href: "/course", icon: BookOpen },
  { key: "review", label: "Review", href: "/review", icon: RotateCw },
  { key: "profile", label: "Profile", href: "/profile", icon: User }
];

export function BottomTabs({ activeKey = "today", tabs = defaultTabs, className }: BottomTabsProps) {
  return (
    <nav className={cn(styles.tabs, className)} aria-label="Mobile navigation">
      {tabs.slice(0, 4).map((tab) => {
        const Icon = tab.icon;
        const active = tab.key === activeKey;
        return (
          <a className={cn(styles.tab, active && styles.active)} href={tab.href} aria-current={active ? "page" : undefined} key={tab.key}>
            <Icon size={18} aria-hidden="true" />
            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
