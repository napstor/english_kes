export type Locale = "ru" | "en";

export type StepType = "theory" | "vocabulary" | "composition" | "translate" | "drill" | "speaking";

export type VocabularyItem = {
  ru: string;
  en: string;
  note?: string;
};

export type TheoryCard = {
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  formula?: string;
  example?: Record<Locale, string>;
};

export type TheoryContent = {
  lead: Record<Locale, string>;
  cards: TheoryCard[];
  examples: Array<{
    ru: string;
    en: string;
    note: Record<Locale, string>;
  }>;
  pitfalls: TheoryCard[];
  method: Record<Locale, string[]>;
};

export type TrainingStep = {
  id: string;
  type: StepType;
  label: Record<Locale, string>;
  prompt: Record<Locale, string>;
  sourceText?: string;
  hint: Record<Locale, string>;
  targetText: string;
  acceptedAnswers: string[];
  notes: Record<Locale, string[]>;
  theory?: TheoryContent;
  vocabulary?: VocabularyItem[];
  composition?: {
    minSentences: number;
    maxSentences: number;
    model: Record<Locale, string>;
    requirements: Record<Locale, string[]>;
  };
};

type LessonOneItem = {
  ru: string;
  answer: string;
  alternatives?: string[];
  hint?: Record<Locale, string>;
};

const lessonOneVocabularyItems: VocabularyItem[] = [
  { ru: "вкусно", en: "tasty" },
  { ru: "время", en: "time" },
  { ru: "встать", en: "to get up" },
  { ru: "встать с постели", en: "to get out of bed" },
  { ru: "газета", en: "a newspaper" },
  { ru: "готовить", en: "to cook" },
  { ru: "готовить завтрак", en: "to make breakfast" },
  { ru: "для всей семьи", en: "for the whole family" },
  { ru: "довольно", en: "quite; rather" },
  { ru: "идти о дожде", en: "to rain" },
  { ru: "завтракать", en: "to have breakfast" },
  { ru: "играть", en: "to play" },
  { ru: "кино", en: "cinema" },
  { ru: "кофе", en: "coffee" },
  { ru: "мешать, беспокоить", en: "to bother; to disturb" },
  { ru: "муж", en: "a husband" },
  { ru: "навести макияж", en: "to make up; to beautify oneself" },
  { ru: "обедать", en: "to have lunch" },
  { ru: "одеться", en: "to get dressed; to dress" },
  { ru: "перекусить", en: "to have a snack" },
  { ru: "переодеться", en: "to change; to get changed" },
  { ru: "петь", en: "to sing" },
  { ru: "пить", en: "to drink" },
  { ru: "по будням", en: "on weekdays" },
  { ru: "помогать", en: "to help" },
  { ru: "помыть посуду", en: "to wash the dishes" },
  { ru: "приготовить завтрак", en: "to make breakfast" },
  { ru: "принимать ванну", en: "to take a bath; to have a bath" },
  { ru: "принимать душ", en: "to take a shower; to have a shower" },
  { ru: "приходить", en: "to come" },
  { ru: "приходить вовремя", en: "to come on time" },
  { ru: "приходить в последнюю минуту", en: "to come in time" },
  { ru: "причесаться", en: "to do one's hair" },
  { ru: "проголодаться", en: "to get hungry" },
  { ru: "просыпаться", en: "to wake up" },
  { ru: "работа", en: "work; a job" },
  { ru: "рано", en: "early" },
  { ru: "ресторан", en: "a restaurant" },
  { ru: "семья", en: "a family" },
  { ru: "смотреть телевизор", en: "to watch TV" },
  { ru: "спать", en: "to sleep" },
  { ru: "стелить постель", en: "to make the bed" },
  { ru: "темнеть", en: "to get dark" },
  { ru: "теннис", en: "tennis" },
  { ru: "убрать комнату", en: "to do the room; to clean the room" },
  { ru: "ужинать", en: "to have supper" },
  { ru: "умываться", en: "to wash" },
  { ru: "читать", en: "to read" }
];

