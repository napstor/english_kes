"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { BrandMark, Button, TextField } from "@/components/ui";
import styles from "./AuthShell.module.css";

type AuthShellProps = {
  onSubmit: (username: string, password: string) => Promise<void> | void;
  loading?: boolean;
  error?: string;
};

export function AuthShell({ onSubmit, loading = false, error = "" }: AuthShellProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const visibleError = localError || error;
  const busy = loading || submitting;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setLocalError("");

    try {
      await onSubmit(username, password);
    } catch (submitError) {
      setLocalError(submitError instanceof Error ? submitError.message : "Не удалось войти.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card} aria-labelledby="auth-title">
        <header className={styles.header}>
          <BrandMark variant="auth-hero" courseMeta="Методика Гивенталя" />
          <div className={styles.titleGroup}>
            <h1 className={styles.title} id="auth-title">
              Войдите в тренажёр
            </h1>
            <p className={styles.subtitle}>Продолжите уроки разговорного английского с того места, где остановились.</p>
          </div>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <TextField
            label="Логин"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <TextField
            label="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
          {visibleError ? (
            <div className={styles.error} role="alert">
              {visibleError}
            </div>
          ) : null}
          <Button className={styles.button} type="submit" variant="primary" size="lg" loading={busy} disabled={!username.trim() || !password}>
            Войти
          </Button>
        </form>
      </section>
    </main>
  );
}
