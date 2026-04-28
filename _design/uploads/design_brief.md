# ТЗ: редизайн web-приложения тренажёра английского языка

> Ты дизайн-агент, который выдаёт **рабочий код в стеке проекта**, а не Figma. На выходе должны быть файлы, которые мой code-agent (Codex) сможет напрямую положить в репозиторий и собрать.

---

## 1. Контекст

* Продукт: **English KES Trainer** — web-тренажёр **автоматизации разговорного английского** для русскоязычных взрослых. Курс 44 урока по методике книги Гивенталя. Сейчас открыт первый урок (MVP).
* Ключевая методическая формула продукта: «понял формулу → увидел русскую мысль → сам собрал английскую фразу → проверил → исправил → проговорил → сравнил с эталоном → повторил до автоматизма». Это не learning app в стиле Duolingo, это **speech automation tool**.
* Аудитория: **взрослые 35+, платежеспособные, профессионалы**. Английский A2 на старте, цель — разговорный B1 в сжатые сроки. В голове сильная русская логика построения фраз. Готовы много повторять, но непереносимы к академическому шуму, длинным объяснениям и инфантильному UI. Ожидают **premium**.
* Главные мотивы пользователя: регулярность + нарастающая спонтанность речи в реальной жизни. Прогресс должен быть **видимым и осязаемым**.
* Текущий этап продукта: self-test владельцем, далее — коммерциализация. Платежей и публичной регистрации сейчас нет. Onboarding не нужен — admin создаёт студентов вручную.
* Текущее состояние UI: MVP, дизайн на уровне «работает, но коряво». Светлая мятно-кремовая палитра, типичный AI-сгенерированный MVP.
* Хостинг: Vercel ([englishkes.vercel.app](https://englishkes.vercel.app)).
* Репозиторий: [github.com/napstor/english_kes](https://github.com/napstor/english_kes), разработка ведётся через AI-кодинг агента (Codex). Поэтому формат твоих результатов критичен (см. раздел 9).
* Стек: **Next.js 14.2 (App Router) + React 18 + TypeScript 5**. Стилизация на **чистом CSS / CSS Modules**, без Tailwind. Иконки `lucide-react` (уже установлено). Шрифт Inter подключён через `next/font/google` (latin + cyrillic).
* Бэкенд (UI-слой не трогает): Postgres, OpenAI, Vercel Blob, ElevenLabs (TTS). Аутентификация на bcryptjs.
* Поддерживаемые темы: **только dark**. Светлой темы нет, не закладываемся.
* Локализация: интерфейс двуязычный (RU / EN), переключение через segmented control в топбаре.

### 1.1 Архитектура UI (важно)

**Это single-page-приложение внутри Next.js App Router.** Весь UI находится в одном файле `app/page.tsx` (1792 строки) — это огромный client-компонент с конечным автоматом состояний:

* экран авторизации (логин)
* основная рабочая зона (sidebar + workspace)
* переключение между типами шагов урока внутри workspace
* админ-панель для роли OWNER

Все стили — в одном файле `app/globals.css` (1882 строки), глобальные kebab-case классы.

**Из этого следует ключевое требование к редизайну:** монолит нужно декомпозировать. Дизайн-агент не просто перерисовывает — он разносит page.tsx на логические компоненты (примерно 15-20 штук) и переводит CSS на CSS Modules + токены. После этого новый `app/page.tsx` композирует эти компоненты, сохраняя ту же логику состояний и ту же интеграцию с API/lib.

### 1.2 Что в приложении уже есть (типы упражнений)

В `lib/course.ts` определены 6 типов шагов (`StepType`):

1. **theory** — теоретическая страница: лид, карточки правил, примеры, типичные ошибки, метод.
2. **vocabulary** — список слов RU↔EN с озвучкой каждого.
3. **composition** — построчный мини-эссе по образцу (3-7 предложений), с проверкой через GPT-коуча и сократическими подсказками.
4. **translate** — перевод предложения RU→EN с проверкой через GPT-коуча, разбором ошибок и грамматическим мини-уроком.
5. **drill** — отработка повтором.
6. **speaking** — устная речь: запись голоса, транскрипция через Whisper, оценка произношения с разбором проблем и интонационным гайдом.

Каждый из этих типов имеет свой набор UI-блоков и фидбэк-панелей.

---

## 2. Цель редизайна

Поднять визуальное восприятие продукта до уровня премиальных AI-инструментов 2026 года. Пользователь должен видеть AI-продукт, а не учебное приложение. Уровень лоска как у Superhuman, Linear, Vercel, Granola.

**Главный референс**: [superhuman.com](https://superhuman.com)
**Дополнительные референсы для тона**: linear.app (инженерная сдержанность, плотность информации, быстрые переходы), granola.ai и cursor.com (AI-tooling: тёмная база, электрические акценты, ощущение «инструмента, а не игрушки»).

---

## 3. Дизайн-философия

Сочетание **технологичности и эмоциональности**. Не стерильный минимализм 2018-2022, а смелые текстурные решения. Эпоха, когда AI стал бытовой инфраструктурой и дизайн признаёт это: одновременно инженерно и живо.

Три опоры:

### 3.1 Брутальная типографика
* Массивные гротески в заголовках, ощущение веса и фундаментальности.
* Допускается variable font с экстремальным весом или лёгкая «деформация» (растяжение, сжатие, optical sizing).
* Моноширинный шрифт для метаданных, тегов, хинтов, кодоподобных элементов (это тренажёр английского — пары слов, IPA, грамматические теги отлично ложатся в mono).
* Никакого скевоморфизма, никакой декоративности.

### 3.2 Живая графика (сдержанно)
* Glass-объекты: **статичные** 3D-формы со стеклянной фактурой и рефракцией. Без Spline-эмбедов, без canvas-шейдеров, без real-time 3D. Это могут быть качественно отрендеренные PNG/WebP или построенные на SVG с фильтрами.
* Голографические градиенты, переливы оттенков. Допустима очень медленная CSS-анимация (15-30 сек цикл, низкая амплитуда), но не обязательна.
* **Grain (зерно) 2-4% поверх градиентов и крупных поверхностей** — обязательно. Это даёт аналоговое ощущение и убирает «пластиковость».
* Особое свечение (glow) только вокруг ключевых CTA и focus-состояний.
* **Без particle-полей, без частиц на фоне, без анимированных канвасов.** Сдержанная инженерная эстетика, как у Linear, а не как у генеративных AI-лендингов.

### 3.3 Neo-Humanism
* Глубокие тёмные темы с неоновыми акцентами.
* Дружелюбно, но премиально. Симбиоз человека и машины, а не «робот-учитель».
* Спокойная уверенность, ни одного крика «купи!» и ни одного эмодзи как декора.

### 3.4 Brand personality (для 35+ профессионалов)

Бренд-персона: **серьёзный инструмент для самостоятельной работы над разговорным навыком**. Не «приложение для изучения английского», а **тренажёр речи**.

Voice & tone:
* **Tool, not tutor.** Никаких «Молодец!», «Ты справился!», «Так держать!». Спокойная фиксация фактов: «Done · 95/100», «3 days streak».
* **Calm confidence.** Без восклицаний, без CAPS, без drama. Уверенный нейтральный голос.
* **Respect for user's time.** Каждый pixel оправдан. Никакого padding'а ради padding'а. Density выше «воздушности».
* **Adult gamification.** Прогресс виден, но в стиле Strava/Whoop, не Duolingo. См. §5.7.
* **Operator-of-tool, not coach-with-whistle.** Пользователь использует продукт, не наоборот.

Brand reference matrix:
| YES (как у нас) | NO (избегаем) |
|---|---|
| Linear, Cursor, Granola, Superhuman | Duolingo, Khan Academy, Babbel |
| Whoop, Strava (premium), Oura | Headspace, Calm, BetterHelp |
| Things 3, iA Writer | Coursera, Udemy |

> Спек упоминает «вдохновляться Duolingo» — это **отвергаем**. Целевая аудитория 35+ платежеспособных профи. Duolingo-стиль (cartoony mascots, +10 XP popups, owl-shaming) для них antithesis. Берём adult-friendly gamification из Strava/Whoop.

---

## 4. Дизайн-токены

### 4.1 Цвет (LOCKED)

Тёмная тема единственная. Палитра — «глубокая база + два акцента» (как у Cursor / Linear / Granola). НЕ менять оттенки, не «гармонизировать», не добавлять равноправные цвета.

```
/* Surfaces */
--bg-base:        #07070C   /* основной фон, ультра-тёмный с лёгкой синевой */
--bg-elevated:    #0F0F18   /* карточки, поверхности первого уровня */
--bg-elevated-2:  #161624   /* подкарточки, вложенные блоки */
--bg-overlay:     rgba(15,15,24,0.78)   /* frosted glass */

/* Foreground */
--fg-primary:     #F5F5F8
--fg-muted:       rgba(245,245,248,0.62)
--fg-subtle:      rgba(245,245,248,0.38)
--fg-disabled:    rgba(245,245,248,0.20)

/* Accents */
--accent-primary:   #5B6BFF   /* electric indigo — главный интерактив, focus, ссылки */
--accent-glow:      #8A95FF   /* для свечений и halos, не для заливок */
--accent-secondary: #C8FF6B   /* acid lime — completion, success, energy beats. СКУПО. */
--accent-warm:      #FFB454   /* amber — warnings, "almost correct" */

/* Status */
--positive:       #4ADE80
--negative:       #FF5C7A
--info:           #5B6BFF      /* = accent-primary */
--warning:        #FFB454      /* = accent-warm */

/* Borders */
--border-subtle:  rgba(245,245,248,0.06)
--border:         rgba(245,245,248,0.10)
--border-strong:  rgba(245,245,248,0.16)
--border-accent:  #5B6BFF       /* focus rings */

/* Special */
--gradient-aurora: linear-gradient(135deg, #1E1B4B 0%, #2A2160 35%, #5B6BFF 70%, #8A95FF 100%);
--grain-opacity:   0.03         /* зерно поверх градиентов и крупных surface'ов */
```

Принцип использования акцентов:
* **Indigo (`--accent-primary`)** — все интерактивные элементы: primary CTA, focus rings, активные ссылки, активный шаг в навигации, info-callouts, мужской/нейтральный тон. Доминирующий акцент.
* **Lime (`--accent-secondary`)** — только моменты завершения и энергии: completion-чек на пройденном шаге, success-toast, выделение «правильного» токена в ошибке, score-бейдж при ≥90/100. Никогда не для бэкграундов крупных областей. Один-два штриха на экран максимум.
* **Amber (`--accent-warm`)** — только warnings и «almost correct» feedback. Никогда декор.
* Negative — только разбор ошибок и destructive actions.

Контрасты: все text-on-surface комбинации проходят WCAG AA. Indigo на `--bg-base` имеет контраст 5.2:1 — годится для интерактивов, но для длинного основного текста используем `--fg-primary`.

### 4.2 Light theme
Не делаем. Тёмная тема единственная.

### 4.3 Типографика (LOCKED)

Три семейства, все free, все с поддержкой кириллицы. Подключение строго через `next/font` (для кириллицы — `subsets: ["latin", "cyrillic"]`).

| Роль | Шрифт | Источник |
|---|---|---|
| Display (заголовки) | **Inter Display** (или Inter с весом 700-900 + tight tracking, если Inter Display недоступен в next/font/google) | Google Fonts |
| Body | **Inter** (уже подключён) | Google Fonts |
| Mono | **JetBrains Mono** | Google Fonts |

Подключение:
```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap"
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap"
});
```

Шкала (clamp() для display — адаптивные на mobile):
```
display-2xl: clamp(48px, 7vw, 88px)   weight 800   tracking -0.04em   line-height 0.96
display-xl:  clamp(36px, 5vw, 64px)   weight 700   tracking -0.035em  line-height 1.0
display-lg:  clamp(28px, 3.5vw, 44px) weight 700   tracking -0.03em   line-height 1.05
h1:          28px                     weight 700   tracking -0.025em  line-height 1.1
h2:          22px                     weight 600   tracking -0.02em   line-height 1.2
h3:          17px                     weight 600   tracking -0.01em   line-height 1.3
body-lg:     16px                     weight 400-500   tracking 0       line-height 1.5
body:        15px                     weight 400       tracking 0       line-height 1.5
body-sm:     13px                     weight 400-500   tracking 0       line-height 1.45
caption:     12px                     weight 600       tracking 0.06em  line-height 1.3   uppercase
mono-sm:     12-13px                  weight 500       tracking 0       line-height 1.4
```

**Где обязательно mono:**
* Грамматические формулы (`I/you/we/they + V`, `do/does + subject + V`) — на тёмном фоне как chip.
* Token chips в разметке слов (после check на translate).
* Метаданные: `Lesson 1 / 44`, `Step 4 / 74`, score `95/100`, таймер `14s`, прогресс `4%`.
* Грамматические маркеры: `verb`, `phrasal`, `C1`, `Present Simple`.
* Хоткеи и keyboard shortcuts если будут.

**Где НЕ использовать mono:**
* Основной текст заданий и инструкций.
* Заголовки.
* Длинные RU/EN описания.

### 4.4 Spacing
4px-baseline: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.

### 4.5 Радиусы
sm 8, md 12, lg 16, xl 20, 2xl 28, full 9999.

### 4.6 Тени и эффекты

```
shadow-soft:    мягкая диффузная для карточек
shadow-elevated: для модалок
glow-accent:    цветное свечение под кнопкой/CTA
inset-stroke:   1px inset белая 6-10% — даёт «стеклянность»
backdrop-blur:  20-32px для frosted glass поверхностей
grain-overlay:  reusable utility класс, 2-4% noise через SVG/PNG
```

### 4.7 Motion
```
duration-fast:   120ms
duration-base:   200ms
duration-slow:   400ms
duration-page:   600ms

easing-out:      cubic-bezier(0.22, 1, 0.36, 1)
easing-spring:   cubic-bezier(0.34, 1.56, 0.64, 1)
```
Без linear. Везде где есть hover/focus/press — микроанимации.
Уважай `prefers-reduced-motion`.

### 4.8 Brand identity (LOCKED)

**Имя и наследие.** Бренд: **English KES**. Полное имя продукта: **English KES Trainer**. Сокращённый брендмарк: одиночная буква **K**. Старый MVP использовал базовый «K» в зелёном квадрате — заменяется на геометрический monogram ниже.

**Brand mark (SVG, currentColor-based).** Положить как inline-компонент `components/brand/BrandMark.tsx`:

```tsx
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true">
      <rect x="9" y="8" width="3" height="16" fill="currentColor" rx="1" />
      <path
        d="M 12 16 L 22 8 M 12 16 L 22 24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

Конструкция: вертикальная палка (3px толщина) + два луча-chevron из середины. Простой, читается на 16-24px, работает на любом фоне через `currentColor`.

**Применения brand mark:**
* TopBar: 24px, `color: var(--fg-primary)` для палки + `color: var(--accent-primary)` через nested SVG override для лучей. Можно реализовать двумя слоями `<BrandMark>` или передавать класс с CSS-фильтром. **Рекомендуемый подход:** разделить компонент на две версии — `<BrandMarkMono>` (одноцветный, currentColor) и `<BrandMarkDuo>` (две заливки через `<style>` внутри SVG).
* Auth screen: 56px, brand-mark + wordmark в стек.
* Favicon (16px): упрощённая версия в indigo квадрате — отдельный SVG `/public/favicon.svg`.

**Wordmark.** Текст «**English KES**» display-шрифтом, weight 700, tracking -0.025em. В лендинге/auth можно использовать стилизованную раскладку:
```
ENGLISH
   KES.
```
с точкой после KES (фирменный «терминальный» штрих, как у `.is`/`.ai` AI-tool брендов).

**Иконографика.**
* Базовый набор: **`lucide-react`** (уже установлен). Использовать только этот набор, не миксовать с другими.
* Параметры по умолчанию: `size={16}` или `{18}` для inline в тексте, `{20}` для кнопок, `{24}` для крупных action-icons. `strokeWidth={1.75}` (не дефолтные 2 — слишком жирно для нашей плотности).
* **StepType иконки** (для StepRail и LessonMap):
    * `theory` → `BookOpen` или `Lightbulb`
    * `vocabulary` → `Languages`
    * `composition` → `PenLine` или `FileText`
    * `translate` → `ArrowLeftRight`
    * `drill` → `Repeat2`
    * `speaking` → `Mic`
* **Кастомные иконки** (нужно нарисовать в стиле lucide — 24×24 viewBox, strokeWidth 1.75, strokeLinecap round):
    * `IntonationArrow` — стрелка перелома интонации (вверх/вниз). Уже есть в текущем UI (зелёная/синяя стрелка), сделать чистую версию.
    * `WaveformBar` — маленький эквалайзер для индикатора записи (5 баров, разной высоты, анимация breathing при активной записи).

**Что НЕ делать:**
* Маскотов, персонажей, иллюстративных учеников.
* Старый «K в зелёном квадрате» — выпилить полностью.
* Эмодзи в UI (только если приходят из user-generated контента, что в этом продукте отсутствует).

---

## 5. Layout architecture (CRITICAL)

Основная структурная проблема MVP: **трёхколоночный layout (200px primary nav + 280px lesson map + контент) + длинные вертикально-стэковые feedback-панели**. На 24" мониторе ~38% ширины съедено навигацией, на 13" laptop половина экрана, на mobile стекается в нечитаемую кашу. Контент задыхается. **Эту архитектуру переписываем целиком.**

### 5.1 Desktop (≥1024px)

```
┌────────────────────────────────────────────────────────────────────────┐
│  K  English KES · Lesson 1 / 44 — Step 4 / 74    ▓▓▓░ 4%   RU  ⚙  ⏻  │  TopBar  56px
├────┬───────────────────────────────────────────────────────────────────┤
│ ⌖  │  ◀  3 · TR 1.0   4 · TR 1.1 ●   5 · TR 1.2   6 · TR 1.3   ▶  │  StepRail  44px
│ ☐  │                                                                   │
│ ↻  │  ┌─────────────────────────────────────────────────────────────┐  │
│ 👥 │  │  Translate                                          ◯ ◀ ▶  │  │
│    │  │                                                              │  │
│    │  │  RU PHRASE                                                   │  │
│    │  │  Я всегда читаю газеты по утрам.                            │  │
│    │  │                                                              │  │
│    │  │  hint: место always — перед смысловым глаголом              │  │
│    │  │                                                              │  │
│    │  │  ┌─ Your answer ─────────────────────────────────────────┐  │  │
│    │  │  │ I always read newspapers...                           │  │  │
│    │  │  └────────────────────────────────────────────────────────┘  │  │
│    │  │                                                              │  │
│    │  │  Reset                                       Check  ▸ │ ▸  │  │
│    │  └─────────────────────────────────────────────────────────────┘  │
└────┴───────────────────────────────────────────────────────────────────┘
  56px collapsible        full remaining width
```

Ключевые решения:

1. **Sidebar 56px по умолчанию** (icon-only). Раскрывается до 220px при hover или клике на гамбургер. Содержит: Today, Course (книга), Review, Admin (для OWNER), Settings. Прогресс-полоска 4% переезжает в TopBar — отдельная карточка не нужна.

2. **Killed: 280px lesson map**. Заменяется на:
   - **StepRail** наверху (44px высота): горизонтальная полоса с 5-7 ближайшими шагами вокруг текущего, scroll-snap по горизонтали при overflow, стрелки prev/next по бокам. Текущий шаг помечен через accent-primary fill, пройденные — lime-чек, заблокированные — `--fg-disabled`.
   - **«All 74 →» drawer**: справа выезжает sheet с полным маршрутом (тот самый список, что раньше был в middle column), но он закрыт по умолчанию. Вызов через клавишу `?` или клик на counter `Step 4 / 74` в TopBar.

3. **Exercise canvas — единая центральная карта**. Не множество разорванных секций, а одна карточка с:
   - микро-meta-полоса наверху (тип шага, audio play, drawer-ручка, prev/next)
   - заданием
   - input-зоной
   - sticky-footer с действиями (Reset слева, Check/Next справа)
   
   Footer прибит к низу карточки, не к низу окна.

4. **Feedback после check** — режим карточки меняется. Не растягивается вниз, а **сплитится на 2 колонки**:
   - Левая (60% ширины): твой ответ + эталон + краткий verdict (verdict pill + score chip).
   - Правая (40%): drill-note + «Next →» CTA. По умолчанию длинный grammar-mini-lesson и issue-list collapsed под кнопкой `Show details ▾`. Раскрытие — в место правой колонки или в bottom-sheet, не вытягивает страницу.

### 5.2 Tablet / narrow desktop (768-1024px)

* Sidebar свёрнут до 56px без возможности развернуть встроенно — только overlay drawer.
* StepRail: 5 шагов вокруг текущего вместо 7.
* Feedback split: 1 колонка, но collapsed-sections остаются collapsed.

### 5.3 Mobile (<768px)

```
┌────────────────────────────────────┐
│ K · 1/44 · 4/74        RU  ⏻      │  TopBar 48px
├────────────────────────────────────┤
│ ◀  ◯ ◯ ● ◯ ◯  All 74 →           │  StepRail 36px
├────────────────────────────────────┤
│                                    │
│  Translate                         │
│  ─────                             │
│  Я всегда читаю газеты по утрам.  │
│                                    │
│  hint: место always...             │
│                                    │
│  [textarea]                        │
│                                    │
├────────────────────────────────────┤
│ Reset              Check ▸         │  Sticky footer 64px
├────────────────────────────────────┤
│ ⌖ Today  ☐ Course  ↻ Review  ⚙ Me │  BottomTabs 56px
└────────────────────────────────────┘
```

* Sidebar исчезает — заменяется BottomTabs (4 пункта).
* TopBar ужимается до 48px, без прогресс-полоски (она в табе Today).
* Footer actions sticky к низу, всегда видимы.
* Speaking & composition — те же layouts, но с особым вниманием к одной руке: record-кнопка и Show standard кнопка в зоне большого пальца (нижняя треть).

### 5.4 Density rules

1. **Стандартный шаг** (translate, vocab-list первая страница, drill, theory hero) — **полностью помещается в 1280×720** без скролла. Это hard requirement.
2. **Theory с длинным контентом, composition, speaking results** — могут уходить ниже сгиба, но не более чем на 30% высоты viewport-а (подсказывая «там есть ещё», но не пряча действие).
3. Всё, что выходит за density-budget — **collapsed by default**:
   - Полный grammar mini-lesson — за `Show details ▾`.
   - Полный issue-list (если ≥4 ошибок) — первые 2 видны, остальные за `Show all`.
   - Intonation-breakdown в speaking — collapsed после перерыва строк.
   - «Все 74 шага» — drawer, не inline.
4. **Без иллюстративных hero-картинок выше сгиба**, отъедающих 30%+ высоты. Glass-объекты — фоновые акценты в углах, не блокирующие контент.
5. Modals / sheets / drawers — это нормальный UX-приём, не запрещать. Лучше короткий клик в drawer, чем 3 экрана скролла.
6. Во всех stacked-фидбэк-блоках работает «прогрессивное раскрытие»: сначала вердикт, потом по запросу детали.

### 5.5 Tone of voice (UI copy)

Сместить копирайт с педагогически-учебного на **instrumental / IT-tool**. Деликатно — не до сухости, но к терминальности и точности. Локализация остаётся: RU копирайт первичен, EN — для пользователей с локалью EN.

Замены (правка `lib/course.ts` `uiCopy`):

| Старо | Ново |
|---|---|
| Понял, продолжить | Готово · Дальше |
| Маршрут урока | Шаги · 4 / 74 |
| Прогресс книги | Курс · 4% |
| Английский эталон скрыт. Скажи по-английски сам, затем при необходимости сверь. | Эталон скрыт. Произнеси, затем сверь. |
| Запись принята. Запись сохранена и распознана. Проверь подсветку ниже. | Записано · {duration}s |
| Лучший вариант | Эталон |
| Разбор ошибки | Разбор |
| Разметка слов | Токены |
| Краткая грамматическая справка | Грамматика |
| Можно принять | Близко · {score}/100 |
| Совпадает с допустимым вариантом | Принято · {score}/100 |
| Повторите: ... | Drill: ... |
| Создать ученика | Завести аккаунт |
| Пользователи · Создание учебных аккаунтов | Аккаунты |
| Прослушать себя | Твоя запись |
| Эталон медленно / Эталон обычно | Slow / Normal |
| Сбросить | Сброс (или Reset на инпутах) |
| Дальше | Дальше · ▸ |

Принципы:
* Числа везде, где есть что считать: `4 / 74`, `95 / 100`, `14s`, `4%`.
* Императив без излишней вежливости («Произнеси и сверь», не «Пожалуйста, попробуйте...»).
* Без восклицательных знаков. Без эмодзи. Без поощрений «Молодец!».
* Английская терминология, где она устоялась: **Token**, **Drill**, **Score**, **Reset**, **Slow / Normal**, **Hint**.
* Для bilingual UI — следить, чтобы EN-копирайт был ещё лаконичнее: `Done · Next`, `Course · 4%`, `Take · {time}s`.

### 5.6 Methodology-driven UX (CRITICAL)

Из продуктового спека приходят несколько UX-инвариантов, которые **обязаны быть отражены в дизайне**.

**5.6.1 Hide standard before user produces.**
В шагах translate / drill / speaking английский эталон **скрыт** до того, как пользователь сам произвёл попытку. На speaking уже так (`👁 Show standard`), на translate — нужно расширить: пользователь сначала пишет, и только после check видит эталон в feedback. Это ключевой принцип методики «спонтанное извлечение фразы, а не чтение с листа».

**5.6.2 Sokratic feedback flow.**
После check на translate/drill/composition — НЕ показывать сразу готовый ответ. State machine:

```
[user types]
   ↓ Check
   
correct   → [verdict + score + standard side-by-side + drill + Done · Next]

wrong (attempt 1/3)
   → [error-type chip + minimal theory hint + guiding question]
   → [Try again | Ask tutor | Show answer (less prominent)]

wrong (attempt 2/3)
   → [more direct hint + token highlight on problem area]
   → [Try again | Ask tutor | Show answer (more prominent)]

wrong (attempt 3/3) OR user clicks "Show answer"
   → [reveal standard + full mini-lesson + drill]
   → [Done · Next]
```

Это меняет дизайн TranslateFeedback в §7.6 — добавь **attempt counter** (`Try 1/3`), **Show answer** affordance (текст-кнопка, не primary CTA — растёт в выраженности с каждым неудачным attempt), и **Ask tutor** affordance (см. §5.7.3 ниже).

**5.6.3 Russian phrase is the visual hero.**
В translate/drill/speaking шагах RU-фраза — главный визуальный объект (display-lg). Инструкция выше — body, **не display**. Не сливать инструкцию и фразу в один заголовок (текущий MVP делает именно это: «Я делаю это обычно» оформлено как display, но это название урока, не задание). См. §7 — поправил композиции.

**5.6.4 No card-in-card.**
Карточки только для самостоятельных функциональных блоков (verdict, brief, examples). Не вкладывать карточки в карточки. Текущий MVP грешит этим — например, lesson-map это карточка, а внутри неё карточки шагов. Единый flat container с ровными разделителями лучше.

**5.6.5 Hide tech state from user.**
Никаких «Прогресс хранится локально», «Audio cached», «API timeout» в основном UI. Технические сообщения → admin diagnostics. Пользователю — only actionable feedback.

**5.6.6 Editorial overrides invisible.**
Когда модернизированная фраза отличается от книжной (`weekdays` vs `week-days`, `to clean the room` vs `to do the room`), показываем модернизованную, не упоминая конфликт. Это полностью content-layer concern, дизайн его игнорирует.

### 5.7 Gamification & motivation

Обязательная часть продукта (пользователь явно сказал «гейминг будет очень в тему»). Калибровка — для 35+, не для подростков.

**5.7.1 Streak.** Последовательные дни с минимум одной завершённой сессией. Показ: число дней + точечный календарь последних 30 дней. Стиль — Strava activity dots, не «🔥🔥🔥».

```
Streak · 5 days
●●●○●●●●●○○●●●●●●○●●●●●○○○●●●●●
```

**5.7.2 Mastery per pattern.** Каждая грамматическая конструкция (Present Simple assertion, Present Simple negation, Present Simple question и т.д.) и каждый идиоматический блок имеют шкалу 0-100% автоматизированности. Растёт с правильными ответами + правильным произношением, медленно деградирует со временем без практики. Показ — `<MasteryRing>` (progress ring 24-32px) рядом с pattern name.

**5.7.3 AI tutor chat (NEW FEATURE — критично).**

Пользователь явно сказал: «AI-тьютор очень органично — для обсуждения ошибок, нюансов». Это **новая фича**, которой нет в текущем MVP.

UX:
- На любом feedback-экране (после check на translate/drill/composition/speaking) — IconButton с label «Ask tutor» (или просто иконка `MessageSquare`).
- Клик открывает `<TutorChat>` Sheet справа (на mobile — fullscreen modal).
- Sheet содержит чат-интерфейс с AI, которому **в системный промпт уже скормлен контекст**: текущий шаг, RU-фраза, эталон, ответ пользователя, найденные ошибки, грамматика mini-lesson.
- Пользователь задаёт вопросы вроде «почему здесь нужно `always` в отрицании?», «есть ли другие варианты?», «как это произнести правильно?».
- AI отвечает как опытный коуч-учитель: коротко, по делу, по-русски (или по-английски, если локаль EN).
- История чата сохраняется per-step (опционально): можно вернуться к шагу и посмотреть, о чём спрашивал.

**Backend impact (для Codex, не для дизайнера):**
- Новый endpoint `/api/tutor/chat/route.ts`. Принимает `{ stepContext, history, userMessage }`, возвращает streaming response (как обычный chat completion).
- Опционально: таблица `tutor_chats` в Postgres для сохранения истории.
- Для MVP — без сохранения, только в памяти session-а.

**5.7.4 Consistency calendar.** GitHub-commit-graph-style heatmap последних 12 недель. Точки разной интенсивности по объёму работы за день. Виден на Today + Profile screens.

**5.7.5 Lesson unlocks, not grades.** Следующий урок открывается, когда предыдущий automated (mastery > 80% по всем patterns урока), не «проходной балл». Это методически вернее (учим до автоматизма, не до сдачи теста).

**5.7.6 Lime-glow micro-celebrations.** При первом mastery > 80% по pattern → 600ms breathing glow по `<MasteryRing>`. При завершении урока → краткая lime-aurora flash (1s, fade). Без confetti, без modals.

**5.7.7 Что НЕ делаем (anti-list для дизайн-агента):**
* `+10 XP` всплывающие числа.
* Stars, badges, trophies, level-up dialogs.
* Cartoon characters celebrating.
* Leaderboards, leagues (даже opt-in — на этом этапе нет).
* `🔥🔥🔥` для streak.
* Motivational quotes в духе «Practice makes perfect!».
* Confetti, fireworks, cascading animations.

### 5.8 Conflicts с продуктовым спеком (для трассируемости)

Продуктовый спек содержит несколько визуальных рекомендаций, **которые отвергаются в пользу design brief**. Это не недосмотр — это сознательное решение, согласованное с владельцем (он явно сказал: «мои рекомендации по дизайну имеют более высокий приоритет»).

| Тема | Спек | Дизайн-бриф (wins) | Причина |
|---|---|---|---|
| Палитра | «зелёный + sage/gray + blue для теории + amber для warnings + red для ошибок» | indigo `#5B6BFF` + lime `#C8FF6B` + amber только warnings | Зелёный — устаревший EdTech-сигнал, плохо стыкуется с premium AI-tool позиционированием для 35+ |
| Тема | «нейтральный фон + тёмный текст» (light theme) | dark theme единственная | Решено в ранних итерациях бриф-а; премиум AI-tools 2025-2026 = dark |
| Inspiration | «вдохновляться Duolingo, но не копировать» | Linear, Cursor, Granola, Superhuman | Duolingo — wrong audience и wrong era. См. §3.4 |
| Сложение тем | «blue для theory, amber для acceptable, red для errors» | один dominant accent (indigo) + один energy accent (lime) + статусы из узкой палитры | Multi-color приводит к визуальному шуму, противоречит §3 (брутальность через ограничения) |

Все остальные продуктовые требования спека — **ассимилированы** (см. §5.6, §5.7, §7).

---

---

## 6. Компонентная библиотека (минимум)

Каждый компонент в стеке проекта (`Component.tsx` + `Component.module.css`), с TypeScript-типами. Варианты — через простой union-type prop + lookup-объект внутри компонента (без `class-variance-authority`).

* **Button** — primary, secondary, ghost, destructive, icon-only. Hover с glow, press с micro-scale (98%).
* **IconButton** — отдельный компонент 32-40px, размеры sm / md / lg.
* **TextField / Textarea** — заметный focus-ring в `--accent-primary`, мягкий перелив бордера на focus, поддержка ошибки и подсказки.
* **Select / Combobox** — frosted glass dropdown, keyboard navigation.
* **Toggle / Checkbox / Radio** — с микроанимациями.
* **Card / Surface** — базовая поверхность с inset-stroke (1px белая 6-10%) и опциональным glow.
* **Modal / Sheet / Drawer** — frosted glass, blur 20-32px. Drawer с правой стороны для «All 74 →».
* **Popover / Tooltip** — лёгкие, мягкая тень.
* **TopBar** — компактная 56px (48 на mobile) полоска с brand + breadcrumb + locale + actions + прогрессом.
* **Sidebar** — 56px collapsed / 220px expanded. На mobile — overlay drawer.
* **BottomTabs** (mobile only) — 4 пункта, 56px высота, sticky.
* **StepRail** — горизонтальная полоска ближайших шагов, scroll-snap, prev/next стрелки.
* **CourseDrawer** — sheet с полным маршрутом (74 шага), вызывается по клику на counter.
* **ProgressBar / ProgressMeter / ScoreBadge** — линейный, дуговой, числовой бейдж.
* **Pill / Badge / TypeChip** — включая mono-варианты для `verb`, `C1`, `phrasal`. TypeChip берёт цвет в зависимости от StepType.
* **Callout** — 4 варианта: info (indigo), warning (amber), success (lime), error (red). Заменяет .coach-feedback-error, .composition-feedback и пр.
* **TokenChip** — отдельный inline-mono-chip для разметки слов. Состояния: neutral, correct (lime outline), incorrect (red outline).
* **CodeBlock** — для грамматических формул на тёмном фоне, mono.
* **WaveformIndicator** — анимированный эквалайзер для записи (см. кастомные иконки в 4.8).
* **EmptyState** — компактный glass-объект (≤120×120) + текст. Не hero, не оверсайз.
* **Skeleton / Loading** — shimmer и breathing glow вместо спиннера.

**Gamification & tutor (см. §5.7):**
* **TutorTrigger** — IconButton/text-button «Ask tutor» с контекстом step. Открывает TutorChat Sheet.
* **TutorChat** — Sheet справа (desktop) или fullscreen modal (mobile). Chat UI с streaming-ответами AI. Принимает `stepContext` prop.
* **StreakDisplay** — число дней + dot calendar 30 дней. Стиль Strava activity dots.
* **MasteryRing** — progress ring 24-32px. Variants: idle (faint), active (indigo), mastered (lime, glow на первом достижении 80%).
* **MasteryDashboard** — grid `<MasteryRing>` для всех patterns урока/курса.
* **ConsistencyCalendar** — GitHub-graph-style heatmap последних 12 недель. На mobile — последних 4 недель.
* **AttemptCounter** — `Try 1/3` mono chip для Sokratic flow в feedback.
* **SocraticHint** — компонент для отображения подсказки без раскрытия эталона. Variants: minimal, direct, full-reveal.

---

## 7. Экраны и состояния

В этом проекте нет роутов — всё переключается через состояние внутри `app/page.tsx`. Но визуально это разные «экраны», и каждый нужно спроектировать с учётом архитектуры из §5.

Для каждого экрана выдать: декомпозицию на компоненты + код + комментарий к ключевым решениям + ASCII-схема композиции в desktop и mobile.

> **Density-budget каждого экрана** — указан рядом с названием. Это hard-требование: при стандартном контенте экран должен помещаться в указанный viewport без вертикального скролла.

### 7.1 Auth screen — density 720px

Один блок по центру окна, ширина ~440px. Сверху — brand mark + wordmark в столбик. Заголовок «Sign in» (или «Вход»). Два TextField (username, password). Кнопка primary на всю ширину. Опциональная ссылка «Forgot password» (если есть API). Лёгкое aurora-свечение позади карточки, grain поверх. Ничего больше — никаких маркетинговых блоков, фич-листов или иллюстраций.

Состояние ошибки: Callout variant="error" над кнопкой.

### 7.2 Application shell — density 720px

```
┌────────────────────────────────────────────────────────────────┐
│ K  English KES Trainer · L1 · 4/74      ▓░ 4%   RU  ⚙  ⏻      │  TopBar
├──┬─────────────────────────────────────────────────────────────┤
│⌖ │  StepRail                                                   │
│☐ │                                                              │
│↻ │  [exercise canvas — fills remaining viewport]               │
│  │                                                              │
│👥│                                                              │
│  │                                                              │
│⚙ │                                                              │
└──┴─────────────────────────────────────────────────────────────┘
```

* TopBar (56/48 px) — компонент в `components/layout/TopBar.tsx`. Содержит:
    * `<BrandMark />` + wordmark «English KES Trainer» (на mobile только mark + сокращение).
    * Breadcrumb-блок: `Lesson 1 / 44` · `Step 4 / 74` (mono, hover на counter показывает кнопку «open course drawer»).
    * Inline-progress: тонкая дугa или ProgressBar 4% — клик открывает CourseDrawer.
    * Справа: LocaleToggle (RU/EN segmented), IconButton «settings», IconButton «logout».
* Sidebar (collapsed 56px / expanded 220px) — компонент в `components/layout/Sidebar.tsx`. Пункты: Today (target icon), Course (book), Review (rotate), Admin (people, виден только OWNER), Settings (cog). На mobile — заменён BottomTabs.
* StepRail (44/36 px) — `components/navigation/StepRail.tsx`. Горизонтальный scroll-snap список ближайших шагов. Каждый item: number + StepType-icon + первое слово label, активный — pill с accent-primary fill, пройденный — lime check, заблокированный — `--fg-disabled`. По бокам стрелки prev/next. Справа кнопка «All N →» открывает CourseDrawer.

### 7.3 Theory step — density 800px (допустим небольшой скролл)

```
┌─────────────────────────────────────────────────────────────────┐
│ ◀ TypeChip "Theory"   audio-play   open-drawer ⊞   3 / 4 → ▶  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  display-lg       display-2xl                                   │
│  МАИН ИДЕЯ        Я делаю это обычно                            │
│                                                                 │
│  body-lg описание...                                            │
│                                                                 │
│  ┌─ rule card ──┐  ┌─ rule card ──┐  ┌─ rule card ──┐          │
│  │ Дух времени  │  │ Утверждение  │  │ Вопрос       │          │
│  │ ...          │  │ I/you/we...  │  │ do/does +    │          │
│  │ [mono chip]  │  │ [mono chip]  │  │ [mono chip]  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ▾ Examples (12)              ▾ Pitfalls (3)                   │
│  ────────────                  ────────────                     │
│  collapsed by default          collapsed by default             │
│                                                                 │
│  ─────────────────────────────────────                          │
│  [Reset]                          Done · ▸                      │
└─────────────────────────────────────────────────────────────────┘
```

* **3 rule-card** в горизонтальный grid (auto-fit minmax 240px), не 4 как было — было перенасыщено.
* Examples и pitfalls — collapsed details (`<details>`). Раскрывает только заинтересованный.
* Method-strip убран как отдельная секция, метод вписывается в вступление.

### 7.4 Vocabulary step — density 720px (если ≤8 строк)

Список mono-таблицы: каждая строка `[en word]   →   [ru gloss]   [▶]`. Высота строки 44px. На mobile — тот же layout, кнопка play остаётся 44×44 для пальца. Если ≥10 строк — сначала показывается 6, под кнопкой `Show all (10) ▾`. Footer: Reset + Done.

### 7.5 Composition step — density допустимо 900px (sticky footer)

```
┌─────────────────────────────────────────────────────────────────┐
│ TypeChip "Composition"   open-drawer ⊞   ▶ next                │
├─────────────────────────────────────────────────────────────────┤
│  display-lg                                                     │
│  Используя новые слова, составь 10-20 предложений...            │
│                                                                 │
│  ┌─ Brief panel ──────────────────────────────────────────────┐│
│  │ MODEL                          REQUIREMENTS                ││
│  │ I often drink coffee. Do I...  • 10-20 lines              ││
│  │                                • assertion / question /    ││
│  │                                  negation per line          ││
│  │                                • Use lesson vocab           ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Lines (3 / 10 minimum)                                         │
│  1  [input............................................. ✕]   │
│  2  [input............................................. ✕]   │
│  3  [input............................................. ✕]   │
│  + Add line                                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Reset                                          Check  ▸ │ ▸    │  Sticky
└─────────────────────────────────────────────────────────────────┘
```

После check feedback заменяет brief-panel и lines:
* В шапке Callout: verdict (ready / needs_revision) + score chip.
* Ниже — SocraticList: для каждой проблемной строки одна короткая карточка с focus + question. Развёртывается при клике, показывая hint и severity.
* Грамматика и summary — collapsed под `Show details ▾`.

### 7.6 Translate step — density 720px (initial), 800px (with feedback)

**State machine (см. §5.6.2):** translate имеет несколько feedback-состояний, не одно. Дизайн обязан их различать.

```
INITIAL:
┌─────────────────────────────────────────────────────────────────┐
│ TypeChip "Translate"   audio   ⊞   3/4 → ▶                     │
├─────────────────────────────────────────────────────────────────┤
│  EYEBROW: RU                                                    │
│  display-lg: Я всегда читаю газеты по утрам.                   │
│                                                                 │
│  Hint: место always — перед смысловым глаголом                  │
│                                                                 │
│  ┌─ Textarea ─────────────────────────────────────────────────┐ │
│  │ Type in English...                                          │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Reset                                  Check  ▸ │ ▸             │
└─────────────────────────────────────────────────────────────────┘

AFTER CHECK — состояние WRONG (attempt 1/3, Sokratic):
┌─────────────────────────────────────────────────────────────────┐
│ TypeChip "Translate"   Try 1/3                                  │
├─────────────────────────────────────────────────────────────────┤
│  RU: Я всегда читаю газеты по утрам.                            │
│                                                                 │
│  Your answer:                                                   │
│  I always read newspapers...                                    │
│                                                                 │
│  ┌─ Что не так ─────────────────────────────────────────────────┐│
│  │ ⚠ Word order                                                  ││
│  │                                                                ││
│  │ Минимальная теория: place of "always" в Present Simple.       ││
│  │ Подсказка: где должна быть частотная наречие в утверждении?  ││
│  │                                                                ││
│  │ [Try again]   [Ask tutor]                Show answer           ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

AFTER CHECK — состояние CORRECT or REVEAL (split):
┌─────────────────────────────────────────────────────────────────┐
│ TypeChip "Translate"   ⊞   ✓                                    │
├─────────────────────────────────────────────────────────────────┤
│  RU phrase (compact)                                            │
│  Я всегда читаю газеты по утрам.                                │
│                                                                 │
│  ┌─ Your answer ───────────┐  ┌─ Verdict ─────────────────────┐│
│  │ I always read newspapers│  │ Близко · 80/100               ││
│  │ in the mornings...      │  │                                ││
│  │                         │  │ Эталон:                        ││
│  │ Tokens:                 │  │ I always read newspapers...    ││
│  │ [i][always][read]...    │  │                                ││
│  │                         │  │ Drill: I always read /         ││
│  │                         │  │ Do I always read?              ││
│  │                         │  │                                ││
│  │                         │  │ [Ask tutor]                    ││
│  └─────────────────────────┘  └────────────────────────────────┘│
│                                                                 │
│  ▾ Issues & grammar (1)        ▾ Mini-lesson                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Reset                                          Done · ▸         │
└─────────────────────────────────────────────────────────────────┘
```

Sokratic-состояние (wrong attempt) — компактнее: один блок с error type + минимальная теория + question + actions. Эталон НЕ виден. `Show answer` — ghost-кнопка справа, на третьем attempt становится текстом средней яркости.

Correct/reveal-состояние — split-карточка как раньше. `Ask tutor` — кнопка в verdict-зоне.

Issues и grammar mini-lesson — collapsed by default. Открываются inline.

### 7.7 Drill step

Та же структура, что и translate, но:
* Тип-chip orange (`--accent-warm`) — отличает повтор от первичного перевода.
* Меньше hint.
* Без grammar mini-lesson (только score + drill).

### 7.8 Speaking step — density 800px (initial), не более 900px (results)

```
INITIAL:
┌─────────────────────────────────────────────────────────────────┐
│ TypeChip "Speaking"  audio  ⊞                                   │
├─────────────────────────────────────────────────────────────────┤
│  RU display-lg: Я всегда читаю газеты по утрам.                │
│  Hint: tap mic, произнеси, затем сверь                          │
│                                                                 │
│              [────── Reference hidden ──────]                   │
│                       👁  Show standard                          │
│                                                                 │
│              ┌──────────────────────────┐                       │
│              │   ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮     │  WaveformIndicator    │
│              │                          │  (живой эквалайзер)   │
│              │     ◉ Record · 0s        │  крупная mic-кнопка   │
│              └──────────────────────────┘                       │
│                                                                 │
│  ─ Compare playback ─                                           │
│  [▶ Yours · n/a]   [▶ Slow]   [▶ Normal]                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Reset                                          Done · ▸         │
└─────────────────────────────────────────────────────────────────┘

RESULTS (split, после записи):
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ Recording ─────────────┐  ┌─ Pronunciation · 95/100 ──────┐ │
│ │ Записано · 7s           │  │ ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮         │ │
│ │ [▶ Yours][▶Slow][▶Norm] │  │ Фраза звучит понятно...       │ │
│ │                         │  │                               │ │
│ │ Recognized:             │  │ ▾ Intonation guide            │ │
│ │ "He often plays the     │  │ ▾ Issues (2)                  │ │
│ │  fool"                  │  │                               │ │
│ │ [he][often][plays]...   │  │                               │ │
│ │                         │  │                               │ │
│ │ ✓ Matches expected      │  │                               │ │
│ └─────────────────────────┘  └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Reset                                          Done · ▸         │
└─────────────────────────────────────────────────────────────────┘
```

* **WaveformIndicator** — кастомная иконка из 4.8. CSS-анимация breathing при `recording=true`. Без real-time analyzer (можно, если просто, но не обязательно — псевдо-анимация ок).
* Три compare-card сжаты до inline-row из трёх play-кнопок.
* На mobile: 1 колонка, recording-console сверху, results stack ниже.
* **Intonation guide** в collapsed-details. Внутри — три фразы с inline-стрелкой (custom `<IntonationArrow>`). Жирные слова — token chips.

### 7.9 Today screen (NEW — landing после логина)

После логина пользователь попадает не сразу в lesson 1 step 1, а на **Today dashboard**. Это главный экран мотивации и навигации в продукте.

```
┌─────────────────────────────────────────────────────────────────┐
│ K  English KES Trainer · Lesson 1                  RU  ⚙  ⏻   │
├──┬──────────────────────────────────────────────────────────────┤
│⌖ │  caption EYEBROW                                             │
│☐ │  display-lg: Welcome back, Alexey                            │
│↻ │                                                               │
│  │  ┌─ Streak ─────────┐  ┌─ Today's plan ──────────────────────┐│
│  │  │ 5 days           │  │ ▶ Continue Lesson 1 · TR 1.4         ││
│  │  │ ●●●○●●●●●○○●●●● │  │ ↻ Review TR 1.1, TR 1.2 (yesterday) ││
│  │  └──────────────────┘  │ ◉ Speech drill · 8 min               ││
│  │                         └──────────────────────────────────────┘│
│  │                                                                │
│  │  ┌─ Patterns mastery ─────────────────────────────────────────┐│
│  │  │ Present Simple · assertion       ●●●○○ 64%                 ││
│  │  │ Present Simple · question        ●●○○○ 32%                 ││
│  │  │ Present Simple · negation        ●○○○○ 18%                 ││
│  │  │ Idioms · Lesson 1                ●●●●○ 78%                 ││
│  │  └────────────────────────────────────────────────────────────┘│
│  │                                                                │
│  │  ▾ Last 12 weeks                                               │
│  │  [GitHub-style heatmap, collapsed by default]                 │
└──┴────────────────────────────────────────────────────────────────┘
```

* `<StreakDisplay>` — число + dot calendar.
* «Today's plan» — список из 2-4 действий, каждое — clickable card. Continue, Review, Speech drill, Tutor session.
* `<MasteryDashboard>` — список patterns с `<MasteryRing>`.
* `<ConsistencyCalendar>` — collapsed по умолчанию.

На mobile — те же блоки в одну колонку, BottomTabs внизу.

### 7.10 Course Map (NEW — карта 44 уроков)

Открывается через сайдбар «Course» или клик на breadcrumb «Lesson 1 / 44». Это **отдельный экран**, не drawer (CourseDrawer из §7.2 — это микро-навигация шагов внутри урока).

Layout: вертикальный лист 44 уроков в виде «треда». Каждый урок:
- number + title + description
- mastery indicator (`<MasteryRing>` агрегированный по всем patterns урока)
- статус: completed / in-progress / locked
- клик раскрывает inline список шагов урока (StepRail-как, но вертикально)

Текущий урок — glow indigo. Завершённые — lime check. Заблокированные — `--fg-disabled`.

На MVP-этапе (Lesson 1) — показывается 1 раскрытый урок и 43 «teaser»-карточек с placeholder-контентом.

### 7.11 Review (NEW — повторение)

Per методология (§7 спека) система должна автоматически добавлять в маршрут «Технику речи 2» двух предыдущих уроков и Speech Drilling 2 трёх предыдущих уроков. Это материализуется в Review screen.

Layout — три секции:

```
┌─────────────────────────────────────────────────────────────────┐
│  display-lg: Review                                             │
│                                                                 │
│  ── Overdue ──                                                  │
│  ⚠  TR 2.4 (Lesson 1) · 3 days ago · mastery 45%                │
│  ⚠  Speech drill 1.7 · 5 days ago · last score 60/100           │
│                                                                 │
│  ── Today's plan ──                                             │
│  ↻  TR 1.1 (Lesson 1) · scheduled today                         │
│  ↻  TR 1.2 (Lesson 1) · scheduled today                         │
│                                                                 │
│  ── Weak spots ──                                               │
│  ◉  Present Simple negation        18% mastery   [Drill now]    │
│  ◉  -s endings (3rd person)        32% mastery   [Drill now]    │
│  ◉  Always placement                45% mastery   [Drill now]    │
│                                                                 │
│  ── Automated ──                                                │
│  ✓  Idioms · Lesson 1              78% mastery                   │
└─────────────────────────────────────────────────────────────────┘
```

Density: на десктопе помещается полностью, разделы collapsed по необходимости. На mobile — каждая секция collapsible.

### 7.12 Tutor chat sheet (NEW — AI tutor)

Sheet выезжает справа на любом feedback screen (translate/drill/composition/speaking). На mobile — fullscreen modal.

```
┌──────────────────────────── Tutor ───────────── ✕ ┐
│                                                    │
│ context: TR 1.1 · "Я всегда читаю газеты"          │
│ your answer: I always read newspapers...           │
│ standard:    I always read newspapers in the...    │
│                                                    │
│ ──────────────────────────────────────────────     │
│                                                    │
│ Tutor                                              │
│ Хочешь обсудить, что не так с местом «always»?    │
│                                                    │
│ You                                                │
│ Почему оно ставится перед глаголом?                │
│                                                    │
│ Tutor                                              │
│ В Present Simple частотные наречия (always,        │
│ often, never) стоят между подлежащим и смысловым  │
│ глаголом. Сравни:                                 │
│ • He often plays. ✓                                │
│ • He plays often. ✗ (звучит неестественно)         │
│                                                    │
│ ──────────────────────────────────────────────     │
│ [Type your question...]                       ▸   │
└────────────────────────────────────────────────────┘
```

* Header: «Tutor» + close button.
* Context strip: текущий step + RU + ваш ответ + standard (только если уже raveal'ен).
* Chat history: alternating tutor/you messages, `--bg-elevated-2` для tutor, `--bg-elevated` для you. Без аватаров.
* Input bar внизу: textarea + send button. Streaming response через SSE.
* Закрытие: `Esc`, click outside (на desktop), back button (на mobile).

### 7.13 Admin panel



Открывается как Sheet справа (на desktop) или fullscreen (на mobile) при клике на «Admin» в Sidebar (виден только OWNER). Содержание:

* Section header: «Аккаунты».
* AdminForm: username + password + Create.
* AdminUsersList: каждая строка `username · role · ✕` (delete).

Без декора. Стиль — как Linear settings.

### 7.14 Universal states

* **Loading** — Skeleton с shimmer (linear-gradient breathing 1.5s, не быстрее). Никаких спиннеров.
* **Empty** — EmptyState компонент: glass-shape ≤120×120 + одна строка текста + одна CTA.
* **Error** — Callout variant="error" inline. Никаких alert-коробок.
* **Success** (после завершения шага) — кратковременная вспышка lime-glow на StepRail item (animation 600ms), переход к следующему шагу.
* **Offline** — баннер сверху Sidebar/TopBar: «Offline · changes pending».

### 7.15 Tech notes для дизайнера

* Локализация через `uiCopy` из `lib/course.ts` — все строки уже там, потреблять через `copy.xxx`. Изменение копирайтов из таблицы в §5.5 — отдельный коммит, изменяющий `uiCopy` (но не структуру TS-типов).
* Озвучка слов работает через API `/api/tts` и `/api/audio/native` — не трогать, только подключить новые UI-кнопки к тем же handler'ам.
* Запись голоса использует MediaRecorder API — handler уже есть в page.tsx, сохранить тот же контракт.
* Endpoints `/api/coach/check-answer` и `/api/coach/composition` возвращают существующие типы (`CoachFeedback`, `CompositionFeedback`) — не менять.

---

## 8. Иллюстрации и ассеты

Сдержанно. Иллюстрации — **акцент в углах**, а не блокирующий контент элемент. См. density rules (§5.4).

Положить в `/public/illustrations/` либо inline-SVG/Next Image-компоненты:

* **2-3 статичных glass-shape объекта** (морфинг, разные углы и преломления) — для auth screen, empty states, success-flash. Формат: WebP с прозрачностью или SVG с фильтрами. Размер: каждая ≤ 200KB. На auth screen — позади карточки, blur и grain поверх. **На рабочих экранах (theory/translate/speaking/composition) — НЕ ставить.** Они только для states и auth.
* **Aurora / голографический градиент-фон** как переиспользуемый компонент `<Aurora>`: SVG/CSS gradient + grain-overlay. Использование: фон auth screen, опциональный фон CourseDrawer. Допустима очень медленная CSS-анимация перелива (≥20 сек цикл, низкая амплитуда). Без canvas, без particle systems.
* **Grain texture** — переиспользуемая SVG/PNG утилита в `/public/textures/grain.svg` (или `noise.png`). Применяется как `::before` overlay через CSS-класс `.grain` с `mix-blend-mode: overlay; opacity: var(--grain-opacity);`.
* **Иконки** — `lucide-react` (см. §4.8). Кастомные иконки `IntonationArrow` и `WaveformBar` — отдельные компоненты в `components/icons/`.
* **Brand mark** — `components/brand/BrandMark.tsx` (см. §4.8 за SVG).

Если используешь сторонние ассеты, укажи лицензии в README.

---

## 9. Адаптивность и доступность

* Mobile-first дизайн, но **density rules из §5.4 имеют приоритет** на desktop. На narrow viewport-ах (<768px) перестраиваем layout согласно §5.3.
* Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.
* На mobile иллюстрации (auth aurora, empty state shapes) заменяются на упрощённые версии или скрываются. Brand mark и аккуратные glass-акценты остаются.
* Touch-targets минимум 44×44px (record-кнопка, audio play, step-rail items).
* WCAG AA по контрасту: основной текст 4.5:1, крупный текст 3:1. Indigo на base — 5.2:1, lime на base — 12:1.
* Видимый focus-ring (`box-shadow: 0 0 0 2px var(--border-accent)` или `outline: 2px solid var(--accent-primary)`). НЕ `outline: none` без замены.
* Все интерактивы доступны с клавиатуры. StepRail — стрелки + Tab. CourseDrawer — Escape для закрытия.
* `prefers-reduced-motion: reduce` — отключает все decorative-анимации (aurora перелив, glow pulses, success-flash). Critical-анимации (focus, hover) остаются, но без spring-bounce.
* `aria-label` на всех IconButton. `aria-live="polite"` на feedback Callout после check.

---

## 10. Формат поставки (КРИТИЧНО для интеграции с Codex)

### 10.1 Структура файлов

Стек проекта: **Next.js 14 App Router + TypeScript + чистый CSS / CSS Modules** (Tailwind не используется, не добавлять).

```
/app
  /globals.css                # CSS variables (токены), reset, базовые стили, @font-face,
                              # утилитарные классы (.glass, .grain, .glow, .aurora-bg),
                              # prefers-reduced-motion overrides
  /layout.tsx                 # подключение шрифтов через next/font, root html
  /page.tsx                   # ОСТАЁТСЯ как точка входа, но переписан так, что просто
                              # композирует компоненты из /components — вся логика
                              # состояний сохранена, только UI переключён на новые компоненты
  /api/                       # НЕ ТРОГАТЬ
/components
  /brand/
    BrandMark.tsx             # SVG-логотип, currentColor-based (см. §4.8)
    BrandMark.module.css
    Wordmark.tsx              # текстовая часть лого
  /icons/
    IntonationArrow.tsx       # кастомная иконка
    WaveformBar.tsx           # анимированный эквалайзер
  /ui/                        # primitives
    Button.tsx + .module.css
    IconButton.tsx + .module.css
    TextField.tsx + .module.css
    Textarea.tsx + .module.css
    Card.tsx + .module.css
    Callout.tsx + .module.css
    Badge.tsx + .module.css
    TypeChip.tsx + .module.css
    TokenChip.tsx + .module.css
    CodeBlock.tsx + .module.css
    Modal.tsx + .module.css
    Sheet.tsx + .module.css
    Drawer.tsx + .module.css
    Popover.tsx + .module.css
    Tooltip.tsx + .module.css
    ProgressBar.tsx + .module.css
    ProgressMeter.tsx + .module.css
    ScoreBadge.tsx + .module.css
    Skeleton.tsx + .module.css
    EmptyState.tsx + .module.css
  /layout/                    # shell-уровень
    AppShell.tsx              # композит: TopBar + Sidebar + main
    AuthShell.tsx              # отдельный shell для auth-state
    TopBar.tsx + .module.css
    Sidebar.tsx + .module.css
    BottomTabs.tsx + .module.css   # mobile only
  /navigation/
    StepRail.tsx + .module.css
    CourseDrawer.tsx + .module.css
    LocaleToggle.tsx + .module.css
  /steps/                     # каждый StepType — отдельный компонент-«экран»
    TheoryStep.tsx + .module.css
    VocabularyStep.tsx + .module.css
    CompositionStep.tsx + .module.css
    TranslateStep.tsx + .module.css
    DrillStep.tsx + .module.css
    SpeakingStep.tsx + .module.css
  /step-parts/                # переиспользуемые куски внутри steps
    ExerciseShell.tsx         # общий каркас exercise-card (header/body/footer)
    PromptBlock.tsx
    HintLine.tsx
    FooterActions.tsx
    RecordingConsole.tsx
    PlaybackRow.tsx
    TokenizedSentence.tsx
    PronunciationPanel.tsx
    IntonationGuide.tsx
    SocraticList.tsx
    IssueList.tsx
  /admin/
    AdminPanel.tsx + .module.css
    AdminForm.tsx + .module.css
    AdminUsersList.tsx + .module.css
  /illustrations/
    GlassShape.tsx            # параметризуемая форма (variant: orb / blade / drift)
    Aurora.tsx                # фоновый градиент-компонент
    GrainOverlay.tsx
/lib
  /design-tokens.ts           # экспорт токенов для JS-доступа (mirror globals.css)
  /cn.ts                      # className-merge утилита (без зависимостей)
  /(существующие файлы НЕ ТРОГАТЬ)  # course.ts, scoring.ts, server/* — только uiCopy
                                    # из course.ts может быть обновлён согласно §5.5
/public
  /illustrations/             # WebP/SVG статичных glass-объектов (≤200KB каждый)
  /textures/grain.svg         # 200×200 noise tile
  /favicon.svg                # упрощённый brand mark (см. §4.8)
README_DESIGN.md              # документация системы (см. §10.2)
```

**Жёсткие правила:**

* **Не добавлять Tailwind**, `styled-components`, `emotion`, `vanilla-extract` и любые другие styling-фреймворки. Только CSS Modules + CSS variables.
* **Не менять** структуру роутов в `/app`, server actions, API-ручки, схему БД, env-переменные, `next.config.mjs`, `tsconfig.json` (если только не нужен `paths` alias — обосновать).
* **Не трогать** `/lib` (бизнес-логика), `/scripts`, `/content` без явной необходимости. Если правка нужна — отдельным пунктом в README.
* Шрифты подключать через **`next/font`** (Google или local), не через `<link>` в `<head>`. Это требование Next.js 14 для оптимизации.
* Для составления className-строк — лёгкая своя утилита в `lib/cn.ts` (без `clsx`, без `tailwind-merge`). Если нужны варианты компонентов — простой объект-словарь, без `class-variance-authority`.

### 10.2 README_DESIGN.md

Обязательный файл. Должен содержать:

1. Список всех токенов с пояснением назначения.
2. Каждый компонент: prop-таблица + 2-3 примера использования (код).
3. Гайд по composition: как собрать типовую страницу из примитивов.
4. **Migration map**: таблица «старый компонент / класс из MVP → новый компонент». Это то, по чему Codex будет ориентироваться при правке существующих экранов.
5. Список потенциальных breaking changes.

### 10.3 Правила кода

* TypeScript везде.
* Никаких inline-стилей кроме случаев динамических вычислений (например, прогресс-бар через `style={{ width: `${pct}%` }}`).
* Каждый компонент — своя пара `Component.tsx` + `Component.module.css`.
* Имена компонентов в `PascalCase`, утилиты в `camelCase`, CSS-классы в `camelCase` (CSS Modules).
* CSS-переменные именуются по схеме `--bg-base`, `--fg-primary`, `--accent-primary` и т.п. (см. раздел 4). Все цвета, тени, радиусы, длительности — только через переменные. Хардкод значений запрещён.
* Допустимые новые зависимости: `framer-motion` (микроанимации). Любые другие новые depы — обосновать в README.
* `lucide-react` уже установлен — использовать его, не подключать другие icon-библиотеки.
* **Server Components vs Client Components**: интерактивные компоненты (`Button` с onClick, формы, модалки) помечать `"use client"`. Чистые презентационные (карточки без состояния) оставлять серверными — это критично для производительности Next.js 14.
* Не ломать существующую бизнес-логику, server actions, роутинг, API. Только UI-слой и его токены.

### 10.4 Что отдать пользователю в финале

* Все файлы из структуры выше.
* Сводный pull-request-friendly список изменений в README.
* Скрин или коротенький `before/after` для каждого ключевого экрана (опционально, в виде HTML-демки).

---

## 11. Чего делать НЕ нужно

* Эмодзи как декор UI.
* Stock-иллюстрации в стиле Notion / Slack / Storyset.
* Маскоты, cartoon-персонажи.
* Рисованные стрелочки, watermark «как в Figma community».
* Попсовый glassmorphism 2021 (полупрозрачные карточки на радужном фоне). Glass у нас не главный приём, а акцент.
* Skeuomorphism любой формы.
* Gradient-overload. Цвета работают акцентно, а не как ковровая бомбардировка.
* Светлая тема. Её нет.
* Particle-фейерверки, анимированные canvas-фоны, real-time 3D. Не делаем.
* Тонкие шрифты как заголовки.
* Бесконечный hero с пятью CTA подряд.

**Анти-паттерны из текущего MVP, которые нужно НЕ повторить:**
* Трёхколоночный layout с двумя постоянно видимыми навигациями. Только одна основная навигация.
* Заголовок шага гигантскими буквами на 150-200px высоты. Контент важнее.
* Длинные стэки feedback-блоков, которые требуют 2-3 экранов скролла. Сплитить в колонки или collapse.
* Карточки «Твоя запись / Медленно / Обычно» как три большие отдельные карточки. Это inline-row из трёх play-кнопок.
* Зелёный mint-cream как основа палитры. Уходим в indigo + lime + dark.
* Полностью видимый список из 74 шагов слева. Только StepRail + drawer.
* Слияние инструкции и учебной фразы в один display-заголовок. Инструкция — body, RU-фраза — display.
* Карточки внутри карточек. Flat hierarchy.
* Технические статусы пользователю («Прогресс пока хранится локально»). Только actionable feedback.
* Эталон, видимый до того, как пользователь произвёл попытку. См. §5.6.1.
* Готовый ответ сразу после первой ошибки. См. §5.6.2 — Sokratic flow.

---

## 12. Метрики качества

**Density (must-have):**
* На 1280×720 без скролла помещается: auth screen, любой translate/drill step (initial и feedback), любой vocabulary step с ≤8 строками, theory step hero (без collapsed-секций).
* На 1920×1080 — все экраны без скролла включая speaking results и composition с 5 строками.
* На 375×812 (iPhone 12 mini) — все экраны функциональны, footer-actions всегда достижим большим пальцем без растяжения руки.

**Visual quality:**
* Любой 2-секундный фрейм продукта читается как «AI-инструмент 2026», а не как «учебный сайт». Тест: показать скриншот человеку, не объясняя что это — реакция должна быть «выглядит как Linear/Cursor», а не «как Anki/Duolingo».
* Brand mark узнаваем на 16px (favicon).
* Glass-объекты и aurora ощущаются как «фоновое настроение», а не как декорация, перекрывающая контент.

**Performance:**
* Lighthouse Performance ≥ 90 на десктопе, ≥ 80 на mobile (учитывая шрифты и иллюстрации).
* CLS < 0.05.
* LCP < 2.5s на cold load.
* Бандл новых компонентов суммарно ≤ 80KB gzipped (без шрифтов).

**Accessibility:**
* WCAG AA по всем text-on-surface комбинациям.
* Все интерактивы доступны клавиатурой, focus-ring видимый.
* `prefers-reduced-motion` корректно отключает декоративные анимации.
* Screen reader: TopBar читается осмысленно, StepRail — как список с aria-current на активном.

**Code quality:**
* TypeScript strict — ноль `any` в новых компонентах.
* Все CSS-значения через переменные, ноль хардкода цветов/радиусов/теней.
* `app/page.tsx` после рефакторинга ≤ 600 строк (было 1792).
* `app/globals.css` после рефакторинга ≤ 300 строк, всё остальное в `.module.css` файлах компонентов.

---

## 13. Migration map (старый класс → новый компонент)

Это таблица для Codex: что в старом `app/page.tsx` / `globals.css` мапится на какой компонент в новой структуре. Дизайн-агент должен подтвердить и/или скорректировать эту таблицу в финальном `README_DESIGN.md`.

### 13.1 Layout & shell

**Внимание Codex**: новая архитектура (см. §5) сильно отличается от старой. Часть старых элементов **убирается**, а не переименовывается — это не breaking change бизнес-логики, только UI-слой.

| Старый класс / блок | Новый компонент / решение |
|---|---|
| `.app-shell` | `<AppShell>` в `components/layout/AppShell.tsx` (TopBar + Sidebar + main area) |
| `.auth-shell` + `.auth-card` | `<AuthShell>` (использует Aurora + GrainOverlay) |
| `.sidebar` + `.brand` + `.nav-list` | `<Sidebar>` 56/220px collapsible, на mobile — `<BottomTabs>` |
| `.brand-mark` (старый «K в зелёном квадрате») | **Убирается.** Заменяется на `<BrandMark>` (см. §4.8) |
| `.stat-card` + `.meter` («Прогресс книги 0%» внизу sidebar) | **Убирается из sidebar.** Прогресс переезжает в TopBar как inline `<ProgressBar>` рядом с counter |
| `.workspace` | Простой `<main>` без отдельной обёртки. Padding и max-width в AppShell |
| `.topbar` (заголовок шага + breadcrumbs + действия) | `<TopBar>` целиком переработан: компактные 56px (было ~120px), breadcrumbs «Lesson 1/44 · Step 4/74» как mono-meta, не как display-headline |
| `.top-actions` + `.user-pill` + `.segmented` + `.utility-menu` | `<TopBar>` правая часть: `<LocaleToggle>` (RU/EN), IconButton settings, IconButton logout, OWNER-only `<AdminMenu>` (sheet) |

### 13.2 Lesson navigation (полностью переработано)

| Старый класс / блок | Новый компонент / решение |
|---|---|
| `.lesson-grid` (двухколоночный grid с map слева) | **Убирается.** Workspace теперь одноколоночный — больше места под exercise canvas. Step navigation вынесена наверх |
| `.lesson-map` + `.map-head` + `.step-list` (всегда видимый список 74 шагов) | **Убирается из основной раскладки.** Заменяется на: `<StepRail>` (5-7 ближайших шагов, горизонтально, наверху canvas) + `<CourseDrawer>` (полный список 74 шагов в выезжающем sheet) |
| `.exercise-card` + `.exercise-top` + `.type-pill` + `.prompt-block` + `.source-text` + `.hint` + `.eyebrow` + `.footer-actions` | Общий `<ExerciseShell>` (header / body / sticky-footer) + step-specific компоненты: `<TypeChip>`, `<PromptBlock>`, `<HintLine>`, `<FooterActions>` |
| Display-заголовок шага «Я делаю это обычно» (был как display, занимал ~150px высоты) | **Убирается из топа.** Этот текст теперь как `<h1>` внутри ExerciseShell, средний размер h1 (28px), без отступа сверху-снизу. Освобождает ~80px вертикали для контента. |

### 13.3 Step-type panels (рендерятся внутри ExerciseCard)
| Старый класс / блок | Новый компонент |
|---|---|
| `.content-panel.theory-panel` + `.theory-lead` + `.theory-card-grid` + `.theory-card` + `.theory-examples` + `.example-row` + `.theory-pitfalls` + `.method-strip` | `<TheoryStep>` со всеми подкомпонентами (`<TheoryLead>`, `<TheoryCard>`, `<TheoryExampleRow>`, `<PitfallCard>`, `<MethodStrip>`) |
| `.content-panel` + `.lesson-notes` + `.vocab-row` | `<VocabularyStep>` + `<VocabRow>` |
| `.composition-panel` + `.composition-brief` + `.composition-editor` + `.composition-actions` + `.composition-feedback` + `.coach-feedback-head` + `.grammar-brief` + `.socratic-list` + `.drill-note` | `<CompositionStep>` + `<CompositionBrief>` + `<CompositionEditor>` + `<CompositionFeedback>` + `<SocraticList>` |
| `.feedback-headline` + `.answer-sentence-card` + `.expected` + `.token-details` + `.token-row` + `.coach-feedback-head` + `.grammar-brief` + `.best-answer` + `.issue-list` + `.issue-card` + `.bad-fragment` + `.arrow` + `.good-fragment` + `.grammar-line` + `.drill-note` | `<TranslateFeedback>` + `<TokenRow>` + `<IssueCard>` + `<DrillNote>` (общий) |
| `.speaking-workbench` + `.speaking-reference` + `.reference-toggle` + `.recording-console` + `.record-row` + `.speaking-compare-grid` + `.compare-card` + `.speaking-results` + `.transcript-text` + `.pronunciation-panel` + `.pronunciation-head` + `.pronunciation-issues` + `.intonation-guide` + `.intonation-phrases` + `.intonation-phrase` + `.intonation-line` | `<SpeakingStep>` + `<SpeakingReference>` + `<RecordingConsole>` + `<CompareCard>` + `<TranscriptResults>` + `<PronunciationPanel>` + `<IntonationGuide>` |

### 13.4 Admin
| Старый класс / блок | Новый компонент |
|---|---|
| `.admin-panel` + `.admin-panel-head` + `.admin-panel-icon` + `.admin-form` + `.admin-message` + `.admin-users` | `<AdminPanel>` + `<AdminForm>` + `<AdminUsersList>` |

### 13.5 Primitives (общие)
| Старый класс | Новый компонент |
|---|---|
| `.primary-button` (включая `.primary-button.wide`) | `<Button variant="primary">` (с пропом `block`) |
| `.secondary-button` | `<Button variant="secondary">` |
| `.icon-button` | `<IconButton>` |
| `.field-label` + нативный input | `<TextField>` (label + input + error) |
| `.eyebrow` | `<Eyebrow>` (или CSS-класс утилита) |
| `.type-pill` (с модификаторами по StepType) | `<TypePill type="theory|vocabulary|...">` |
| `.coach-feedback.error` / общая ошибка | `<Callout variant="error|success|info">` |
| `.brand-mark` | `<BrandMark>` |

### 13.6 Что НЕ менять в page.tsx (ответственность Codex)
* Все `useState`, `useEffect`, `useRef` и логику переходов состояний — оставить как есть, просто разнести по новым компонентам через props.
* Все вызовы `fetch('/api/...')`, обработчики MediaRecorder, работу с `lessonOne`, `compareAnswer`, `tokenize`, `detectGrammarHint` — не трогать.
* Локализационный объект `uiCopy` (получаемый как `copy = uiCopy[locale]`) пробрасывается в новые компоненты пропом или через простой React Context.

---

## 14. Что отдать пользователю в финале

* Все файлы из структуры раздела 10.1.
* `README_DESIGN.md` со всем содержимым из 9.2 + подтверждённой/обновлённой Migration map из раздела 13.
* Один пример нового `app/page.tsx`, который показывает как все компоненты собираются вместе — Codex использует его как референс при адаптации текущего page.tsx (где много логики состояний).
* Краткий changelog с потенциальными breaking changes.

---

## 15. Старт работы (поэтапно)

Чтобы можно было дать ранний фидбэк, не дожидаясь готовности всех экранов. Между этапами — review владельца.

**Этап 1: Foundation.**
Токены (locked: §4.1, §4.3) + base styles + 3 примитива (`Button`, `IconButton`, `TextField`) + `BrandMark` + `Eyebrow` + `TypeChip`. Плюс демо-страница `app/_design-preview/page.tsx` со всеми вариантами компонентов в одной колонке. Не для прода — для приёмки.

**Этап 2: Shell + Auth.**
Auth screen + Application shell (TopBar, Sidebar, BottomTabs, StepRail). Не функциональный, но вёрстанный с реальными размерами.

**Этап 3: First step type — Translate (the showcase).**
ExerciseShell + TranslateStep с **полной Sokratic flow** (3 attempt states + correct + reveal). Включая `<TutorTrigger>`, `<TutorChat>` Sheet (с заглушкой ответа AI), `<AttemptCounter>`, `<SocraticHint>`. Это ключевой экран — на нём владелец судит, попал ли дизайнер в точку.

**Этап 4: Theory, Vocabulary, Drill, Composition.**
Остальные «лёгкие» step types. Composition — самый сложный из них (multi-line + Sokratic feedback per line).

**Этап 5: Speaking — самый сложный.**
SpeakingStep с recording console, WaveformIndicator, IntonationArrow, PronunciationPanel. Потенциально с микро-prototype-анимацией записи.

**Этап 6: Today + Course Map + Review.**
Дашбордовые экраны с `<StreakDisplay>`, `<MasteryDashboard>`, `<ConsistencyCalendar>`, full Course Map. Для MVP self-test большинство данных будут заглушечными — это нормально, главное layout и компоненты.

**Этап 7: Polish.**
Admin panel + universal states + accessibility audit + responsive pass + lighthouse оптимизация. Финальный README_DESIGN.md.

Между этапами — ревью пользователя.