const lessonOneIdioms: VocabularyItem[] = [
  { ru: "валять дурака", en: "to play the fool" },
  { ru: "видеть выход из положения", en: "to see daylight" },
  { ru: "выходить из себя, терять терпение", en: "to lose one's temper" },
  { ru: "встать не с той ноги", en: "to get out of bed on the wrong side" },
  { ru: "гнуть спину", en: "to break one's back" },
  { ru: "напрягаться на работе", en: "to break one's back at work" }
];

function vocabularyNotes(items: VocabularyItem[]) {
  return items.map((item) => `${item.ru} - ${item.en}`);
}

const techniqueOne: LessonOneItem[] = [
  {
    ru: "Я всегда читаю газеты по утрам.",
    answer:
      "I always read newspapers in the mornings. Do I always read newspapers in the mornings? I don't always read newspapers in the mornings.",
    alternatives: [
      "I always read newspapers in the morning. Do I always read newspapers in the morning? I don't always read newspapers in the morning."
    ],
    hint: {
      ru: "Соблюдай место always: перед смысловым глаголом.",
      en: "Mind the position of always: before the main verb."
    }
  },
  {
    ru: "Летом ты играешь в теннис.",
    answer: "You play tennis in summer. Do you play tennis in summer? You don't play tennis in summer."
  },
  {
    ru: "Он часто смотрит телевизор по выходным.",
    answer: "He often watches TV at weekends. Does he often watch TV at weekends? He doesn't often watch TV at weekends.",
    alternatives: [
      "He often watches TV at week-ends. Does he often watch TV at week-ends? He doesn't often watch TV at week-ends.",
      "He often watches TV on weekends. Does he often watch TV on weekends? He doesn't often watch TV on weekends."
    ]
  },
  {
    ru: "Она иногда готовит обед.",
    answer: "She sometimes makes lunch. Does she sometimes make lunch? Sometimes she doesn't make lunch.",
    alternatives: ["She sometimes cooks lunch. Does she sometimes cook lunch? Sometimes she doesn't cook lunch."]
  },
  {
    ru: "Она очень часто готовит обеды для всей семьи.",
    answer:
      "She makes lunch for the whole family very often. Does she make lunch for the whole family very often? She doesn't make lunch for the whole family very often.",
    alternatives: [
      "She cooks lunch for the whole family very often. Does she cook lunch for the whole family very often? She doesn't cook lunch for the whole family very often."
    ]
  },
  {
    ru: "Мы ходим в кино по вечерам.",
    answer: "We go to the cinema in the evenings. Do we go to the cinema in the evenings? We don't go to the cinema in the evenings."
  },
  {
    ru: "Осенью обычно идут дожди.",
    answer: "It usually rains in autumn. Does it usually rain in autumn? It doesn't usually rain in autumn."
  },
  {
    ru: "Я каждый день хожу на работу.",
    answer: "I go to work every day. Do I go to work every day? I don't go to work every day."
  },
  {
    ru: "Ты часто мешаешь мне по вечерам.",
    answer: "You often bother me in the evenings. Do you often bother me in the evenings? You don't often bother me in the evenings.",
    alternatives: [
      "You often disturb me in the evenings. Do you often disturb me in the evenings? You don't often disturb me in the evenings."
    ]
  },
  {
    ru: "По выходным он обычно приходит вовремя.",
    answer: "He usually comes on time at weekends. Does he usually come on time at weekends? He doesn't usually come on time at weekends.",
    alternatives: [
      "He usually comes on time at week-ends. Does he usually come on time at week-ends? He doesn't usually come on time at week-ends.",
      "She usually comes on time at weekends. Does she usually come on time at weekends? She doesn't usually come on time at weekends.",
      "She usually comes on time at week-ends. Does she usually come on time at week-ends? She doesn't usually come on time at week-ends."
    ],
    hint: {
      ru: "В ключах книги здесь есть расхождение он/она, поэтому принимаются оба варианта.",
      en: "The book key has a he/she mismatch here, so both variants are accepted."
    }
  }
];

