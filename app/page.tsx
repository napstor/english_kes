"use client";

import {
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Languages,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  UserRoundPlus,
  Volume2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { lessonOne, uiCopy, type Locale, type TrainingStep } from "@/lib/course";
import { compareAnswer, tokenize } from "@/lib/scoring";

type ProgressState = {
  activeStep: number;
  completedSteps: number[];
  attempts: Record<string, number>;
  score: number;
};

type LocalProfile = {
  id: string;
  name: string;
};

const profilesKey = "english-kes-profiles-v1";
const activeProfileKey = "english-kes-active-profile-v1";
const defaultProfile: LocalProfile = {
  id: "profile-default",
  name: "Alex"
};

function progressKey(profileId: string) {
  return `english-kes-progress-v1:${profileId}`;
}

const initialProgress: ProgressState = {
  activeStep: 0,
  completedSteps: [],
  attempts: {},
  score: 0
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [profiles, setProfiles] = useState<LocalProfile[]>([defaultProfile]);
  const [activeProfileId, setActiveProfileId] = useState(defaultProfile.id);
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<ReturnType<typeof compareAnswer> | null>(null);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const current = lessonOne.steps[progress.activeStep];
  const copy = uiCopy[locale];
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0] ?? defaultProfile;

  useEffect(() => {
    const savedProfiles = window.localStorage.getItem(profilesKey);
    const parsedProfiles = savedProfiles ? (JSON.parse(savedProfiles) as LocalProfile[]) : [defaultProfile];
    const usableProfiles = parsedProfiles.length ? parsedProfiles : [defaultProfile];
    const savedActiveProfileId = window.localStorage.getItem(activeProfileKey) ?? usableProfiles[0].id;
    const nextActiveProfileId = usableProfiles.some((profile) => profile.id === savedActiveProfileId)
      ? savedActiveProfileId
      : usableProfiles[0].id;

    setProfiles(usableProfiles);
    setActiveProfileId(nextActiveProfileId);

    const saved = window.localStorage.getItem(progressKey(nextActiveProfileId));
    if (saved) {
      setProgress(JSON.parse(saved) as ProgressState);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(profilesKey, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    window.localStorage.setItem(activeProfileKey, activeProfileId);
    window.localStorage.setItem(progressKey(activeProfileId), JSON.stringify(progress));
  }, [activeProfileId, progress]);

  useEffect(() => {
    setAnswer("");
    setChecked(null);
    setRecording(false);
    setRecorded(false);
    setElapsed(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, [progress.activeStep]);

  const completedCount = progress.completedSteps.length;
  const completion = Math.round((completedCount / lessonOne.steps.length) * 100);
  const weakSteps = useMemo(
    () =>
      lessonOne.steps
        .filter((step) => (progress.attempts[step.id] ?? 0) > 1)
        .slice(0, 4),
    [progress.attempts]
  );

  function markComplete(extraScore = 1) {
    setProgress((prev) => {
      const completedSteps = prev.completedSteps.includes(progress.activeStep)
        ? prev.completedSteps
        : [...prev.completedSteps, progress.activeStep];
      return {
        ...prev,
        completedSteps,
        score: Math.min(100, prev.score + extraScore)
      };
    });
  }

  function goNext() {
    setProgress((prev) => ({
      ...prev,
      activeStep: Math.min(prev.activeStep + 1, lessonOne.steps.length - 1)
    }));
  }

  function checkAnswer(step: TrainingStep) {
    const result = compareAnswer(answer, step.acceptedAnswers);
    setChecked(result);
    setProgress((prev) => ({
      ...prev,
      attempts: {
        ...prev.attempts,
        [step.id]: (prev.attempts[step.id] ?? 0) + 1
      }
    }));
    if (result.status !== "wrong") {
      markComplete(result.status === "exact" ? 4 : 2);
    }
  }

  function startRecording() {
    setRecording(true);
    setRecorded(false);
    setElapsed(0);
    timerRef.current = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
  }

  function stopRecording() {
    setRecording(false);
    setRecorded(true);
    if (timerRef.current) window.clearInterval(timerRef.current);
    markComplete(3);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }

  function switchProfile(profileId: string) {
    window.localStorage.setItem(progressKey(activeProfileId), JSON.stringify(progress));
    const saved = window.localStorage.getItem(progressKey(profileId));
    setActiveProfileId(profileId);
    setProgress(saved ? (JSON.parse(saved) as ProgressState) : initialProgress);
  }

  function addProfile() {
    const profileName = window.prompt(copy.newProfilePrompt);
    if (!profileName?.trim()) return;
    const profile = {
      id: `profile-${Date.now()}`,
      name: profileName.trim().slice(0, 28)
    };
    setProfiles((prev) => [...prev, profile]);
    setActiveProfileId(profile.id);
    setProgress(initialProgress);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">K</div>
          <div>
            <p>English KES</p>
            <span>{copy.productRole}</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <a className="active" href="#today">
            <Target size={18} /> {copy.today}
          </a>
          <a href="#book">
            <BookOpen size={18} /> {copy.book}
          </a>
          <a href="#review">
            <RotateCcw size={18} /> {copy.review}
          </a>
        </nav>

        <section className="stat-card">
          <span>{copy.bookProgress}</span>
          <strong>{completion}%</strong>
          <div className="meter">
            <div style={{ width: `${completion}%` }} />
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{copy.lessonLabel} 1 / 44</p>
            <h1>{lessonOne.title[locale]}</h1>
          </div>
          <div className="top-actions">
            <label className="profile-picker">
              <span>{copy.activeProfile}</span>
              <select value={activeProfile.id} onChange={(event) => switchProfile(event.target.value)}>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="icon-button" type="button" onClick={addProfile} aria-label={copy.addProfile}>
              <UserRoundPlus size={18} />
            </button>
            <button
              className="segmented"
              type="button"
              onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
              aria-label={copy.switchLanguage}
            >
              <Languages size={17} />
              {locale.toUpperCase()}
            </button>
          </div>
        </header>

        <section className="lesson-grid">
          <div className="lesson-map" id="book">
            <div className="map-head">
              <span>{copy.trainingPath}</span>
              <strong>
                {completedCount}/{lessonOne.steps.length}
              </strong>
            </div>
            <div className="step-list">
              {lessonOne.steps.map((step, index) => (
                <button
                  key={step.id}
                  className={[
                    "step-node",
                    index === progress.activeStep ? "current" : "",
                    progress.completedSteps.includes(index) ? "done" : ""
                  ].join(" ")}
                  type="button"
                  onClick={() => setProgress((prev) => ({ ...prev, activeStep: index }))}
                >
                  <span>{progress.completedSteps.includes(index) ? <Check size={16} /> : index + 1}</span>
                  <div>
                    <strong>{step.label[locale]}</strong>
                    <small>{copy.stepTypes[step.type]}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <article className="exercise-card" id="today">
            <div className="exercise-top">
              <span className={`type-pill ${current.type}`}>{copy.stepTypes[current.type]}</span>
              <button className="icon-button" type="button" onClick={() => speak(current.targetText)}>
                <Volume2 size={18} />
              </button>
            </div>

            <div className="prompt-block">
              <p className="eyebrow">{copy.task}</p>
              <h2>{current.prompt[locale]}</h2>
              {current.hint[locale] ? <p className="hint">{current.hint[locale]}</p> : null}
            </div>

            {current.type === "theory" || current.type === "vocabulary" ? (
              <TheoryStep step={current} locale={locale} onComplete={() => markComplete(2)} />
            ) : null}

            {current.type === "translate" || current.type === "drill" ? (
              <WritingStep
                answer={answer}
                checked={checked}
                copy={copy}
                step={current}
                onAnswer={setAnswer}
                onCheck={() => checkAnswer(current)}
              />
            ) : null}

            {current.type === "speaking" ? (
              <SpeakingStep
                copy={copy}
                elapsed={elapsed}
                recorded={recorded}
                recording={recording}
                step={current}
                onStart={startRecording}
                onStop={stopRecording}
              />
            ) : null}

            <div className="footer-actions">
              <button className="secondary-button" type="button" onClick={() => setChecked(null)}>
                {copy.retry}
              </button>
              <button className="primary-button" type="button" onClick={goNext}>
                {progress.activeStep === lessonOne.steps.length - 1 ? copy.finish : copy.next}
                <ChevronRight size={18} />
              </button>
            </div>
          </article>

          <aside className="coach-panel">
            <section className="coach-card">
              <UserRoundPlus size={20} />
              <div>
                <h3>{copy.localProfilesTitle}</h3>
                <p>{copy.localProfilesBody}</p>
              </div>
            </section>

            <section className="coach-card">
              <Sparkles size={20} />
              <div>
                <h3>{copy.methodTitle}</h3>
                <p>{copy.methodBody}</p>
              </div>
            </section>

            <section className="coach-card" id="review">
              <CircleAlert size={20} />
              <div>
                <h3>{copy.reviewTitle}</h3>
                {weakSteps.length ? (
                  <ul className="weak-list">
                    {weakSteps.map((step) => (
                      <li key={step.id}>{step.label[locale]}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{copy.noWeakSteps}</p>
                )}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function TheoryStep({
  step,
  locale,
  onComplete
}: {
  step: TrainingStep;
  locale: Locale;
  onComplete: () => void;
}) {
  return (
    <div className="content-panel">
      <ul className="lesson-notes">
        {step.notes[locale].map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <button className="primary-button wide" type="button" onClick={onComplete}>
        <Check size={18} /> {uiCopy[locale].understood}
      </button>
    </div>
  );
}

function WritingStep({
  answer,
  checked,
  copy,
  step,
  onAnswer,
  onCheck
}: {
  answer: string;
  checked: ReturnType<typeof compareAnswer> | null;
  copy: (typeof uiCopy)[Locale];
  step: TrainingStep;
  onAnswer: (value: string) => void;
  onCheck: () => void;
}) {
  const answerTokens = tokenize(answer);
  return (
    <div className="content-panel">
      <textarea
        value={answer}
        onChange={(event) => onAnswer(event.target.value)}
        placeholder={copy.answerPlaceholder}
        rows={4}
      />
      <button className="primary-button wide" type="button" onClick={onCheck} disabled={!answer.trim()}>
        {copy.check}
      </button>

      {checked ? (
        <div className={`feedback ${checked.status}`}>
          <strong>{copy.feedback[checked.status]}</strong>
          <p>{checked.message}</p>
          <div className="token-row">
            {answerTokens.map((token, index) => (
              <span key={`${token}-${index}`} className={checked.badTokens.includes(token) ? "bad" : "good"}>
                {token}
              </span>
            ))}
          </div>
          <p className="expected">{step.acceptedAnswers[0]}</p>
        </div>
      ) : null}
    </div>
  );
}

function SpeakingStep({
  copy,
  elapsed,
  recorded,
  recording,
  step,
  onStart,
  onStop
}: {
  copy: (typeof uiCopy)[Locale];
  elapsed: number;
  recorded: boolean;
  recording: boolean;
  step: TrainingStep;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="content-panel speaking-panel">
      <div className="speech-target">{step.targetText}</div>
      <div className={recording ? "wave active" : "wave"}>
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="record-row">
        <button className={recording ? "danger-button" : "record-button"} type="button" onClick={recording ? onStop : onStart}>
          {recording ? <Pause size={18} /> : <Mic size={18} />}
          {recording ? copy.stopRecording : copy.startRecording}
        </button>
        <span>{elapsed}s</span>
      </div>
      {recorded ? (
        <div className="feedback partial">
          <strong>{copy.recordingSaved}</strong>
          <p>{copy.recordingMvp}</p>
        </div>
      ) : null}
      <button className="secondary-button wide" type="button">
        <Play size={18} /> {copy.playNative}
      </button>
    </div>
  );
}
