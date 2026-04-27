export type Locale = "ru" | "en";

export type StepType = "theory" | "vocabulary" | "translate" | "drill" | "speaking";

export type TrainingStep = {
  id: string;
  type: StepType;
  label: Record<Locale, string>;
  prompt: Record<Locale, string>;
  hint: Record<Locale, string>;
  targetText: string;
  acceptedAnswers: string[];
  notes: Record<Locale, string[]>;
};

export const lessonOne = {
  id: "lesson-01",
  title: {
    ru: "Я делаю это обычно",
    en: "I usually do it"
  },
  steps: [
    {
      id: "l1-theory",
      type: "theory",
      label: {
        ru: "Формула Present Simple",
        en: "Present Simple formula"
      },
      prompt: {
        ru: "Освой ПЛФ: обычность и повторяемость действия.",
        en: "Learn the speech pattern for repeated actions."
      },
      hint: {
        ru: "Это база урока: сначала понять, потом довести до автоматизма.",
        en: "This is the lesson base: understand first, then automate."
      },
      targetText: "I often drink coffee. Do I often drink coffee? I don't often drink coffee.",
      acceptedAnswers: [],
      notes: {
        ru: [
          "Дух времени: обычность и повторяемость.",
          "Утверждение: I/you/we/they + V, he/she/it + Vs.",
          "Вопрос: do/does + subject + V.",
          "Отрицание: do not / does not + V.",
          "Слова частоты usually, often, seldom, always, never обычно стоят перед смысловым глаголом."
        ],
        en: [
          "Time sense: repeated and habitual actions.",
          "Positive: I/you/we/they + V, he/she/it + Vs.",
          "Question: do/does + subject + V.",
          "Negative: do not / does not + V.",
          "Frequency words usually, often, seldom, always, never usually go before the main verb."
        ]
      }
    },
    {
      id: "l1-vocabulary",
      type: "vocabulary",
      label: {
        ru: "Лексика и идиомы",
        en: "Vocabulary and idioms"
      },
      prompt: {
        ru: "Проговори новые слова и идиомы вслух.",
        en: "Say the new words and idioms out loud."
      },
      hint: {
        ru: "Нажми динамик вверху, чтобы услышать пример системной озвучки браузера.",
        en: "Use the speaker button above to hear a browser voice preview."
      },
      targetText: "to play the fool, to lose one's temper, to wake up, to wash the dishes",
      acceptedAnswers: [],
      notes: {
        ru: [
          "валять дурака - to play the fool",
          "выходить из себя - to lose one's temper",
          "просыпаться - to wake up",
          "мыть посуду - to wash the dishes",
          "принимать душ - to take a shower"
        ],
        en: [
          "to play the fool - валять дурака",
          "to lose one's temper - выходить из себя",
          "to wake up - просыпаться",
          "to wash the dishes - мыть посуду",
          "to take a shower - принимать душ"
        ]
      }
    },
    {
      id: "l1-translate-01",
      type: "translate",
      label: {
        ru: "Письменный перевод",
        en: "Written translation"
      },
      prompt: {
        ru: "Переведи: Я всегда читаю газеты по утрам.",
        en: "Translate: Я всегда читаю газеты по утрам."
      },
      hint: {
        ru: "Соблюдай место always и форму множественного числа.",
        en: "Mind the position of always and the plural noun."
      },
      targetText: "I always read newspapers in the mornings.",
      acceptedAnswers: [
        "I always read newspapers in the mornings.",
        "I always read newspapers in the morning."
      ],
      notes: {
        ru: [],
        en: []
      }
    },
    {
      id: "l1-drill-01",
      type: "drill",
      label: {
        ru: "Трехмерная техника",
        en: "Three-part drill"
      },
      prompt: {
        ru: "Дай утверждение, вопрос и отрицание: Он часто смотрит телевизор по выходным.",
        en: "Give positive, question and negative: Он часто смотрит телевизор по выходным."
      },
      hint: {
        ru: "Порядок: He... / Does he...? / He doesn't...",
        en: "Order: He... / Does he...? / He doesn't..."
      },
      targetText: "He often watches TV at weekends. Does he often watch TV at weekends? He doesn't often watch TV at weekends.",
      acceptedAnswers: [
        "He often watches TV at weekends. Does he often watch TV at weekends? He doesn't often watch TV at weekends.",
        "He often watches TV at week-ends. Does he often watch TV at week-ends? He doesn't often watch TV at week-ends.",
        "He often watches TV on weekends. Does he often watch TV on weekends? He doesn't often watch TV on weekends."
      ],
      notes: {
        ru: [],
        en: []
      }
    },
    {
      id: "l1-translate-02",
      type: "translate",
      label: {
        ru: "Идиома в потоке",
        en: "Idiom in flow"
      },
      prompt: {
        ru: "Переведи: Он никогда не выходит из себя.",
        en: "Translate: Он никогда не выходит из себя."
      },
      hint: {
        ru: "В английском здесь одно отрицание: never.",
        en: "English uses one negative here: never."
      },
      targetText: "He never loses his temper.",
      acceptedAnswers: ["He never loses his temper."],
      notes: {
        ru: [],
        en: []
      }
    },
    {
      id: "l1-speaking-01",
      type: "speaking",
      label: {
        ru: "Говорение",
        en: "Speaking"
      },
      prompt: {
        ru: "Произнеси фразу медленно, потом еще раз быстрее.",
        en: "Say the phrase slowly, then repeat it faster."
      },
      hint: {
        ru: "Запись уже сохраняется в Blob. Следующий шаг - STT и подсветка ошибок.",
        en: "The recording is now saved to Blob. Next step: STT and error highlighting."
      },
      targetText: "Why do you never wash the dishes after lunch?",
      acceptedAnswers: ["Why do you never wash the dishes after lunch?"],
      notes: {
        ru: [],
        en: []
      }
    }
  ] satisfies TrainingStep[]
};