const techniqueTwo: LessonOneItem[] = [
  { ru: "Он часто валяет дурака.", answer: "He often plays the fool." },
  {
    ru: "Он всегда валяет дурака по вечерам?",
    answer: "Does he always play the fool in the evenings?",
    alternatives: ["Does he always play the fool in the evening?"]
  },
  { ru: "Как часто он выходит из себя?", answer: "How often does he lose his temper?" },
  { ru: "Он никогда не выходит из себя.", answer: "He never loses his temper." },
  {
    ru: "Он обычно встает не с той ноги и часто выходит из себя по понедельникам.",
    answer: "He usually gets out of bed on the wrong side and often loses his temper on Mondays."
  },
  { ru: "Почему в Лондоне часто идут дожди?", answer: "Why does it often rain in London?" },
  {
    ru: "Он никогда не напрягается на работе и обычно валяет дурака.",
    answer: "He never works hard and usually plays the fool at work.",
    alternatives: ["He never breaks his back at work and usually plays the fool."]
  },
  { ru: "Мой муж практически никогда не выходит из себя.", answer: "My husband hardly ever loses his temper." },
  { ru: "Я очень часто встаю не с той ноги.", answer: "I often get out of bed on the wrong side." },
  { ru: "Когда вы обычно теряете терпение?", answer: "When do you usually lose your temper?" },
  {
    ru: "Вы обычно долго спите?",
    answer: "Do you usually sleep for a long time?",
    alternatives: ["Do you usually sleep long?"]
  },
  { ru: "Я каждый день просыпаюсь в 7 утра.", answer: "I wake up at 7 o'clock every day." },
  { ru: "В котором часу вы обычно встаете?", answer: "What time do you usually get up?" },
  { ru: "Они никогда не умываются!", answer: "They never wash themselves." },
  { ru: "Он принимает душ каждый день.", answer: "He takes a shower every day." },
  {
    ru: "Я всегда принимаю ванну по вечерам.",
    answer: "I always have a bath in the evening.",
    alternatives: ["I always take a bath in the evening.", "I always have a bath in the evenings."]
  },
  { ru: "Мы иногда готовим завтрак по воскресеньям.", answer: "Sometimes we make breakfast on Sundays." },
  { ru: "Когда они завтракают?", answer: "When do they have breakfast?" },
  { ru: "Она редко обедает и никогда не ужинает.", answer: "She seldom has lunch and never has supper." },
  { ru: "Я иногда обедаю на работе, но не очень часто.", answer: "Sometimes I have lunch at work, but not very often." },
  { ru: "Он всегда моет посуду после завтрака.", answer: "He always washes the dishes after breakfast." },
  { ru: "Почему ты никогда не моешь посуду после обеда?", answer: "Why do you never wash the dishes after lunch?" },
  {
    ru: "Каждую субботу она убирает свою комнату.",
    answer: "She cleans her room every Saturday.",
    alternatives: ["Every Saturday she cleans her room."]
  },
  { ru: "Вы всегда валяете дурака на работе?", answer: "Do you always play the fool at work?" },
  {
    ru: "Они не моют посуду по вечерам, потому что довольно часто ужинают в ресторане.",
    answer: "They never wash the dishes in the evenings, because they have supper at the restaurant quite often.",
    alternatives: [
      "They never wash the dishes in the evenings because they have supper at the restaurant quite often.",
      "They never wash the dishes in the evenings, because they have supper at the restaurant fairly often."
    ]
  }
];

