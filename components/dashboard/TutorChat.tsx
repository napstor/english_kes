"use client";

import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, IconButton, TextField } from "@/components/ui";
import styles from "./TutorChat.module.css";

type TutorMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type TutorChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialMessages: TutorMessage[] = [
  { id: "m1", role: "assistant", text: "Разберем do-support без спешки: сначала смысл, потом порядок слов." },
  { id: "m2", role: "user", text: "Почему в вопросе появляется did?" },
  { id: "m3", role: "assistant", text: "Did забирает на себя прошедшее время, поэтому основной глагол возвращается в базовую форму." },
  { id: "m4", role: "user", text: "То есть not read, а не not readed?" }
];

export function TutorChat({ isOpen, onClose }: TutorChatProps) {
  const [messages, setMessages] = useState<TutorMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const sheetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.setTimeout(() => sheetRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus(), 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) return;

      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>("button, textarea, input, [href], [tabindex]:not([tabindex='-1'])")
      ).filter((item) => !item.hasAttribute("disabled"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function sendMessage() {
    const text = draft.trim();
    if (!text || loading) return;

    const userMessage: TutorMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const result = (await response.json()) as { message?: string };
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: response.ok && result.message ? result.message : fallbackTutorMessage()
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: fallbackTutorMessage()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} role="presentation">
      <button className={styles.backdrop} type="button" onClick={onClose} aria-label="Close AI Tutor" />
      <aside className={styles.sheet} ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="tutor-title">
        <header className={styles.header}>
          <div>
            <h2 id="tutor-title">AI Tutor</h2>
          </div>
          <IconButton ariaLabel="Close AI Tutor" icon={X} onClick={onClose} />
        </header>

        <div className={styles.body}>
          {messages.map((message) => (
            <article className={message.role === "assistant" ? styles.assistant : styles.user} key={message.id}>
              <span>{message.role === "assistant" ? "AI" : "YOU"}</span>
              <p>{message.text}</p>
            </article>
          ))}
          {loading ? (
            <article className={styles.assistant}>
              <span>AI</span>
              <p>Пишу короткий ответ...</p>
            </article>
          ) : null}
        </div>

        <footer className={styles.footer}>
          <TextField
            multiline
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Спроси про текущую конструкцию..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
          />
          <Button variant="primary" iconRight={<Send size={16} aria-hidden="true" />} disabled={!draft.trim() || loading} loading={loading} onClick={() => void sendMessage()}>
            Send
          </Button>
        </footer>
      </aside>
    </div>
  );
}

function fallbackTutorMessage() {
  return "Это пока заглушка для AI tutor. Реальная интеграция будет в следующем PR.";
}
