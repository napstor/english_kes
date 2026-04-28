"use client";

import {
  BookOpen,
  Languages,
  MessageCircle,
  Shield,
  LogOut,
  Users,
  Volume2
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AuthLoadingScreen, AuthShell } from "@/components/auth";
import { CourseMap, ReviewDashboard, TodayDashboard, TutorChat } from "@/components/dashboard";
import { AppShell, BottomTabs, Sidebar, TopBar } from "@/components/layout";
import { CourseDrawer, StepRail, type NavigationStep } from "@/components/navigation";
import {
  CompositionStep as CompositionStepView,
  DrillStep as DrillStepView,
  SpeakingStep as SpeakingStepView,
  TheoryStep as TheoryStepView,
  TranslateStep as TranslateStepView,
  VocabularyStep as VocabularyStepView
} from "@/components/steps";
import { IconButton } from "@/components/ui";
import { lessonOne, uiCopy, type Locale, type TrainingStep } from "@/lib/course";
import { mockCourseLessons, mockReviewPatterns, mockStreakDays } from "@/lib/mockData";
import { compareAnswer, detectGrammarHint, type GrammarHint } from "@/lib/scoring";

type AppView = "today" | "course" | "review" | "lesson";

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
  audioUrl: string;
  pronunciation: PronunciationReview | null;
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

