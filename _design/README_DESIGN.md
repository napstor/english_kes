# English KES — Design System v2

> Документация для интеграции в продакшн-кодбейс.
> Прочти **MIGRATION_MAP.md** параллельно — там таблица переходов из старого CSS в новые компоненты.

---

## 0. Что в комплекте

```
01-foundation.html       Tokens, type, color, primitives, BrandMark
02-shell-flows.html      AuthShell, AppShell (TopBar/Sidebar/BottomTabs), StepRail, CourseDrawer
03-translate-step.html   Translate-step state machine (idle / wrong-1/2/3 / reveal / correct) + TutorChat
04-step-types.html       Theory · Vocabulary · Composition · Drill
05-speaking-step.html    Speaking — RecordingConsole + Pronunciation + Intonation + states
06-progress-screens.html Today · Course Map · Review · Streak · Mastery · Calendar
07-polish-handoff.html   AdminSheet · Loading/Empty/Error states · A11y audit · Implementation contract
```

Каждый этап — отдельный самодостаточный HTML с зум-карточками, экранными фреймами (1280px desktop + 375px mobile) и текстовыми пояснениями. Стиль один — токены ниже.

---

## 1. Format & stack contract (§10 брифа)

**Стек:**
- Next.js 14 (current), React Server Components by default
- TypeScript strict
- **CSS Modules + CSS variables** (никаких Tailwind / styled-components / emotion)
- `next/font` для шрифтов
- `lib/cn.ts` — своя утилита class-merge (без `clsx` / `cva`)
- Разрешённые зависимости: **`framer-motion`** (для drawer/sheet animations) + **`lucide-react`** (icons). Больше ничего.

**Component structure:**
```
components/
  primitives/       Button.tsx + Button.module.css, IconButton, TextField, Eyebrow, Callout, BrandMark, TypeChip, Pill, Hint
  layout/           AppShell, TopBar, Sidebar, BottomTabs, AuthShell, CourseDrawer, AdminSheet, TutorChat
  steps/            TheoryStep, VocabularyStep, TranslateStep, CompositionStep, DrillStep, SpeakingStep
  speaking/         RecordingConsole, MicButton, WaveformIndicator, PlaybackRow, IntonationGuide, ScoreBadge
  progress/         StepRail, MasteryRing, MasteryDashboard, StreakDisplay, ConsistencyCalendar
  states/           Skeleton, EmptyState, ErrorCallout, OfflineBanner
styles/
  tokens.css        Все CSS variables (цвета, радиусы, тени, motion, type)
  globals.css       Reset + body + body fonts (только!)
lib/
  cn.ts             Class merge util
  uiCopy.ts         { ru: {...}, en: {...} } — пробрасывается через Context
```

**Server vs client:**
- По умолчанию **Server Components** — все экраны без интерактива
- `"use client"` только там, где state/handlers: TranslateStep, SpeakingStep, AdminSheet, TutorChat, CourseDrawer, MicButton, etc.
- Server actions сохраняем как есть (`compareAnswer`, `tokenize`, `scoreComposition`)

**A11y и motion:**
- WCAG AA по всем text-on-surface (≥ 4.5:1 для body, ≥ 3:1 для display)
- `:focus-visible` ring на всех интерактивных
- `prefers-reduced-motion` отключает декоративные анимации (waveform, shimmer, ring-glow)
- Touch hit targets ≥ 44×44px на mobile

---

## 2. Tokens

Все токены — в `styles/tokens.css` как CSS-переменные на `:root`. Никакого JS-объекта, никакого `defineTokens()`. Использование: `var(--accent-primary)`.

### 2.1 Color

```css
/* Surfaces (dark) */
--bg-base:        #07070C;          /* основной фон */
--bg-elevated:    #0F0F18;          /* cards, sheets */
--bg-elevated-2:  #161624;          /* nested cards */
--bg-elevated-3:  #1D1D2C;          /* hover state, segmented track */
--bg-overlay:     rgba(15,15,24,.78); /* backdrop blur surfaces */

/* Foreground */
--fg-primary:     #F5F5F8;          /* основной текст */
--fg-secondary:   rgba(245,245,248,.78);
--fg-muted:       rgba(245,245,248,.62);
--fg-subtle:      rgba(245,245,248,.38);
--fg-disabled:    rgba(245,245,248,.20);

/* Accents */
--accent-primary:   #5B6BFF;        /* основной CTA, focus */
--accent-glow:      #8A95FF;        /* progress, info, eyebrow indigo */
--accent-secondary: #C8FF6B;        /* success, mastered, correct */
--accent-warm:      #FFB454;        /* warning, attention, retry */

/* Semantic */
--positive:       #4ADE80;          /* score 75+, correct icon */
--negative:       #FF5C7A;          /* error, score <60, dismiss */

/* Borders */
--border-subtle:  rgba(245,245,248,.06);
--border:         rgba(245,245,248,.10);
--border-strong:  rgba(245,245,248,.16);
```

