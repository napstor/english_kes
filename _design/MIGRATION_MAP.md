# Migration Map · old → new

> Соответствие классов и компонентов из старого `app/page.tsx` + `app/globals.css` → новой системе.
> Используй параллельно с **README_DESIGN.md**.
> Всё, что помечено **«REMOVE»**, не переименовывается — выбрасывается.

---

## 1. Layout shell

| Old (CSS class / pattern)        | New (component)                          | Notes                                            |
|----------------------------------|------------------------------------------|--------------------------------------------------|
| `.app-shell`                     | `<AppShell>`                             | grid: 56px topbar / 1fr main                     |
| `.topbar`, `.app-header` (~120px) | `<TopBar>` (56px)                        | **Высота уменьшена в 2 раза.** Логотип 14px      |
| `.brand-mark` (с emoji 🎯)       | `<BrandMark variant="default">`          | **REMOVE** старый emoji-маркер. Composite KES + English |
| `.brand-mark--auth`              | `<BrandMark variant="auth-hero">`        | для AuthShell                                    |
| `.sidebar` (220px wide)          | `<Sidebar collapsed?>`                   | 56 collapsed / 220 expanded. Toggle persists в localStorage |
| `.sidebar .stat-card`            | **REMOVE**                               | Прогресс/streak теперь в `<TopBar>` inline       |
| `.bottom-tabs` (mobile)          | `<BottomTabs>`                           | 4 max: Today / Course / Review / Profile        |
| `.app-main`, `.workspace`        | `<Main>` + `<StepCanvas>`                | Padding из tokens, не hard-coded                |
| `.crumbs`, `.breadcrumbs`        | `<Crumbs>`                               | mono 11px uppercase, единая часть TopBar         |

---

## 2. Lesson navigation

| Old                              | New                                      | Notes                                            |
|----------------------------------|------------------------------------------|--------------------------------------------------|
| `.lesson-grid` (2-col)           | **REMOVE**                               | Workspace теперь одноколоночный                  |
| `.lesson-map` (sticky sidebar 74 шага) | `<StepRail>` + `<CourseDrawer>`     | StepRail = 5–7 ближайших шагов сверху. CourseDrawer = выезжающий sheet с полным списком |
| `.lesson-map .step-item`         | `<StepRail.Step>`                        | роль `tab` · `aria-current="step"` на active     |
| `.lesson-map .step-item.locked`  | `<StepRail.Step locked>`                 | aria-disabled, opacity .35                       |
| `.lesson-map-header`             | в `<CourseDrawer>` header                | "Lesson 1 of 44 · 9 шагов"                       |
| `.huge-phrase` (150px)           | display-h1 token (38–42px)               | **Шрифт уменьшен в 4 раза.**                     |
| `.lesson-meta`                   | `<Eyebrow>` + `<TypeChip>` + duration    | inline composition, не отдельный component       |

---

## 3. Step-type panels

| Old                              | New                                      | Notes                                            |
|----------------------------------|------------------------------------------|--------------------------------------------------|
| `.theory-step`, inline theory cards | `<TheoryStep>`                        | accordion-сборка с aria-expanded                |
| `.vocab-list`, vocab cards       | `<VocabularyStep>` + `<VocabRow>`        | list-view (не cards grid)                        |
| `.translate-step`, big input     | `<TranslateStep>`                        | state machine: idle / wrong-1/2/3 / reveal / correct |
| `.translate-input`               | `<TranslateField>`                       | hint-line внизу, AI-card под input               |
| `.composition-step`, lines list  | `<CompositionStep>` + `<CompositionLine>` | multi-line с Sokratic 1/3 questions            |
| `.drill-step`, fast cards        | `<DrillStep>`                            | streak counter mono, без emoji 🔥                |
| `.speaking-step`, mic block      | `<SpeakingStep>` + `<RecordingConsole>`  | split: console (left) + scoring (right)          |
| `.mic-button` (small inline)     | `<MicButton size="lg">`                  | Большая, в lower-third на mobile                 |
| `.audio-waveform`                | `<WaveformIndicator>`                    | CSS-only, breathing animation на idle           |
| `.score-display`, дробь "73/100" | `<ScoreBadge variant>`                   | `low / mid / high` цвета через tokens            |
| `.intonation-line` SVG inline    | `<IntonationGuide>`                      | стрелки ↑ ↓ • / под фразой, mobile wrap         |
| `.tutor-chat-popup` (modal)      | `<TutorChat sheet>`                      | side-sheet 480px desktop / bottom-sheet mobile  |

---

## 4. Admin

| Old                              | New                                      | Notes                                            |
|----------------------------------|------------------------------------------|--------------------------------------------------|
| `/admin` route + `.admin-panel`  | `<AdminSheet>` через `?admin=lessons`    | Не отдельный route, а query-driven overlay      |
| `.admin-tabs`                    | `<AdminSheet.Tabs>`                      | Lessons / Users / Logs                           |
| `.admin-form`                    | `<AdminForm>`                            | Использует `<TextField>` primitives             |
| `.admin-users-table`             | `<AdminUsersList>`                       | row-based, не table; avatar + email + role-chip |
| Старая `.role-chip` (если была)  | `<RoleChip role="owner|tutor|student">`  | tone из tokens                                   |

OWNER-only — gate в `<TopBar>` через `session.role === 'OWNER'`.