function makeTechniqueOneStep(item: LessonOneItem, index: number): TrainingStep {
  return {
    id: `l1-tp1-${String(index + 1).padStart(2, "0")}`,
    type: "drill",
    label: {
      ru: `Техника речи 1.${index + 1}`,
      en: `Speech drill 1.${index + 1}`
    },
    prompt: {
      ru: "Дай утверждение, вопрос и отрицание.",
      en: "Give positive, question and negative."
    },
    sourceText: item.ru,
    hint: item.hint ?? {
      ru: "Пиши три предложения подряд: утверждение, вопрос, отрицание.",
      en: "Write three sentences in order: positive, question, negative."
    },
    targetText: item.answer,
    acceptedAnswers: [item.answer, ...(item.alternatives ?? [])],
    notes: {
      ru: [],
      en: []
    }
  };
}

function makeTechniqueTwoStep(item: LessonOneItem, index: number): TrainingStep {
  return {
    id: `l1-tp2-${String(index + 1).padStart(2, "0")}`,
    type: "translate",
    label: {
      ru: `Техника речи 2.${index + 1}`,
      en: `Speech drill 2.${index + 1}`
    },
    prompt: {
      ru: "Переведи на английский.",
      en: "Translate into English."
    },
    sourceText: item.ru,
    hint: item.hint ?? {
      ru: "Сначала проверь ПЛФ, затем лексику и порядок слов.",
      en: "Check the speech pattern first, then vocabulary and word order."
    },
    targetText: item.answer,
    acceptedAnswers: [item.answer, ...(item.alternatives ?? [])],
    notes: {
      ru: [],
      en: []
    }
  };
}

function makeTechniqueOneSpeakingStep(item: LessonOneItem, index: number): TrainingStep {
  return {
    id: `l1-tp1-speak-${String(index + 1).padStart(2, "0")}`,
    type: "speaking",
    label: {
      ru: `Техника речи 1.${index + 1} вслух`,
      en: `Speech drill 1.${index + 1} aloud`
    },
    prompt: {
      ru: "Прочитай русскую фразу про себя и вслух произнеси трехмерный английский вариант.",
      en: "Read the Russian sentence silently and say the three-part English pattern aloud."
    },
    sourceText: item.ru,
    hint: {
      ru: "Последовательность книги: утверждение, вопрос, отрицание. Сначала медленно, потом повтори в обычном темпе.",
      en: "Book sequence: positive, question, negative. Start slowly, then repeat at normal speed."
    },
    targetText: item.answer,
    acceptedAnswers: [item.answer, ...(item.alternatives ?? [])],
    notes: {
      ru: [
        "Говори громко и отчетливо.",
        "Копируй интонацию эталона.",
        "Если STT не совпал, повтори именно проблемный кусок."
      ],
      en: [
        "Speak loudly and clearly.",
        "Copy the reference intonation.",
        "If STT does not match, repeat the problem fragment."
      ]
    }
  };
}