**Назначение каждого:**
- `accent-primary` — singular CTA (Continue, Save, Submit). Никогда два индиго CTA рядом.
- `accent-glow` — info, progress fill, link, eyebrow `.indigo`. Не для CTA.
- `accent-secondary` (lime) — score ≥75, mastered ring, correct verdict, owner-badge. Никогда для CTA — это **награда**, не действие.
- `accent-warm` — recognizing-medium, network errors, retry banners. Не для permanent state.
- `negative` — score <60, validation errors, hard gate. Острожно — частое использование = тревога.

**Dark only.** Light theme не делаем.

### 2.2 Type

```css
--font-display:  "KES Display", "Bricolage Grotesque", "Onest", "Inter", system-ui, sans-serif;
--font-sans:     "Inter", system-ui, sans-serif;
--font-mono:     "JetBrains Mono", ui-monospace, monospace;
```

**`KES Display`** — composite через `unicode-range`: Bricolage для латиницы, Onest для кириллицы. Это даёт единую визуальную метрику в обоих языках.

**Hierarchy:**
| Token       | Size                  | Weight | Use                                |
|-------------|----------------------|--------|------------------------------------|
| display-h1  | clamp(32, 4vw, 52)px | 700    | Page hero / step phrase            |
| display-h2  | 28px                 | 600    | Section title                      |
| display-h3  | 22px                 | 600    | Card title                         |
| body-l      | 16px                 | 400    | Body                               |
| body        | 15px (default)       | 400    | Default body                       |
| body-s      | 13px                 | 400    | Helper text                        |
| eyebrow     | 11px / mono / 600    | —      | letter-spacing .08em uppercase     |
| code/mono   | 11–12px / mono       | 500    | Tokens, IDs, debug                 |

**Step phrase ≠ display-h1.** В `TranslateStep` фраза идёт как **средний** display (38–42px), не 150px как было в старом `.huge-phrase`. Всё, что выше 60px — только лендинговые hero/auth headlines.

### 2.3 Spacing & Radii

```css
--r-sm: 8px;    --r-md: 12px;    --r-lg: 16px;    --r-xl: 20px;    --r-full: 9999px;
```

**Spacing:** используем 4px-grid через ad-hoc значения (4, 8, 12, 16, 20, 24, 32, 48, 64, 96). Без отдельных токенов — это лишняя индирекция.

### 2.4 Shadow & Strokes

```css
--shadow-soft:     0 8px 30px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.04) inset;
--shadow-elevated: 0 24px 60px rgba(0,0,0,.55), 0 1px 0 rgba(255,255,255,.05) inset;
--inset-stroke:    inset 0 1px 0 rgba(255,255,255,.08);
```

`--inset-stroke` — на всех card-like элементах для glass-эффекта. `--shadow-soft` — cards, sheets. `--shadow-elevated` — popovers, drawers, modal-like.

### 2.5 Motion

```css
--d-base:  200ms;  /* hover, button press, tab switch */
--d-slow:  320ms;  /* drawer/sheet enter/exit */
--d-glow:  600ms;  /* mastery ring breath, score reveal */

--e-out:   cubic-bezier(.22, 1, .36, 1);   /* default — quick start, smooth land */
--e-spring: cubic-bezier(.5, 1.6, .4, 1);  /* mic press, score-pop */
```

**Все** анимации проходят через эти 5 токенов. Никаких inline `transition: 0.25s ease`.

---

## 3. Primitives — props tables

### 3.1 Button

```ts
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: ReactNode; iconRight?: ReactNode;
  kbd?: string;                  // показывает kbd-chip "⌘ S" inside button
  loading?: boolean;             // spinner, disables click
  disabled?: boolean;
  children: ReactNode;
}
```

| Variant   | When                                              |
|-----------|---------------------------------------------------|
| primary   | Singular CTA per screen (Continue, Save, Submit) |
| secondary | Alternative actions (Skip, Cancel, Retry)         |
| ghost     | Tertiary (Learn more, Hide, Cancel в footer)      |

**Не оборачивай** `<a href>` в `<Button>` — используй `<Link>` styled as button через композицию props.

