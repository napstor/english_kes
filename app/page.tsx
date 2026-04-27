"use client";

import {
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  Languages,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  LogOut,
  UserRoundPlus,
  Users,
  Volume2
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { lessonOne, uiCopy, type Locale, type TrainingStep } from "@/lib/course";
import { compareAnswer, detectGrammarHint, tokenize, type GrammarHint } from "@/lib/scoring";

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

type SpeechReview = {
  transcript: string;
  result: ReturnType<typeof compareAnswer> | null;
  error: string;
};

type CoachFeedback = {
  verdict: "correct" | "almost" | "incorrect";
  score: number;
  bestAnswer: string;
  shortRu: string;
  grammarMiniLessonRu?: string;
  issues: Array<{
    fragment: string;
    correction: string;
    reasonRu: string;
    grammarRu?: string;
    category: string;
  }>;
  drillRu: string;
};

function mergeCoachFeedbackWithHint(feedback: CoachFeedback, hint: GrammarHint | null): CoachFeedback {
  if (!hint) {
    return feedback;
  }

  const alreadyExplained = feedback.issues.some(
    (issue) => issue.fragment.toLowerCase() === hint.fragment.toLowerCase() && issue.category === hint.category
  );

  return {
    ...feedback,
    shortRu: hint.shortRu,
    grammarMiniLessonRu: hint.grammarRu,
    issues: alreadyExplained
      ? feedback.issues.map((issue, index) =>
          index === 0
            ? {
                ...issue,
                reasonRu: hint.shortRu,
                grammarRu: hint.grammarRu,
                category: hint.category
              }
            : issue
        )
      : [
          {
            fragment: hint.fragment,
            correction: hint.correction,
            reasonRu: hint.shortRu,
            grammarRu: hint.grammarRu,
            category: hint.category
          },
          ...feedback.issues
        ],
    drillRu:
      feedback.drillRu || `Повтори вслух: ${hint.correction}. Затем всю фразу целиком без окончания -s/-es после do/does.`
  };
}

type NativeAudioMode = "slow" | "normal";

type NativeAudioState = {
  status: "idle" | "loading" | "playing" | "ready" | "error";
  message: string;
  audioUrl: string;
  voiceName: string;
  cached: boolean;
};

type AuthUser = {
  id: number;
  username: string;
  role: "admin" | "student";
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

function createNativeAudioState(): NativeAudioState {
  return {
    status: "idle",
    message: "",
    audioUrl: "",
    voiceName: "",
    cached: false
  };
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [remoteProgressReady, setRemoteProgressReady] = useState(false);
  const [profiles, setProfiles] = useState<LocalProfile[]>([defaultProfile]);
  const [activeProfileId, setActiveProfileId] = useState(defaultProfile.id);
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<ReturnType<typeof compareAnswer> | null>(null);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "uploading" | "uploaded" | "error">("idle");
  const [recordingMessage, setRecordingMessage] = useState("");
  const [speechReview, setSpeechReview] = useState<SpeechReview | null>(null);
  const [nativeAudio, setNativeAudio] = useState<Record<NativeAudioMode, NativeAudioState>>({
    slow: createNativeAudioState(),
    normal: createNativeAudioState()
  });
  const timerRef = useRef<number | null>(null);
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
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

    void loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(profilesKey, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    window.localStorage.setItem(activeProfileKey, activeProfileId);
    window.localStorage.setItem(progressKey(activeProfileId), JSON.stringify(progress));
    if (authUser && remoteProgressReady) {
      void saveRemoteProgress(progress);
    }
  }, [activeProfileId, authUser, progress, remoteProgressReady]);

  useEffect(() => {
    setAnswer("");
    setChecked(null);
    setCoachFeedback(null);
    setCoachLoading(false);
    setCoachError("");
    setRecording(false);
    setRecorded(false);
    setElapsed(0);
    setRecordingStatus("idle");
    setRecordingMessage("");
    setSpeechReview(null);
    setNativeAudio({
      slow: createNativeAudioState(),
      normal: createNativeAudioState()
    });
    nativeAudioRef.current?.pause();
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

  async function loadSession() {
    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth/me");
      const result = (await response.json()) as { user?: AuthUser | null; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Could not load session.");
      }

      setAuthUser(result.user ?? null);
      if (result.user) {
        await activateUserProfile(result.user);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not load session.");
      setAuthUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function login(username: string, password: string) {
    setAuthError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
    const result = (await response.json()) as { user?: AuthUser; error?: string };

    if (!response.ok || !result.user) {
      throw new Error(result.error || "Login failed.");
    }

    setAuthUser(result.user);
    await activateUserProfile(result.user);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
  }

  async function activateUserProfile(user: AuthUser) {
    const profile = {
      id: `user-${user.id}`,
      name: user.username
    };
    setRemoteProgressReady(false);
    const saved = window.localStorage.getItem(progressKey(profile.id));
    setProfiles((prev) => {
      if (prev.some((item) => item.id === profile.id)) return prev;
      return [profile, ...prev.filter((item) => item.id !== defaultProfile.id)];
    });
    setActiveProfileId(profile.id);
    const remoteProgress = await loadRemoteProgress();
    setProgress(remoteProgress ?? (saved ? (JSON.parse(saved) as ProgressState) : initialProgress));
    setRemoteProgressReady(true);
  }

  async function loadRemoteProgress() {
    const response = await fetch(`/api/progress?lessonId=${encodeURIComponent(lessonOne.id)}`);
    if (!response.ok) return null;

    const result = (await response.json()) as { progress?: ProgressState | null };
    return result.progress ?? null;
  }

  async function saveRemoteProgress(nextProgress: ProgressState) {
    await fetch("/api/progress", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lessonId: lessonOne.id,
        ...nextProgress
      })
    });
  }

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

  async function checkAnswer(step: TrainingStep) {
    const result = compareAnswer(answer, step.acceptedAnswers);
    const grammarHint = detectGrammarHint(answer, step.acceptedAnswers);
    setChecked(result);
    setCoachFeedback(null);
    setCoachError("");
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

    if (result.status !== "exact") {
      await loadCoachFeedback(step, grammarHint);
    }
  }

  async function loadCoachFeedback(step: TrainingStep, grammarHint: GrammarHint | null) {
    setCoachLoading(true);

    try {
      const response = await fetch("/api/coach/check-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          promptRu: step.prompt.ru,
          userAnswer: answer,
          acceptedAnswers: step.acceptedAnswers,
          lessonTitle: lessonOne.title.ru,
          localHint: grammarHint
        })
      });
      const result = (await response.json()) as CoachFeedback & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || copy.coachFailed);
      }

      setCoachFeedback(mergeCoachFeedbackWithHint(result, grammarHint));
    } catch (error) {
      setCoachError(error instanceof Error ? error.message : copy.coachFailed);
    } finally {
      setCoachLoading(false);
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingStatus("error");
      setRecordingMessage(copy.microphoneUnsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        void uploadRecording(current.id, activeProfile.id);
      };

      recorder.start();
      setRecording(true);
      setRecorded(false);
      setRecordingStatus("idle");
      setRecordingMessage("");
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed((value) => value + 1);
      }, 1000);
    } catch {
      setRecordingStatus("error");
      setRecordingMessage(copy.microphoneDenied);
    }
  }

  function stopRecording() {
    setRecording(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }

  async function uploadRecording(stepId: string, profileId: string) {
    const type = recorderRef.current?.mimeType || "audio/webm";
    const audioBlob = new Blob(chunksRef.current, { type });
    if (!audioBlob.size) {
      setRecordingStatus("error");
      setRecordingMessage(copy.recordingEmpty);
      return;
    }

    setRecorded(true);
    setRecordingStatus("uploading");
    setRecordingMessage(copy.uploadingRecording);

    const formData = new FormData();
    formData.append("audio", audioBlob, `recording-${stepId}.webm`);
    formData.append("stepId", stepId);
    formData.append("profileId", profileId);
    formData.append("expectedText", current.targetText);

    try {
      const response = await fetch("/api/audio/upload", {
        method: "POST",
        body: formData
      });
      const responseText = await response.text();
      const result = parseJsonResponse(responseText);

      if (!response.ok) {
        throw new Error(result?.error || `${copy.uploadFailed} HTTP ${response.status}`);
      }

      const transcript = result?.transcription?.text?.trim() ?? "";
      const transcriptionError = result?.transcription?.error ?? "";

      if (transcript) {
        setSpeechReview({
          transcript,
          result: compareAnswer(transcript, [current.targetText]),
          error: ""
        });
      } else if (transcriptionError) {
        setSpeechReview({
          transcript: "",
          result: null,
          error: transcriptionError
        });
      }

      setRecordingStatus("uploaded");
      setRecordingMessage(transcript ? copy.transcriptionReady : copy.uploadedRecording);
      markComplete(3);
    } catch (error) {
      setRecordingStatus("error");
      setRecordingMessage(error instanceof Error ? error.message : copy.uploadFailed);
    }
  }

  async function playNativeSample(text: string, mode: NativeAudioMode) {
    const existing = nativeAudio[mode];

    if (existing.audioUrl) {
      await playAudioUrl(existing.audioUrl, mode);
      return;
    }

    setNativeAudioMode(mode, {
      status: "loading",
      message: copy.nativeAudioLoading,
      audioUrl: "",
      voiceName: "",
      cached: false
    });

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, mode })
      });
      const result = (await response.json()) as {
        audioUrl?: string;
        voiceName?: string;
        cached?: boolean;
        error?: string;
      };

      if (!response.ok || !result.audioUrl) {
        throw new Error(result.error || copy.nativeAudioFailed);
      }

      setNativeAudioMode(mode, {
        status: "ready",
        message: result.voiceName ? `${copy.nativeAudioVoice}: ${result.voiceName}` : copy.nativeAudioReady,
        audioUrl: result.audioUrl,
        voiceName: result.voiceName ?? "",
        cached: Boolean(result.cached)
      });
      await playAudioUrl(result.audioUrl, mode);
    } catch (error) {
      setNativeAudioMode(mode, {
        status: "error",
        message: error instanceof Error ? error.message : copy.nativeAudioFailed,
        audioUrl: "",
        voiceName: "",
        cached: false
      });
    }
  }

  async function playVocabularyAudio(text: string) {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, mode: "normal" })
      });
      const result = (await response.json()) as {
        audioUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.audioUrl) {
        throw new Error(result.error || copy.nativeAudioFailed);
      }

      nativeAudioRef.current?.pause();
      const audio = new Audio(result.audioUrl);
      nativeAudioRef.current = audio;
      await audio.play();
    } catch (error) {
      setNativeAudioMode("normal", {
        status: "error",
        message: error instanceof Error ? error.message : copy.nativeAudioFailed,
        audioUrl: "",
        voiceName: "",
        cached: false
      });
    }
  }

  async function playAudioUrl(audioUrl: string, mode: NativeAudioMode) {
    nativeAudioRef.current?.pause();
    const audio = new Audio(audioUrl);
    nativeAudioRef.current = audio;
    audio.onended = () => {
      patchNativeAudioMode(mode, { status: "ready" });
    };
    audio.onerror = () => {
      patchNativeAudioMode(mode, { status: "error", message: copy.nativeAudioFailed });
    };
    patchNativeAudioMode(mode, { status: "playing" });
    await audio.play();
  }

  function setNativeAudioMode(mode: NativeAudioMode, state: NativeAudioState) {
    setNativeAudio((prev) => ({
      ...prev,
      [mode]: state
    }));
  }

  function patchNativeAudioMode(mode: NativeAudioMode, state: Partial<NativeAudioState>) {
    setNativeAudio((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        ...state
      }
    }));
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

  if (authLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="brand-mark">K</div>
          <h1>{copy.loadingSession}</h1>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return <LoginScreen copy={copy} error={authError} onLogin={login} />;
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
            <div className="user-pill">
              <Shield size={17} />
              <span>{authUser.username}</span>
              <small>{authUser.role}</small>
            </div>
            <button
              className="segmented"
              type="button"
              onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
              aria-label={copy.switchLanguage}
            >
              <Languages size={17} />
              {locale.toUpperCase()}
            </button>
            <button className="icon-button" type="button" onClick={logout} aria-label={copy.logout}>
              <LogOut size={18} />
            </button>
            <details className="utility-menu">
              <summary className="icon-button" aria-label={copy.more}>
                <Users size={18} />
              </summary>
              <div className="utility-popover">
                {authUser.role === "admin" ? <AdminPanel copy={copy} /> : null}

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
              </div>
            </details>
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
              <button className="icon-button" type="button" onClick={() => playNativeSample(current.targetText, "normal")}>
                <Volume2 size={18} />
              </button>
            </div>

            <div className="prompt-block">
              <p className="eyebrow">{copy.task}</p>
              <h2>{current.prompt[locale]}</h2>
              {current.sourceText ? (
                <div className="source-text" lang="ru">
                  <span>{copy.sourcePhrase}</span>
                  <p>{current.sourceText}</p>
                </div>
              ) : null}
              {current.hint[locale] ? <p className="hint">{current.hint[locale]}</p> : null}
            </div>

            {current.type === "theory" || current.type === "vocabulary" ? (
              <TheoryStep
                step={current}
                locale={locale}
                onComplete={() => markComplete(2)}
                onSpeak={(text) => playVocabularyAudio(text)}
              />
            ) : null}

            {current.type === "translate" || current.type === "drill" ? (
              <WritingStep
                answer={answer}
                checked={checked}
                coachError={coachError}
                coachFeedback={coachFeedback}
                coachLoading={coachLoading}
                copy={copy}
                step={current}
                onAnswer={setAnswer}
                onCheck={() => void checkAnswer(current)}
              />
            ) : null}

            {current.type === "speaking" ? (
              <SpeakingStep
                copy={copy}
                elapsed={elapsed}
                recorded={recorded}
                recordingMessage={recordingMessage}
                recordingStatus={recordingStatus}
                recording={recording}
                speechReview={speechReview}
                nativeAudio={nativeAudio}
                step={current}
                onStart={startRecording}
                onStop={stopRecording}
                onPlayNative={(mode) => playNativeSample(current.targetText, mode)}
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

        </section>
      </section>
    </main>
  );
}

function parseJsonResponse(value: string): {
  url?: string;
  error?: string;
  transcription?: {
    text?: string;
    error?: string;
  };
} | null {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value) as { url?: string; error?: string };
  } catch {
    return null;
  }
}