type CompositionFeedback = {
  verdict: "ready" | "needs_revision";
  score: number;
  summaryRu: string;
  theoryRu: string;
  issues: Array<{
    line: number;
    focusRu: string;
    questionRu: string;
    hintRu: string;
    severity: "fix" | "polish";
  }>;
  nextActionRu: string;
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

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeProgress(value: Partial<ProgressState> | null | undefined): ProgressState {
  const lastStepIndex = Math.max(lessonOne.steps.length - 1, 0);
  const activeStep =
    typeof value?.activeStep === "number" && Number.isFinite(value.activeStep)
      ? Math.min(Math.max(Math.trunc(value.activeStep), 0), lastStepIndex)
      : 0;
  const completedSteps = Array.isArray(value?.completedSteps)
    ? Array.from(
        new Set(
          value.completedSteps
            .map((step) => (typeof step === "number" && Number.isFinite(step) ? Math.trunc(step) : -1))
            .filter((step) => step >= 0 && step <= lastStepIndex)
        )
      ).sort((a, b) => a - b)
    : [];
  const attempts =
    value?.attempts && typeof value.attempts === "object" && !Array.isArray(value.attempts) ? value.attempts : {};
  const score = typeof value?.score === "number" && Number.isFinite(value.score)
    ? Math.min(Math.max(Math.trunc(value.score), 0), 100)
    : 0;

  return {
    activeStep,
    completedSteps,
    attempts,
    score
  };
}

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
  const [compositionLines, setCompositionLines] = useState<string[]>(() => Array.from({ length: 10 }, () => ""));
  const [compositionFeedback, setCompositionFeedback] = useState<CompositionFeedback | null>(null);
  const [compositionLoading, setCompositionLoading] = useState(false);
  const [compositionError, setCompositionError] = useState("");
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>("today");
  const timerRef = useRef<number | null>(null);
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const activeStepIndex = Math.min(Math.max(progress.activeStep, 0), lessonOne.steps.length - 1);
  const current = lessonOne.steps[activeStepIndex] ?? lessonOne.steps[0];
  const currentCompositionMin = current.composition?.minSentences ?? 10;
  const copy = uiCopy[locale];
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0] ?? defaultProfile;

  useEffect(() => {
    const parsedProfiles = safeParseJson<LocalProfile[]>(window.localStorage.getItem(profilesKey));
    const storedProfiles =
      Array.isArray(parsedProfiles) && parsedProfiles.length
        ? parsedProfiles.filter((profile) => profile?.id && profile?.name)
        : [];
    const usableProfiles = storedProfiles.length ? storedProfiles : [defaultProfile];
    const savedActiveProfileId = window.localStorage.getItem(activeProfileKey) ?? usableProfiles[0].id;
    const nextActiveProfileId = usableProfiles.some((profile) => profile.id === savedActiveProfileId)
      ? savedActiveProfileId
      : usableProfiles[0].id;

    setProfiles(usableProfiles);
    setActiveProfileId(nextActiveProfileId);

    const saved = window.localStorage.getItem(progressKey(nextActiveProfileId));
    if (saved) {
      setProgress(normalizeProgress(safeParseJson<ProgressState>(saved)));
    }

    void loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(profilesKey, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    window.localStorage.setItem(activeProfileKey, activeProfileId);
    const nextProgress = normalizeProgress(progress);
    window.localStorage.setItem(progressKey(activeProfileId), JSON.stringify(nextProgress));
    if (authUser && remoteProgressReady) {
      void saveRemoteProgress(nextProgress);
    }
  }, [activeProfileId, authUser, progress, remoteProgressReady]);

  useEffect(() => {
    setProgress((prev) => {
      const nextProgress = normalizeProgress(prev);
      return nextProgress.activeStep === prev.activeStep &&
        nextProgress.score === prev.score &&
        nextProgress.completedSteps.length === prev.completedSteps.length
        ? prev
        : nextProgress;
    });
  }, []);

  useEffect(() => {
    setAnswer("");
    setChecked(null);
    setCoachFeedback(null);
    setCoachLoading(false);
    setCoachError("");
    setCompositionLines(Array.from({ length: currentCompositionMin }, () => ""));
    setCompositionFeedback(null);
    setCompositionLoading(false);
    setCompositionError("");
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
  }, [currentCompositionMin, progress.activeStep]);

  const lessonSteps: NavigationStep[] = lessonOne.steps.map((step, index) => ({
    id: step.id,
    index,
    type: step.type,
    title: step.label[locale],
    typeLabel: copy.stepTypes[step.type],
    completed: progress.completedSteps.includes(index)
  }));
  const nearbySteps = getNearbySteps(lessonSteps, current.id);

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
    setProgress(normalizeProgress(remoteProgress ?? safeParseJson<ProgressState>(saved)));
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
      const stepIndex = Math.min(Math.max(prev.activeStep, 0), lessonOne.steps.length - 1);
      const completedSteps = prev.completedSteps.includes(stepIndex)
        ? prev.completedSteps
        : [...prev.completedSteps, stepIndex];
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

  function navigateToStep(stepId: string) {
    const stepIndex = lessonOne.steps.findIndex((step) => step.id === stepId);
    if (stepIndex < 0) return;
    setCurrentView("lesson");
    setProgress((prev) => ({ ...prev, activeStep: stepIndex }));
  }

  function navigateToLesson(lessonId: string) {
    if (lessonId === lessonOne.id) {
      setCurrentView("lesson");
    }
  }

  function navigateToView(view: "today" | "course" | "review" | "profile") {
    if (view === "profile") return;
    setCurrentView(view);
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

  async function checkComposition(step: TrainingStep) {
    const filledLines = compositionLines.map((line) => line.trim()).filter(Boolean);
    const minSentences = step.composition?.minSentences ?? 10;

    setCompositionFeedback(null);
    setCompositionError("");

    if (filledLines.length < minSentences) {
      setCompositionError(copy.compositionEnough);
      return;
    }

    setCompositionLoading(true);

    try {
      const response = await fetch("/api/coach/composition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          lessonTitle: lessonOne.title.ru,
          model: step.composition?.model.ru ?? step.targetText,
          sentences: filledLines,
          vocabulary: lessonOne.steps.filter((item) => item.type === "vocabulary").flatMap((item) => item.notes.ru)
        })
      });
      const result = (await response.json()) as CompositionFeedback & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || copy.coachFailed);
      }

      setCompositionFeedback(result);
      if (result.verdict === "ready" || result.score >= 80) {
        markComplete(4);
      }
    } catch (error) {
      setCompositionError(error instanceof Error ? error.message : copy.coachFailed);
    } finally {
      setCompositionLoading(false);
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
      const audioUrl = result?.audioUrl ?? "";
      const pronunciation = result?.pronunciation ?? null;

      if (transcript) {
        setSpeechReview({
          transcript,
          result: compareAnswer(transcript, [current.targetText]),
          error: "",
          audioUrl,
          pronunciation
        });
      } else if (transcriptionError) {
        setSpeechReview({
          transcript: "",
          result: null,
          error: transcriptionError,
          audioUrl,
          pronunciation
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

  async function playUserRecording(audioUrl: string) {
    nativeAudioRef.current?.pause();
    const audio = new Audio(audioUrl);
    nativeAudioRef.current = audio;
    await audio.play();
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
    window.localStorage.setItem(progressKey(activeProfileId), JSON.stringify(normalizeProgress(progress)));
    const saved = window.localStorage.getItem(progressKey(profileId));
    setActiveProfileId(profileId);
    setProgress(normalizeProgress(safeParseJson<ProgressState>(saved)));
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
    return <AuthLoadingScreen />;
  }

  if (!authUser) {
    return <AuthShell error={authError} onSubmit={login} />;
  }

  return (
    <>
      <AppShell
        topBar={
          <TopBar
            brandMeta={copy.productRole}
            breadcrumb={`${copy.lessonLabel} 1 / 44 · ${lessonOne.title[locale]}`}
            actions={
              <>
                <IconButton ariaLabel={copy.book} icon={BookOpen} onClick={() => setDrawerOpen(true)} />
                <IconButton ariaLabel="AI Tutor" icon={MessageCircle} onClick={() => setTutorOpen(true)} />
                <div className="user-pill">
                  <Shield size={17} />
                  <span>{authUser.username}</span>
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
                {authUser.role === "admin" ? (
                  <details className="utility-menu">
                    <summary className="icon-button" aria-label={copy.more}>
                      <Users size={18} />
                    </summary>
                    <div className="utility-popover">
                      <AdminPanel copy={copy} />
                    </div>
                  </details>
                ) : null}
              </>
            }
          />
        }
        sidebar={<Sidebar activeKey={currentView === "lesson" ? "course" : currentView} onItemClick={navigateToView} />}
        bottomTabs={<BottomTabs activeKey={currentView === "lesson" ? "course" : currentView} onTabClick={navigateToView} />}
      >
        {currentView === "today" ? (
          <TodayDashboard
            userName={authUser.username}
            streakDays={mockStreakDays}
            onContinue={() => setCurrentView("lesson")}
            onCourse={() => setCurrentView("course")}
            onReview={() => setCurrentView("review")}
          />
        ) : null}

        {currentView === "course" ? (
          <CourseMap
            steps={lessonSteps}
            lessons={mockCourseLessons}
            progress={progress}
            onLessonClick={navigateToLesson}
            onStepClick={navigateToStep}
          />
        ) : null}

        {currentView === "review" ? <ReviewDashboard patterns={mockReviewPatterns} onPlay={(text) => playVocabularyAudio(text)} /> : null}

        {currentView === "lesson" ? (
          <>
            <article className="exercise-card" id="today">
              {current.type === "translate" || current.type === "speaking" ? (
                <>
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
                </>
              ) : null}

              {current.type === "theory" ? (
                <TheoryStepView
                  step={current}
                  locale={locale}
                  onComplete={() => {
                    markComplete(2);
                    goNext();
                  }}
                />
              ) : null}

              {current.type === "vocabulary" ? (
                <VocabularyStepView
                  step={current}
                  locale={locale}
                  onPlay={(text) => playVocabularyAudio(text)}
                  onComplete={() => {
                    markComplete(2);
                    goNext();
                  }}
                />
              ) : null}

              {current.type === "translate" ? (
                <TranslateStepView
                  step={current}
                  answer={answer}
                  checked={checked}
                  coachError={coachError}
                  coachFeedback={coachFeedback}
                  coachLoading={coachLoading}
                  attemptCount={progress.attempts[current.id] ?? 0}
                  onAnswer={setAnswer}
                  onCheck={() => void checkAnswer(current)}
                  onComplete={() => {
                    markComplete(2);
                    goNext();
                  }}
                />
              ) : null}

              {current.type === "drill" ? (
                <DrillStepView
                  step={current}
                  answer={answer}
                  checked={checked}
                  attemptCount={progress.attempts[current.id] ?? 0}
                  coachError={coachError}
                  coachFeedback={coachFeedback}
                  coachLoading={coachLoading}
                  onAnswer={setAnswer}
                  onCheck={() => void checkAnswer(current)}
                  onComplete={() => {
                    markComplete(2);
                    goNext();
                  }}
                />
              ) : null}

              {current.type === "composition" ? (
                <CompositionStepView
                  step={current}
                  locale={locale}
                  feedback={compositionFeedback}
                  lines={compositionLines}
                  loading={compositionLoading}
                  error={compositionError}
                  onLinesChange={setCompositionLines}
                  onCheck={() => void checkComposition(current)}
                  onComplete={() => {
                    markComplete(4);
                    goNext();
                  }}
                />
              ) : null}

              {current.type === "speaking" ? (
                <SpeakingStepView
                  step={current}
                  elapsed={elapsed}
                  recorded={recorded}
                  recordingMessage={recordingMessage}
                  recordingStatus={recordingStatus}
                  recording={recording}
                  speechReview={speechReview}
                  nativeAudio={nativeAudio}
                  onStart={startRecording}
                  onStop={stopRecording}
                  onPlayNative={(mode) => playNativeSample(current.targetText, mode)}
                  onPlayRecording={(audioUrl) => void playUserRecording(audioUrl)}
                  onComplete={() => {
                    markComplete(3);
                    goNext();
                  }}
                />
              ) : null}
            </article>
            <StepRail steps={nearbySteps} currentStepId={current.id} onStepClick={navigateToStep} onCourseClick={() => setDrawerOpen(true)} />
          </>
        ) : null}
      </AppShell>
      <CourseDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        steps={lessonSteps}
        currentStepId={current.id}
        onStepClick={navigateToStep}
        lessonTitle={`${copy.lessonLabel} 1 / 44`}
      />
      <TutorChat isOpen={tutorOpen} onClose={() => setTutorOpen(false)} />
    </>
  );
}

function parseJsonResponse(value: string): {
  url?: string;
  audioUrl?: string;
  error?: string;
  transcription?: {
    text?: string;
    error?: string;
  };
  pronunciation?: PronunciationReview;
} | null {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value) as { url?: string; error?: string };
  } catch {
    return null;
  }
}

function getNearbySteps(steps: NavigationStep[], currentStepId: string) {
  const currentIndex = Math.max(
    steps.findIndex((step) => step.id === currentStepId),
    0
  );
  const start = Math.max(0, currentIndex - 1);
  const end = Math.min(steps.length, currentIndex + 5);
  return steps.slice(start, end);
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
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div className="admin-panel-icon">
          <Users size={18} />
        </div>
        <div>
          <h3>{copy.adminTitle}</h3>
          <p>{copy.adminSubtitle}</p>
        </div>
      </div>

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
        {users.slice(0, 8).map((user) => (
          <li key={user.id}>
            <span>{user.username}</span>
            <small>{user.role}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