### 3.2 IconButton

```ts
type IconButtonProps = {
  size?: 'sm' | 'md';            // 28 / 36 px
  ariaLabel: string;             // обязательно — TS enforce
  icon: LucideIcon;
  onClick: () => void;
}
```

`aria-label` — required prop. Иконка сама `aria-hidden`.

### 3.3 TextField

```ts
type TextFieldProps = {
  label?: string;                // mono uppercase eyebrow
  required?: boolean;
  hint?: string;
  error?: string;                // отображается вместо hint, красная
  multiline?: boolean;
  ...InputHTMLAttributes
}
```

Состояния: idle / focus / error / disabled. Focus = `--accent-primary` ring 2px + 4px halo. Error = `--negative` ring + helper text.

### 3.4 Eyebrow / TypeChip / Pill

`Eyebrow` — mono 11px uppercase letter-spacing .08em. Variants: `default` / `indigo` / `lime` / `amber` / `negative`.

`TypeChip` — для step-type (CTX, THR, RCG, TRN, DRL, SPK). 3-letter mono uppercase, tinted background по типу.

`Pill` — generic rounded label (level A1, role badge, etc).

### 3.5 Callout

```ts
type CalloutProps = {
  tone?: 'info' | 'warn' | 'error' | 'ok';
  children: ReactNode;
}
```

Inline alert. Не popover, не toast. Используется для рекомендаций ("⚠ Менее 60 минут — возможно недо-наполнен"), tips, warnings внутри потока.

### 3.6 BrandMark

Composite logo: `KES` mono + `English` script + course meta. См. `01-foundation.html` § BrandMark. Версии: `default` (TopBar 56), `auth-hero` (large, AuthShell), `compact` (sidebar collapsed).

**Старый `.brand-mark` с emoji 🎯 — выбросить полностью.**

---

## 4. Composition guide

**Как собрать типовую страницу:**

```tsx
// app/lesson/[id]/page.tsx
export default async function LessonPage({ params }: Props) {
  const lesson = await getLesson(params.id);
  return (
    <AppShell>
      <TopBar>
        <Crumbs>{lesson.title}</Crumbs>
        <ProgressBar value={lesson.progress} />
        <UserMenu />
      </TopBar>
      <Sidebar />
      <Main>
        <StepRail steps={lesson.steps} currentId={lesson.currentStepId} />
        <StepCanvas>
          {/* Switch по step.type */}
          {step.type === 'translate' && <TranslateStep step={step} />}
          {step.type === 'theory'    && <TheoryStep step={step} />}
          {/* ... */}
        </StepCanvas>
      </Main>
      <CourseDrawer lessons={course.lessons} /> {/* hidden by default */}
    </AppShell>
  );
}
```

**Single-column workspace.** Никакого 2-column lesson-grid из старого. Step-canvas — одно вертикальное полотно. StepRail — узкий top-navigator. CourseDrawer — выезжающий sheet.