function LoginScreen({
  copy,
  error,
  onLogin
}: {
  copy: (typeof uiCopy)[Locale];
  error: string;
  onLogin: (username: string, password: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(error);

  useEffect(() => {
    setLoginError(error);
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setLoginError("");

    try {
      await onLogin(username, password);
    } catch (loginError) {
      setLoginError(loginError instanceof Error ? loginError.message : copy.loginFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand">
          <div className="brand-mark">K</div>
          <div>
            <p>English KES</p>
            <span>{copy.productRole}</span>
          </div>
        </div>
        <div>
          <p className="eyebrow">{copy.authLabel}</p>
          <h1>{copy.loginTitle}</h1>
        </div>
        <label className="field-label">
          <span>{copy.username}</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        </label>
        <label className="field-label">
          <span>{copy.password}</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>
        {loginError ? <div className="auth-error">{loginError}</div> : null}
        <button className="primary-button wide" type="submit" disabled={submitting || !username.trim() || !password}>
          {submitting ? copy.signingIn : copy.signIn}
        </button>
      </form>
    </main>
  );
}

function AdminPanel({ copy }: { copy: (typeof uiCopy)[Locale] }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    const response = await fetch("/api/admin/users");
    const result = (await response.json()) as { users?: AuthUser[]; error?: string };
    if (response.ok) setUsers(result.users ?? []);
  }

  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, role: "student" })
      });
      const result = (await response.json()) as { user?: AuthUser; error?: string };

      if (!response.ok || !result.user) {
        throw new Error(result.error || copy.userCreateFailed);
      }

      setUsername("");
      setPassword("");
      setMessage(copy.userCreated);
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.userCreateFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="coach-card admin-card">
      <Users size={20} />
      <div>
        <h3>{copy.adminTitle}</h3>
        <form className="admin-form" onSubmit={createStudent}>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={copy.username} />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={copy.password}
            type="password"
          />
          <button className="primary-button wide" type="submit" disabled={loading || !username.trim() || password.length < 8}>
            {copy.createUser}
          </button>
        </form>
        {message ? <p className="admin-message">{message}</p> : null}
        <ul className="admin-users">
          {users.slice(0, 6).map((user) => (
            <li key={user.id}>
              <span>{user.username}</span>
              <small>{user.role}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TheoryStep({
  step,
  locale,
  onComplete,
  onSpeak
}: {
  step: TrainingStep;
  locale: Locale;
  onComplete: () => void;
  onSpeak: (text: string) => void;
}) {
  return (
    <div className="content-panel">
      <ul className="lesson-notes">
        {step.vocabulary
          ? step.vocabulary.map((item) => (
              <li className="vocab-row" key={`${item.ru}-${item.en}`}>
                <span>
                  <strong>{item.en}</strong>
                  <small>{item.ru}</small>
                </span>
                <button className="icon-button" type="button" onClick={() => onSpeak(item.en)}>
                  <Volume2 size={16} />
                </button>
              </li>
            ))
          : step.notes[locale].map((note) => <li key={note}>{note}</li>)}
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
  coachError,
  coachFeedback,
  coachLoading,
  copy,
  step,
  onAnswer,
  onCheck
}: {
  answer: string;
  checked: ReturnType<typeof compareAnswer> | null;
  coachError: string;
  coachFeedback: CoachFeedback | null;
  coachLoading: boolean;
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
      {coachLoading ? <div className="coach-feedback loading">{copy.coachLoading}</div> : null}
      {coachError ? <div className="coach-feedback error">{coachError}</div> : null}
      {coachFeedback ? <CoachFeedbackPanel feedback={coachFeedback} copy={copy} /> : null}
    </div>
  );
}

function CoachFeedbackPanel({ feedback, copy }: { feedback: CoachFeedback; copy: (typeof uiCopy)[Locale] }) {
  return (
    <div className={`coach-feedback ${feedback.verdict}`}>
      <div className="coach-feedback-head">
        <strong>{copy.coachTitle}</strong>
        <span>{feedback.score}/100</span>
      </div>
      <p>{feedback.shortRu}</p>
      {feedback.grammarMiniLessonRu ? (
        <div className="grammar-brief">
          <span>{copy.grammarBrief}</span>
          <p>{feedback.grammarMiniLessonRu}</p>
        </div>
      ) : null}
      <div className="best-answer">
        <span>{copy.bestAnswer}</span>
        <strong>{feedback.bestAnswer}</strong>
      </div>
      {feedback.issues.length ? (
        <div className="issue-list">
          {feedback.issues.map((issue, index) => (
            <div className="issue-card" key={`${issue.fragment}-${index}`}>
              <div>
                <span className="bad-fragment">{issue.fragment}</span>
                <span className="arrow">→</span>
                <span className="good-fragment">{issue.correction}</span>
              </div>
              <p>{issue.reasonRu}</p>
              {issue.grammarRu ? <p className="grammar-line">{issue.grammarRu}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
      <div className="drill-note">{feedback.drillRu}</div>
    </div>
  );
}

function SpeakingStep({
  copy,
  elapsed,
  recorded,
  recordingMessage,
  recordingStatus,
  recording,
  speechReview,
  nativeAudio,
  step,
  onStart,
  onStop,
  onPlayNative
}: {
  copy: (typeof uiCopy)[Locale];
  elapsed: number;
  recorded: boolean;
  recordingMessage: string;
  recordingStatus: "idle" | "uploading" | "uploaded" | "error";
  recording: boolean;
  speechReview: SpeechReview | null;
  nativeAudio: Record<NativeAudioMode, NativeAudioState>;
  step: TrainingStep;
  onStart: () => void;
  onStop: () => void;
  onPlayNative: (mode: NativeAudioMode) => void;
}) {
  const slowAudio = nativeAudio.slow;
  const normalAudio = nativeAudio.normal;
  const [referenceVisible, setReferenceVisible] = useState(false);

  useEffect(() => {
    setReferenceVisible(false);
  }, [step.id]);

  return (
    <div className="content-panel speaking-panel">
      <div className={referenceVisible ? "speech-target revealed" : "speech-target hidden"}>
        {referenceVisible ? (
          <p>{step.targetText}</p>
        ) : (
          <p>{copy.referenceHidden}</p>
        )}
        <button className="reference-toggle" type="button" onClick={() => setReferenceVisible((visible) => !visible)}>
          {referenceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          {referenceVisible ? copy.hideReference : copy.showReference}
        </button>
      </div>
      <div className={recording ? "wave active" : "wave"}>
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="record-row">
        <button
          className={recording ? "danger-button" : "record-button"}
          type="button"
          onClick={recording ? onStop : onStart}
          disabled={recordingStatus === "uploading"}
        >
          {recording ? <Pause size={18} /> : <Mic size={18} />}
          {recording ? copy.stopRecording : copy.startRecording}
        </button>
        <span>{elapsed}s</span>
      </div>
      {recorded ? (
        <div className={`feedback ${recordingStatus === "error" ? "wrong" : recordingStatus === "uploaded" ? "exact" : "partial"}`}>
          <strong>{copy.recordingSaved}</strong>
          <p>{recordingMessage || copy.recordingMvp}</p>
        </div>
      ) : null}
      {recordingStatus === "error" && !recorded ? (
        <div className="feedback wrong">
          <strong>{copy.recordingProblem}</strong>
          <p>{recordingMessage}</p>
        </div>
      ) : null}
      {speechReview?.transcript ? (
        <div className={`feedback ${speechReview.result?.status ?? "partial"}`}>
          <strong>{copy.transcriptTitle}</strong>
          <p className="transcript-text">{speechReview.transcript}</p>
          {speechReview.result ? (
            <>
              <p>{speechReview.result.message}</p>
              <div className="token-row">
                {tokenize(speechReview.transcript).map((token, index) => (
                  <span key={`${token}-${index}`} className={speechReview.result?.badTokens.includes(token) ? "bad" : "good"}>
                    {token}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      {speechReview?.error ? (
        <div className="feedback partial">
          <strong>{copy.transcriptProblem}</strong>
          <p>{speechReview.error}</p>
        </div>
      ) : null}
      {slowAudio.message || normalAudio.message ? (
        <div className="native-status-grid">
          {slowAudio.message ? (
            <div className={`mini-status ${slowAudio.status === "error" ? "error" : ""}`}>
              <strong>{copy.nativeAudioSlow}</strong>
              <span>{slowAudio.message}</span>
            </div>
          ) : null}
          {normalAudio.message ? (
            <div className={`mini-status ${normalAudio.status === "error" ? "error" : ""}`}>
              <strong>{copy.nativeAudioNormal}</strong>
              <span>{normalAudio.message}</span>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="native-actions">
        <button className="secondary-button wide" type="button" onClick={() => onPlayNative("slow")} disabled={slowAudio.status === "loading"}>
          <Play size={18} />
          {slowAudio.status === "loading"
            ? copy.nativeAudioLoadingShort
            : slowAudio.audioUrl
              ? copy.playNativeAgainSlow
              : copy.playNativeSlow}
        </button>
        <button className="secondary-button wide" type="button" onClick={() => onPlayNative("normal")} disabled={normalAudio.status === "loading"}>
          <Play size={18} />
          {normalAudio.status === "loading"
            ? copy.nativeAudioLoadingShort
            : normalAudio.audioUrl
              ? copy.playNativeAgainNormal
              : copy.playNativeNormal}
        </button>
      </div>
    </div>
  );
}