function makeTechniqueTwoSpeakingStep(item: LessonOneItem, index: number): TrainingStep {
  return {
    id: `l1-tp2-speak-${String(index + 1).padStart(2, "0")}`,
    type: "speaking",
    label: {
      ru: `Техника речи 2.${index + 1} вслух`,
      en: `Speech drill 2.${index + 1} aloud`
    },
    prompt: {
      ru: "Прочитай русскую фразу про себя и сразу произнеси английский вариант.",
      en: "Read the Russian sentence silently and immediately say the English version."
    },
    sourceText: item.ru,
    hint: {
      ru: "Методика ТР2: сначала тихо и медленно, сверка, затем два раза громко - обычным голосом и с другой высотой голоса.",
      en: "Speech drill 2 method: first quietly and slowly, check, then twice aloud with varied pitch."
    },
    targetText: item.answer,
    acceptedAnswers: [item.answer, ...(item.alternatives ?? [])],
    notes: {
      ru: [
        "Это основной навык урока: быстро выбирать нужную ПЛФ в потоке речи.",
        "После правильной записи повтори фразу еще два раза: выше обычного голоса и ниже обычного голоса."
      ],
      en: [
        "This is the core lesson skill: choosing the right speech pattern in speech flow.",
        "After a correct recording, repeat the phrase twice more: above and below your normal pitch."
      ]
    }
  };
}

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
          "Слова частоты usually, often, seldom, always, never обычно стоят перед смысловым глаголом.",
          "Методика урока: понять ПЛФ, письменно собрать фразы, затем громко проговорить те же конструкции до автоматизма."
        ],
        en: [
          "Time sense: repeated and habitual actions.",
          "Positive: I/you/we/they + V, he/she/it + Vs.",
          "Question: do/does + subject + V.",
          "Negative: do not / does not + V.",
          "Frequency words usually, often, seldom, always, never usually go before the main verb.",
          "Lesson method: understand the pattern, build the phrases in writing, then say the same structures aloud until automatic."
        ]
      },
      theory: {
        lead: {
          ru: "Present Simple в этом уроке нужен не для “простого настоящего”, а для привычек, расписаний и повторяющихся действий. Главная задача - научиться мгновенно собирать три формы: утверждение, вопрос и отрицание.",
          en: "In this lesson Present Simple is not about a generic present moment. It is for habits, routines and repeated actions. The core task is to build positive, question and negative forms automatically."
        },
        cards: [
          {
            title: { ru: "Дух времени", en: "Time sense" },
            body: {
              ru: "Действие происходит обычно, регулярно, иногда, часто, редко, всегда или никогда. Это не “сейчас”, а повторяемость.",
              en: "The action happens usually, regularly, sometimes, often, seldom, always or never. It is not happening right now; it is repeated."
            },
            formula: "usually / often / never / every day / on Sundays"
          },
          {
            title: { ru: "Утверждение", en: "Positive" },
            body: {
              ru: "Для I/you/we/they берем базовый глагол. Для he/she/it добавляем -s или -es.",
              en: "Use the base verb with I/you/we/they. Add -s or -es with he/she/it."
            },
            formula: "I/you/we/they + V · he/she/it + V-s",
            example: {
              ru: "Я часто читаю. Он часто читает.",
              en: "I often read. He often reads."
            }
          },
          {
            title: { ru: "Вопрос", en: "Question" },
            body: {
              ru: "Вопрос строится через do/does. После do/does смысловой глагол всегда возвращается в базовую форму.",
              en: "Build questions with do/does. After do/does the main verb always returns to its base form."
            },
            formula: "do/does + subject + V",
            example: {
              ru: "Он часто читает? - Does he often read?",
              en: "Does he often read?"
            }
          },
          {
            title: { ru: "Отрицание", en: "Negative" },
            body: {
              ru: "Отрицание тоже держится на do/does: don't или doesn't. После них снова базовый глагол без -s.",
              en: "Negatives also use do/does: don't or doesn't. After them the verb is again in the base form without -s."
            },
            formula: "do not / does not + V",
            example: {
              ru: "Он не читает. - He doesn't read.",
              en: "He doesn't read."
            }
          }
        ],
        examples: [
          {
            ru: "Я часто пью кофе.",
            en: "I often drink coffee. Do I often drink coffee? I don't often drink coffee.",
            note: {
              ru: "Трехмерная отработка: утверждение, вопрос, отрицание.",
              en: "Three-part drilling: positive, question, negative."
            }
          },
          {
            ru: "Зимой рано темнеет?",
            en: "Does it get dark early in winter?",
            note: {
              ru: "В вопросе does уже забирает -s, поэтому get без окончания.",
              en: "In a question does carries the -s, so get has no ending."
            }
          },
          {
            ru: "Мы никогда не играем в теннис.",
            en: "We never play tennis.",
            note: {
              ru: "В английском здесь одно отрицание: never. Не добавляем don't.",
              en: "English uses one negative here: never. Do not add don't."
            }
          }
        ],
        pitfalls: [
          {
            title: { ru: "Русская логика сбивает", en: "Russian logic trap" },
            body: {
              ru: "В русском вопрос часто меняется только интонацией. В английском вопросу нужен вспомогательный глагол: do или does.",
              en: "Russian can form questions mostly with intonation. English needs an auxiliary: do or does."
            },
            formula: "Ты играешь? -> Do you play?"
          },
          {
            title: { ru: "Не удваивай -s", en: "Do not double the -s" },
            body: {
              ru: "Если есть does или doesn't, окончание -s уже “использовано”. Нельзя говорить Does he plays?",
              en: "If you use does or doesn't, the -s is already used. Do not say Does he plays?"
            },
            formula: "Does he play? · He doesn't play."
          },
          {
            title: { ru: "Частотные слова", en: "Frequency words" },
            body: {
              ru: "Usually, often, seldom, always, never обычно стоят перед смысловым глаголом, но very often / quite often часто уходят в конец.",
              en: "Usually, often, seldom, always and never usually go before the main verb, while very often / quite often often go at the end."
            },
            formula: "I often read. · I read very often."
          }
        ],
        method: {
          ru: [
            "Пойми ситуацию: это привычка или повторяемое действие.",
            "Собери письменный вариант и проверь формулу.",
            "Проговори вслух: утверждение -> вопрос -> отрицание.",
            "Повтори фразы ТР2 уже в потоке: русская фраза внутри, английская фраза вслух."
          ],
          en: [
            "Understand the situation: it is a habit or repeated action.",
            "Build the written version and check the formula.",
            "Say it aloud: positive -> question -> negative.",
            "Repeat Speech Drill 2 in flow: Russian inside, English aloud."
          ]
        }
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
      targetText: lessonOneIdioms.map((item) => item.en).join(", "),
      acceptedAnswers: [],
      notes: {
        ru: vocabularyNotes(lessonOneIdioms),
        en: lessonOneIdioms.map((item) => `${item.en} - ${item.ru}`)
      },
      vocabulary: lessonOneIdioms
    },
    {
      id: "l1-vocabulary-minimum",
      type: "vocabulary",
      label: {
        ru: "Лексический минимум",
        en: "Core vocabulary"
      },
      prompt: {
        ru: "Прослушай и проговори лексический минимум урока.",
        en: "Listen to and say the lesson core vocabulary."
      },
      hint: {
        ru: "Сначала слушай английский, затем повторяй вслух. Эти слова будут встречаться в упражнениях.",
        en: "Listen to the English first, then repeat aloud. These words appear in the exercises."
      },
      targetText: lessonOneVocabularyItems.map((item) => item.en).join(", "),
      acceptedAnswers: [],
      notes: {
        ru: vocabularyNotes(lessonOneVocabularyItems),
        en: lessonOneVocabularyItems.map((item) => `${item.en} - ${item.ru}`)
      },
      vocabulary: lessonOneVocabularyItems
    },
    ...techniqueOne.map(makeTechniqueOneStep),
    ...techniqueOne.map(makeTechniqueOneSpeakingStep),
    {
      id: "l1-compose-own-sentences",
      type: "composition",
      label: {
        ru: "Свои фразы",
        en: "Own sentences"
      },
      prompt: {
        ru: "Составь 10-20 своих предложений по образцу Техники речи 1.",
        en: "Create 10-20 own sentences using Speech Drill 1 as the model."
      },
      sourceText: "Используя новые слова и выражения, самостоятельно составить 10-20 предложений по образцу «Техники речи 1».",
      hint: {
        ru: "В каждой строке нужна трехмерная отработка: утверждение, вопрос, отрицание. AI-коуч подскажет, где подумать, но не даст готовый ответ сразу.",
        en: "Each line needs the three-part pattern: positive, question, negative. The AI coach will guide you without giving the finished answer immediately."
      },
      targetText: "I often drink coffee. Do I often drink coffee? I don't often drink coffee.",
      acceptedAnswers: [],
      notes: {
        ru: [
          "Это пункт 3 алгоритма книги: ты уже не переводишь готовые фразы, а сам собираешь речь из новой лексики.",
          "Цель - научиться самому производить фразы по ПЛФ, а не узнавать правильный ответ."
        ],
        en: [
          "This is step 3 of the book algorithm: you no longer translate ready-made sentences; you build speech from new vocabulary.",
          "The goal is to produce sentences by the speech pattern yourself, not just recognize the right answer."
        ]
      },
      composition: {
        minSentences: 10,
        maxSentences: 20,
        model: {
          ru: "I often drink coffee. Do I often drink coffee? I don't often drink coffee.",
          en: "I often drink coffee. Do I often drink coffee? I don't often drink coffee."
        },
        requirements: {
          ru: [
            "10-20 строк.",
            "Каждая строка: утверждение, вопрос, отрицание.",
            "Используй лексику и идиомы урока.",
            "Проверь do/does и окончание -s у he/she/it.",
            "Не копируй один и тот же шаблон механически."
          ],
          en: [
            "10-20 lines.",
            "Each line: positive, question, negative.",
            "Use the lesson vocabulary and idioms.",
            "Check do/does and the -s ending with he/she/it.",
            "Do not copy the same pattern mechanically."
          ]
        }
      }
    },
    ...techniqueTwo.map(makeTechniqueTwoStep),
    ...techniqueTwo.map(makeTechniqueTwoSpeakingStep)
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
    sourcePhrase: "Русская фраза",
    theoryCore: "Главная идея",
    theoryExamples: "Примеры",
    theoryExamplesTitle: "Как формула работает в живой фразе",
    understood: "Понял, продолжить",
    answerPlaceholder: "Напиши ответ на английском...",
    compositionPlaceholder: "Строка",
    compositionCheck: "Проверить мои фразы",
    compositionLoading: "AI-коуч проверяет фразы по сократовскому методу...",
    compositionTitle: "Своя речь",
    compositionTheory: "Короткая теория перед исправлением",
    compositionQuestions: "Что исправить самому",
    compositionEnough: "Заполни минимум 10 строк.",
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
    selfRecordingTitle: "Твоя запись",
    selfRecordingBody: "Сравни себя с эталоном: сначала послушай свою речь, затем медленный и обычный эталон.",
    playSelfRecording: "Прослушать себя",
    pronunciationTitle: "Произношение",
    playNative: "Проиграть эталон",
    playNativeSlow: "Эталон медленно",
    playNativeNormal: "Эталон обычно",
    playNativeAgainSlow: "Повторить медленно",
    playNativeAgainNormal: "Повторить обычно",
    nativeAudioLoading: "Генерирую британский эталон через ElevenLabs...",
    nativeAudioLoadingShort: "Генерирую...",
    nativeAudioReady: "Эталон готов",
    nativeAudioFailed: "Не удалось проиграть эталон.",
    nativeAudioVoice: "Голос",
    nativeAudioSlow: "Медленно",
    nativeAudioNormal: "Обычно",
    referenceHidden: "Английский эталон скрыт. Скажи по-английски сам, затем при необходимости сверся.",
    showReference: "Показать эталон",
    hideReference: "Скрыть эталон",
    activeProfile: "Профиль",
    addProfile: "Добавить локальный профиль",
    newProfilePrompt: "Имя нового профиля",
    loadingSession: "Проверяю сессию",
    authLabel: "Вход",
    loginTitle: "Войдите в тренажер",
    username: "Логин",
    password: "Пароль",
    signIn: "Войти",
    signingIn: "Вхожу...",
    loginFailed: "Не удалось войти.",
    logout: "Выйти",
    more: "Служебное меню",
    adminTitle: "Пользователи",
    adminSubtitle: "Создание учебных аккаунтов",
    createUser: "Создать ученика",
    userCreated: "Пользователь создан.",
    userCreateFailed: "Не удалось создать пользователя.",
    localProfilesTitle: "Текущий этап",
    localProfilesBody:
      "Вход уже серверный. Прогресс пока хранится локально для пользователя; следующим шагом перенесем его в Postgres.",
    stepTypes: {
      theory: "Теория",
      vocabulary: "Лексика",
      composition: "Своя речь",
      translate: "Перевод",
      drill: "Техника речи",
      speaking: "Говорение"
    },
    feedback: {
      exact: "Точно",
      partial: "Можно принять",
      wrong: "Нужно исправить"
    },
    coachLoading: "Разбираю ошибку с AI-коучем...",
    coachFailed: "Не удалось получить разбор ошибки.",
    coachTitle: "Разбор ошибки",
    grammarBrief: "Краткая грамматическая справка",
    bestAnswer: "Лучший вариант"
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
    sourcePhrase: "Russian sentence",
    theoryCore: "Core idea",
    theoryExamples: "Examples",
    theoryExamplesTitle: "How the pattern works in a real sentence",
    understood: "Got it, continue",
    answerPlaceholder: "Write the English answer...",
    compositionPlaceholder: "Line",
    compositionCheck: "Check my sentences",
    compositionLoading: "The AI coach is checking the sentences Socratically...",
    compositionTitle: "Own speech",
    compositionTheory: "Short theory before correction",
    compositionQuestions: "What to fix yourself",
    compositionEnough: "Fill in at least 10 lines.",
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
    selfRecordingTitle: "Your recording",
    selfRecordingBody: "Compare yourself with the reference: play your speech first, then the slow and normal sample.",
    playSelfRecording: "Play my recording",
    pronunciationTitle: "Pronunciation",
    playNative: "Play native sample",
    playNativeSlow: "Slow sample",
    playNativeNormal: "Normal sample",
    playNativeAgainSlow: "Replay slow",
    playNativeAgainNormal: "Replay normal",
    nativeAudioLoading: "Generating a British reference sample with ElevenLabs...",
    nativeAudioLoadingShort: "Generating...",
    nativeAudioReady: "Sample ready",
    nativeAudioFailed: "Could not play the reference sample.",
    nativeAudioVoice: "Voice",
    nativeAudioSlow: "Slow",
    nativeAudioNormal: "Normal",
    referenceHidden: "The English reference is hidden. Say it yourself first, then reveal it if needed.",
    showReference: "Show reference",
    hideReference: "Hide reference",
    activeProfile: "Profile",
    addProfile: "Add local profile",
    newProfilePrompt: "New profile name",
    loadingSession: "Checking session",
    authLabel: "Sign in",
    loginTitle: "Sign in to the trainer",
    username: "Username",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    loginFailed: "Could not sign in.",
    logout: "Log out",
    more: "Utility menu",
    adminTitle: "Users",
    adminSubtitle: "Create student accounts",
    createUser: "Create student",
    userCreated: "User created.",
    userCreateFailed: "Could not create user.",
    localProfilesTitle: "Current stage",
    localProfilesBody:
      "Sign-in is now server-backed. Progress is still stored locally per user; next we will move it to Postgres.",
    stepTypes: {
      theory: "Theory",
      vocabulary: "Vocabulary",
      composition: "Own speech",
      translate: "Translation",
      drill: "Speech drill",
      speaking: "Speaking"
    },
    feedback: {
      exact: "Exact",
      partial: "Accepted",
      wrong: "Needs correction"
    },
    coachLoading: "Checking the mistake with the AI coach...",
    coachFailed: "Could not load mistake feedback.",
    coachTitle: "Mistake feedback",
    grammarBrief: "Short grammar note",
    bestAnswer: "Best answer"
  }
};
