"use client";

import { ArrowRight, Mic, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TrainingStep } from "@/lib/course";
import { tokenize } from "@/lib/scoring";
import type { compareAnswer } from "@/lib/scoring";
import styles from "./SpeakingStep.module.css";

type NativeAudioMode = "slow" | "normal";

type NativeAudioState = {
  status: "idle" | "loading" | "playing" | "ready" | "error";
  message: string;
  audioUrl: string;
  voiceName: string;
  cached: boolean;
};

type PronunciationReview = {
  score: number;
  nativeImpressionRu: string;
  summaryRu: string;
  issues: Array<{
    titleRu: string;
    evidenceRu: string;
    fixRu: string;
    drillRu: string;
  }>;
  drillRu: string;
};

type SpeechReview = {
  transcript: string;
  result: ReturnType<typeof compareAnswer> | null;
  error: string;
  audioUrl: string;
  pronunciation: PronunciationReview | null;
};

type SpeakingStepProps = {
  step: TrainingStep;
  elapsed: number;
  recorded: boolean;
  recordingMessage: string;
  recordingStatus: "idle" | "uploading" | "uploaded" | "error";
  recording: boolean;
  speechReview: SpeechReview | null;
  nativeAudio: Record<NativeAudioMode, NativeAudioState>;
  onStart: () => void;
  onStop: () => void;
  onPlayNative: (mode: NativeAudioMode) => void;
  onPlayRecording: (audioUrl: string) => void;
  onComplete: () => void;
};