---

## 5. Primitives

| Old (ad-hoc styles)              | New (component)                          | Notes                                            |
|----------------------------------|------------------------------------------|--------------------------------------------------|
| `.btn`, `.btn-primary` etc.      | `<Button variant>`                       | size + iconLeft/iconRight + kbd-chip props      |
| `.icon-btn`, `.btn-icon`         | `<IconButton ariaLabel icon>`            | aria-label required prop в TS                    |
| `.input`, `.text-field`          | `<TextField label hint error multiline>` | composite — eyebrow + input + helper            |
| `.label-mono`, `.eyebrow`        | `<Eyebrow tone>`                         | default / indigo / lime / amber / negative      |
| `.chip`, `.tag`, type-coded      | `<TypeChip type>`                        | CTX / THR / RCG / TRN / DRL / SPK + цвет         |
| `.pill`, `.level-pill`           | `<Pill>`                                 | generic                                          |
| `.callout`, `.alert`             | `<Callout tone>`                         | info / warn / error / ok inline                  |
| `.kbd-chip`, `<kbd>`             | внутри `<Button kbd="⌘ S">`              | как prop, не отдельный компонент                 |
| Emoji icons (🎯 🔥 ⚡ 📚 🎤)        | **REMOVE** все emoji                     | заменить на `lucide-react` icons                 |

---

## 6. Today / Course Map / Review

| Old                              | New                                      | Notes                                            |
|----------------------------------|------------------------------------------|--------------------------------------------------|
| (нет — главная была lesson)      | `/today` page                            | greeting → recap → plan → mastery → stages       |
| `.streak-display` с emoji 🔥     | `<StreakDisplay>`                        | mono number + Strava-style dot calendar         |
| `.streak-flame`                  | **REMOVE**                               | без иллюстраций пламени                          |
| `.progress-ring` (большой)       | `<MasteryRing size="sm|md">` (24–32px)   | inline ring chart, 4 states                      |
| (нет mastery dashboard)          | `<MasteryDashboard>`                     | grid из MasteryRing'ов по grammar areas          |
| `.calendar`, `.heatmap`          | `<ConsistencyCalendar>`                  | 12w desktop / 4w mobile, GitHub-graph style     |
| (lesson list был в lesson-map)   | `/course` page → `<CourseMap>`           | 44 урока, disclosure pattern                    |
| (review был частью lesson)       | `/review` page → `<ReviewBoard>`         | sections: today / tomorrow / weak / auto         |

---

## 7. Что НЕ трогать (важно)

- **Бизнес-логика переходов** в `app/page.tsx` — все `useState`, `useEffect`, `useReducer`. Только разнести по компонентам через props.
- **Server actions:** `compareAnswer`, `tokenize`, `scoreComposition`, `getLesson`, `submitAttempt` — оставить как есть.
- **`MediaRecorder` integration** в speaking — оставить точно как есть.
- **Speaking scoring API endpoints** — оставить.
- **`course.ts` data file** — content менять только через AdminSheet UI, схему не трогать.
- **Spaced-repetition engine** — UI к нему адаптируется, не наоборот.
- **`uiCopy` content** — копирайт можно подкручивать, но **schema** `{ ru: {...}, en: {...} }` не менять.
- **Auth flow** — POST /api/auth/* остаётся как есть. Меняется только UI shell.

---

## 8. Codex execution order

Делать по PR, не одной мегакоммитом. Один шаг — один PR.

1. **PR 1:** `styles/tokens.css` + `lib/cn.ts` + primitives (Button, IconButton, TextField, Eyebrow, Callout, BrandMark, TypeChip, Pill).
2. **PR 2:** Layout shell — `<AppShell>`, `<TopBar>`, `<Sidebar>`, `<BottomTabs>`, `<AuthShell>`. Мигрировать `app/layout.tsx`.
3. **PR 3:** `<StepRail>` + `<CourseDrawer>`. Удалить `.lesson-grid` + `.lesson-map`. Workspace одноколоночный.
4. **PR 4:** Step-types по одному (Theory → Vocabulary → Translate → Composition → Drill → Speaking). Каждый — отдельный sub-PR в feature branch.
5. **PR 5:** Routes `/today`, `/course`, `/review` + Streak / Mastery / Calendar компоненты.
6. **PR 6:** `<AdminSheet>` query-overlay + universal states (`<Skeleton>`, `<EmptyState>`, `<ErrorCallout>`, `<OfflineBanner>`).
7. **PR 7:** A11y pass — focus rings, aria, kbd-nav, prefers-reduced-motion. Lighthouse + axe-core CI gate.

Каждый PR должен оставлять приложение **рабочим**. Не позволяй half-migrated state — лучше temp-bridges на старые классы, чем сломанный build.

---

## 9. Sanity check после миграции

Прогон руками:
1. Login → Today → Course Map → Lesson 1, Step 1
2. Translate (idle → wrong → reveal → correct → continue)
3. Theory step (раскрыть accordions)
4. Speaking step (record → score → continue / retry на low score)
5. Composition step (multi-line + Sokratic)
6. Review screen (open due-section, открыть pattern, start review)
7. AdminSheet open `?admin=lessons` (если OWNER) → edit lesson → save
8. Offline mode (DevTools → Offline) → продолжить занятие → банка показывается, прогресс не теряется

Если все 8 проходят — миграция OK.