**Step types — независимые компоненты.** Каждый рендерит свой layout, у каждого свой `<Footer>` с Continue/Skip. Логика "что дальше" — в `useStepFlow()` хуке (или существующем reducer'е), не в компонентах.

**Auth — отдельный layout.** `AuthShell` без TopBar/Sidebar — это `app/auth/layout.tsx` с aurora-background.

---

## 5. State management

**НЕ переписываем** существующую логику в `app/page.tsx`. Все `useState`/`useEffect`/`useRef` оставляем — только разносим по новым компонентам через props.

Существующие server actions:
- `compareAnswer` (translate / composition)
- `tokenize` (для token-highlight)
- `scoreComposition`
- speaking scoring API
- `MediaRecorder` integration

**Не трогать.**

Переменные локализации — `uiCopy[locale]` — пробрасываем через React Context, в Server Components читаем из `headers()` или cookie.

---

## 6. States — universal

В `components/states/`:

- **`<Skeleton variant>`** — `list | card | detail | table`. Hold timeout 200ms (если данные пришли быстрее — показываем сразу).
- **`<EmptyState glyph title body action?>`** — compact card. 1 glyph (lucide thin) + 1 короткий title (≤ 6 слов) + 1 строка контекста + 1 опциональный CTA.
- **`<ErrorCallout severity={validation|network|server}>`** — inline. Не modal, не toast.
- **`<OfflineBanner />`** — top-fixed. Через `navigator.onLine` + ping. Не блокирует UI.

Полные специфики: см. `07-polish-handoff.html § 02–04`.

---

## 7. A11y checklist (must-pass before merge)

См. `07-polish-handoff.html § 06`. Краткое:

1. Все интерактивы — `:focus-visible` ring `2px var(--accent-primary)` + 4px halo.
2. Контраст body ≥ 4.5:1, display ≥ 3:1.
3. Hit target ≥ 44px (mobile) / 32px (desktop).
4. Логичный tab-order, skip-link на main.
5. `prefers-reduced-motion` → animation: none на декоре (waveform, shimmer, glow).
6. Иконки — либо `aria-hidden`, либо парный `aria-label`. Никогда оба.
7. Color-only meaning запрещён — score 45 (red) дублирован числом + текстом.
8. Heading hierarchy h1→h2→h3 без skip.
9. Esc закрывает все overlay (AdminSheet, TutorChat, CourseDrawer).
10. `aria-live="polite"` для score / recognizing-phase. `assertive` только для errors.

CI gate: Lighthouse + axe-core. Manual VoiceOver pass на login → first lesson → speaking attempt → review.

---

## 8. Mobile

**Breakpoints:**
- `< 640px` — mobile (375 reference)
- `640–1023` — tablet (collapsed sidebar, можно desktop layout)
- `≥ 1024` — desktop (220 sidebar или 56 collapsed)

**Mobile-specific patterns:**
- Sidebar → BottomTabs (Today / Course / Review / Profile, 4 max)
- TopBar остаётся 56px, но без crumbs (только brand + actions)
- Sheets/drawers — fullscreen, не side-sheet
- Mic phase: hide TopBar, sticky-top phrase + mic в lower-third (thumb reach)
- Step phrase wraps в 1–2 строки max (28–32px)

---

## 9. Breaking changes (потенциальные)

Что может сломаться при интеграции:

1. **`app/globals.css`** — переписан полностью. Старые `.lesson-grid`, `.lesson-map`, `.brand-mark`, `.stat-card` — удалены. Если в других файлах остались ссылки — Codex должен починить.
2. **TopBar height 120 → 56.** Все верстки, рассчитанные на старую высоту, едут.
3. **Двух-колоночный lesson layout удалён.** Workspace одноколоночный, StepRail сверху. Если где-то осталось `display: grid; grid-template-columns: ...` для урока — заменить.
4. **Step phrase font-size 150 → 38–42.** Глобальный визуальный рестарт.
5. **AdminPanel route → query overlay.** Старый `/admin` route можно либо удалить, либо оставить как redirect на `?admin=lessons`.
6. **`uiCopy` теперь через Context.** Если где-то импортируется напрямую — заменить на `useUiCopy()` хук.
7. **Иконки emoji → lucide-react.** Все 🎯, 🔥, ⚡, 📚 — выбросить.

---

## 10. Changelog

**v2.0 (этот этап)** — полная переделка дизайна.

- Новая type-система (Bricolage Grotesque + Onest + Inter)
- Новая color-палитра (indigo-glow + lime + amber на dark base)
- Single-column workspace, StepRail вместо lesson-map
- TopBar 56 (было ~120), step phrase 38–42 (было 150)
- StreakDisplay без emoji, Strava-style dot calendar
- MasteryRing (24–32px ring chart) вместо progress-bar
- ConsistencyCalendar GitHub-style 12 weeks
- AdminSheet вместо отдельного route
- Universal states (Skeleton / Empty / Error / Offline)
- WCAG AA pass

**Backwards compatibility:** none. Это full rewrite UI. API/server-actions/data-shape не тронуты.

---

## 11. Открытые вопросы для Codex

1. **Streak / Mastery / Calendar API** — есть ли уже такие endpoints или нужно создать? Если нет — placeholder mock со схемой из `07-polish-handoff.html § 07`.
2. **Spaced repetition** — какой алгоритм используется для "Что повторить сегодня"? UI рассчитан на ranks 0–5 + due-date.
3. **Audio storage** — где хранятся записи speaking? Локально/S3? Нужно для retry-state в long-recognizing fallback.
4. **OWNER role** — уже есть в session или добавлять? UI gate-checkает `session.role === 'OWNER'`.
5. **Locale switch** — есть ли уже переключатель ru/en, или у пользователя preference? UI ожидает `useUiCopy()` с Context.

---

## 12. Что дальше

После Codex-pass:
- before/after demo (короткие HTML на ключевых экранах)
- production smoke-test на real data
- Lighthouse + axe-core CI gate
- VoiceOver manual pass

Этап дизайна закрыт. Начинается интеграция.