export function SpeakingStep({
  step,
  elapsed,
  recorded,
  recordingMessage,
  recordingStatus,
  recording,
  speechReview,
  nativeAudio,
  onStart,
  onStop,
  onPlayNative,
  onPlayRecording,
  onComplete
}: SpeakingStepProps) {
  const [referenceVisible, setReferenceVisible] = useState(false);
  const isProcessing = recordingStatus === "uploading";
  const hasResult = recordingStatus === "uploaded" || Boolean(speechReview?.transcript || speechReview?.pronunciation);
  const hasFallback = recordingStatus === "error";
  const consoleState = recording ? "recording" : isProcessing ? "processing" : "armed";
  const slowAudio = nativeAudio.slow;
  const normalAudio = nativeAudio.normal;

  useEffect(() => {
    setReferenceVisible(false);
  }, [step.id]);

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <span className={styles.chip}>Speaking</span>
        <span className={styles.badge}>{hasResult ? "Scored" : recording ? "Recording" : isProcessing ? "Recognizing" : "Ready"}</span>
      </header>

      <div className={styles.prompt}>
        <span className={styles.instruction}>
          <Mic size={13} aria-hidden="true" />
          Трехмерная речь
        </span>
        <h2>{step.sourceText ?? step.prompt.ru}</h2>
        <p>Прочитай русскую фразу про себя и вслух произнеси трехмерный английский вариант.</p>
      </div>

      <div className={cn(styles.split, hasResult && styles.splitResults)}>
        <section className={styles.leftColumn}>
          <span className={styles.columnLabel}>Recording console</span>
          <div className={cn(styles.console, styles[consoleState])}>
            <span className={styles.stateLabel}>
              <i />
              {recording ? "Recording" : isProcessing ? "Распознаем..." : hasFallback ? "Needs retry" : "Tap to record"}
            </span>

            <Waveform active={recording} playback={hasResult} />

            <button
              className={cn(styles.micButton, recording && styles.micRecording, isProcessing && styles.micProcessing)}
              type="button"
              onClick={recording ? onStop : onStart}
              disabled={isProcessing}
              aria-label={recording ? "Stop recording" : "Start recording"}
            >
              {recording ? <Square size={42} aria-hidden="true" fill="currentColor" /> : <Mic size={44} aria-hidden="true" />}
            </button>

            <div className={styles.recHelp}>
              <span className={styles.timer}>{elapsed}s</span>
              {recording ? <span>Stop when the full phrase is done</span> : <span>English standard stays hidden first</span>}
            </div>

            {recording ? (
              <Button variant="ghost" onClick={onStop}>
                Cancel
              </Button>
            ) : null}

            {recorded ? (
              <div className={cn(styles.statusCard, hasFallback && styles.statusError, hasResult && styles.statusSuccess)}>
                <strong>{hasFallback ? "Не удалось распознать. Попробуй еще раз" : "Запись принята"}</strong>
                <p>{recordingMessage || "Запись сохранена локально до следующей попытки."}</p>
                {hasFallback ? (
                  <div className={styles.statusActions}>
                    <Button variant="secondary" onClick={onStart} iconLeft={<RotateCcw size={16} aria-hidden="true" />}>
                      Попробовать снова
                    </Button>
                    <Button variant="ghost" onClick={onComplete}>
                      Пропустить
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={styles.reference}>
            <p>{referenceVisible ? step.targetText : "Английский эталон скрыт. Скажи по-английски сам, затем при необходимости сверся."}</p>
            <Button variant="ghost" onClick={() => setReferenceVisible((visible) => !visible)}>
              {referenceVisible ? "Hide standard" : "Show standard"}
            </Button>
          </div>

          <PlaybackRow
            speechReview={speechReview}
            slowAudio={slowAudio}
            normalAudio={normalAudio}
            onPlayRecording={onPlayRecording}
            onPlayNative={onPlayNative}
          />
        </section>

        <section className={styles.rightColumn}>
          {hasResult || speechReview?.error ? (
            <>
              {speechReview?.transcript ? <TranscriptPanel review={speechReview} /> : null}
              {speechReview?.error ? (
                <div className={cn(styles.statusCard, styles.statusError)}>
                  <strong>Речь не распознана</strong>
                  <p>{speechReview.error}</p>
                </div>
              ) : null}
              {speechReview?.pronunciation ? <PronunciationPanel review={speechReview.pronunciation} expectedText={step.targetText} /> : null}
            </>
          ) : (
            <div className={styles.emptyPanel}>
              <Volume2 size={24} aria-hidden="true" />
              <span>Запиши, чтобы получить разбор</span>
            </div>
          )}
        </section>
      </div>

      <footer className={styles.actions}>
        <Button variant="ghost" onClick={onStart} disabled={recording || isProcessing}>
          Reset attempt
        </Button>
        <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} aria-hidden="true" />} disabled={!hasResult && !speechReview?.error} onClick={onComplete}>
          Done · Next
        </Button>
      </footer>
    </section>
  );
}

function Waveform({ active, playback }: { active: boolean; playback: boolean }) {
  return (
    <div className={cn(styles.waveform, active && styles.waveformActive, playback && styles.waveformPlayback)} aria-hidden="true">
      {Array.from({ length: 24 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function PlaybackRow({
  speechReview,
  slowAudio,
  normalAudio,
  onPlayRecording,
  onPlayNative
}: {
  speechReview: SpeechReview | null;
  slowAudio: NativeAudioState;
  normalAudio: NativeAudioState;
  onPlayRecording: (audioUrl: string) => void;
  onPlayNative: (mode: NativeAudioMode) => void;
}) {
  return (
    <div className={styles.playbackRow}>
      <button
        className={cn(styles.playbackButton, styles.yours)}
        type="button"
        onClick={() => speechReview?.audioUrl && onPlayRecording(speechReview.audioUrl)}
        disabled={!speechReview?.audioUrl}
      >
        <Play size={12} aria-hidden="true" fill="currentColor" />
        Твоя запись
      </button>
      <button className={styles.playbackButton} type="button" onClick={() => onPlayNative("slow")} disabled={slowAudio.status === "loading"}>
        <Play size={12} aria-hidden="true" fill="currentColor" />
        {slowAudio.status === "loading" ? "Генерирую..." : "Эталон медленно"}
      </button>
      <button className={styles.playbackButton} type="button" onClick={() => onPlayNative("normal")} disabled={normalAudio.status === "loading"}>
        <Play size={12} aria-hidden="true" fill="currentColor" />
        {normalAudio.status === "loading" ? "Генерирую..." : "Эталон обычно"}
      </button>
    </div>
  );
}

function TranscriptPanel({ review }: { review: SpeechReview }) {
  const status = review.result?.status ?? "partial";
  return (
    <section className={cn(styles.panel, status === "wrong" && styles.panelWrong)}>
      <span className={styles.panelEyebrow}>Recognized speech</span>
      <p className={styles.transcript}>{review.transcript}</p>
      {review.result ? (
        <>
          <p className={styles.panelCopy}>{review.result.message}</p>
          <div className={styles.tokenRow}>
            {tokenize(review.transcript).map((token, index) => (
              <mark className={review.result?.badTokens.includes(token) ? styles.badToken : styles.goodToken} key={`${token}-${index}`}>
                {token}
              </mark>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function PronunciationPanel({ review, expectedText }: { review: PronunciationReview; expectedText: string }) {
  return (
    <section className={styles.panel}>
      <div className={styles.scoreRow}>
        <div>
          <span className={styles.panelEyebrow}>Pronunciation</span>
          <h3>{review.nativeImpressionRu}</h3>
        </div>
        <strong>{review.score}/100</strong>
      </div>
      {review.summaryRu ? <p className={styles.panelCopy}>{review.summaryRu}</p> : null}
      <IntonationGuide text={expectedText} />
      {review.issues.length ? (
        <div className={styles.issues}>
          {review.issues.map((issue) => (
            <article key={`${issue.titleRu}-${issue.fixRu}`}>
              <h4>{issue.titleRu}</h4>
              {issue.evidenceRu ? <p>{issue.evidenceRu}</p> : null}
              {issue.fixRu ? <strong>{issue.fixRu}</strong> : null}
              {issue.drillRu ? <small>{issue.drillRu}</small> : null}
            </article>
          ))}
        </div>
      ) : null}
      {review.drillRu ? <div className={styles.drill}>{review.drillRu}</div> : null}
    </section>
  );
}

function IntonationGuide({ text }: { text: string }) {
  const phrases = buildIntonationPhrases(text);

  if (!phrases.length) return null;

  return (
    <section className={styles.intonation} aria-label="Интонационная схема">
      <span className={styles.panelEyebrow}>Intonation guide</span>
      {phrases.map((phrase, index) => (
        <article key={`${phrase.raw}-${index}`}>
          <div className={styles.intonationLine}>
            {phrase.tokens.map((token, tokenIndex) => (
              <span className={cn(token.strong && styles.strong, tokenIndex === phrase.focusIndex && styles.focus)} key={`${token.text}-${tokenIndex}`}>
                {token.text}
              </span>
            ))}
            <strong className={styles.arrow}>{phrase.arrow}</strong>
          </div>
          <p>{phrase.tip}</p>
        </article>
      ))}
    </section>
  );
}

function buildIntonationPhrases(text: string) {
  const functionWords = new Set([
    "a",
    "an",
    "the",
    "to",
    "do",
    "does",
    "don't",
    "doesn't",
    "i",
    "you",
    "we",
    "they",
    "he",
    "she",
    "it",
    "in",
    "on",
    "at",
    "of",
    "for",
    "with",
    "and",
    "but",
    "or"
  ]);

  return (
    text
      .match(/[^.!?]+[.!?]?/g)
      ?.map((rawPhrase) => {
        const raw = rawPhrase.trim();
        const words = raw.match(/[A-Za-z']+|[.,!?;]/g) ?? [];
        const wordIndexes = words
          .map((word, index) => ({ word, index }))
          .filter(({ word }) => /[A-Za-z']/.test(word));
        const focusIndex =
          [...wordIndexes]
            .reverse()
            .find(({ word }) => !functionWords.has(word.toLowerCase().replace(/[^\w']/g, "")))?.index ??
          wordIndexes[wordIndexes.length - 1]?.index ??
          -1;
        const isQuestion = raw.endsWith("?");
        const isListPause = raw.endsWith(",");
        const direction = isQuestion ? "rise" : isListPause ? "hold" : "fall";

        return {
          raw,
          arrow: direction === "rise" ? "↗" : direction === "hold" ? "→" : "↘",
          focusIndex,
          tip:
            direction === "rise"
              ? "Вопрос через do/does: чуть подними голос на последнем смысловом слове."
              : direction === "hold"
                ? "Это не конец мысли: оставь фразу открытой."
                : "Утверждение или отрицание: мягко опусти голос в конце.",
          tokens: words.map((word) => {
            const normalized = word.toLowerCase().replace(/[^\w']/g, "");
            const isWord = /[A-Za-z']/.test(word);
            return {
              text: word,
              strong: isWord && !functionWords.has(normalized)
            };
          })
        };
      })
      .filter((phrase) => phrase.raw.length) ?? []
  );
}