export const uiCopy = {
  ru: {
    productRole: "тренажер речи",
    today: "Сегодня",
    book: "Книга",
    review: "Повторение",
    lessonLabel: "Урок",
    switchLanguage: "Переключить язык",
    bookProgress: "Прогресс книги",
    trainingPath: "Маршрут урока",
    task: "Задание",
    understood: "Понял, продолжить",
    answerPlaceholder: "Напиши ответ на английском...",
    check: "Проверить",
    retry: "Сбросить",
    next: "Дальше",
    finish: "Завершить",
    methodTitle: "Методика",
    methodBody:
      "Урок идет по алгоритму книги: понять формулу, письменно перевести, сверить, проговорить и закрепить в потоке.",
    reviewTitle: "Слабые места",
    noWeakSteps: "Пока нет повторных ошибок. Продолжай в том же порядке.",
    startRecording: "Записать",
    stopRecording: "Стоп",
    recordingSaved: "Запись принята",
    recordingMvp:
      "Следующий этап: отправка аудио в STT, сравнение с эталоном и подсветка слов, которые нужно повторить.",
    recordingProblem: "Запись не сохранена",
    microphoneUnsupported: "Этот браузер не поддерживает запись с микрофона.",
    microphoneDenied: "Нет доступа к микрофону. Разреши доступ в браузере и попробуй еще раз.",
    recordingEmpty: "Запись получилась пустой. Попробуй записать фразу еще раз.",
    uploadingRecording: "Загружаю запись в Vercel Blob...",
    uploadedRecording: "Запись сохранена в Vercel Blob. Следующий этап - STT и подсветка ошибок.",
    uploadFailed: "Не удалось загрузить запись.",
    transcriptionReady: "Запись сохранена и распознана. Проверь подсветку ниже.",
    transcriptTitle: "Распознанная речь",
    transcriptProblem: "Запись сохранена, но распознавание не прошло",
    playNative: "Проиграть эталон",
    nativeAudioLoading: "Генерирую британский эталон через ElevenLabs...",
    nativeAudioLoadingShort: "Генерирую...",
    nativeAudioFailed: "Не удалось проиграть эталон.",
    nativeAudioVoice: "Голос",
    activeProfile: "Профиль",
    addProfile: "Добавить локальный профиль",
    newProfilePrompt: "Имя нового профиля",
    localProfilesTitle: "Без авторизации",
    localProfilesBody:
      "Сейчас прогресс хранится отдельно для каждого локального профиля в этом браузере. Для синхронизации между устройствами позже подключим базу и вход.",
    stepTypes: {
      theory: "Теория",
      vocabulary: "Лексика",
      translate: "Перевод",
      drill: "Техника речи",
      speaking: "Говорение"
    },
    feedback: {
      exact: "Точно",
      partial: "Можно принять",
      wrong: "Нужно исправить"
    }
  },
  en: {
    productRole: "speech trainer",
    today: "Today",
    book: "Book",
    review: "Review",
    lessonLabel: "Lesson",
    switchLanguage: "Switch language",
    bookProgress: "Book progress",
    trainingPath: "Lesson path",
    task: "Task",
    understood: "Got it, continue",
    answerPlaceholder: "Write the English answer...",
    check: "Check",
    retry: "Reset",
    next: "Next",
    finish: "Finish",
    methodTitle: "Method",
    methodBody:
      "The lesson follows the book algorithm: understand the pattern, translate in writing, verify, say it aloud and use it in flow.",
    reviewTitle: "Weak spots",
    noWeakSteps: "No repeated mistakes yet. Keep moving in order.",
    startRecording: "Record",
    stopRecording: "Stop",
    recordingSaved: "Recording accepted",
    recordingMvp:
      "Next stage: send audio to STT, compare it with the expected text and highlight words to repeat.",
    recordingProblem: "Recording was not saved",
    microphoneUnsupported: "This browser does not support microphone recording.",
    microphoneDenied: "Microphone access was denied. Allow access in the browser and try again.",
    recordingEmpty: "The recording is empty. Try recording the phrase again.",
    uploadingRecording: "Uploading the recording to Vercel Blob...",
    uploadedRecording: "Recording saved to Vercel Blob. Next stage: STT and error highlighting.",
    uploadFailed: "Could not upload the recording.",
    transcriptionReady: "Recording saved and transcribed. Check the highlights below.",
    transcriptTitle: "Recognized speech",
    transcriptProblem: "Recording saved, but transcription failed",
    playNative: "Play native sample",
    nativeAudioLoading: "Generating a British reference sample with ElevenLabs...",
    nativeAudioLoadingShort: "Generating...",
    nativeAudioFailed: "Could not play the reference sample.",
    nativeAudioVoice: "Voice",
    activeProfile: "Profile",
    addProfile: "Add local profile",
    newProfilePrompt: "New profile name",
    localProfilesTitle: "No sign-in",
    localProfilesBody:
      "Progress is stored separately for each local profile in this browser. We will add database sync and sign-in later.",
    stepTypes: {
      theory: "Theory",
      vocabulary: "Vocabulary",
      translate: "Translation",
      drill: "Speech drill",
      speaking: "Speaking"
    },
    feedback: {
      exact: "Exact",
      partial: "Accepted",
      wrong: "Needs correction"
    }
  }
};
