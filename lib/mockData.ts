export type CourseLessonMock = {
  id: string;
  number: number;
  title: string;
  description: string;
  stepCount: number;
  completedSteps: number;
  mastery: number;
};

export type ReviewPhraseMock = {
  id: string;
  russian: string;
  english: string;
  score: number;
};

export type ReviewPatternMock = {
  id: string;
  name: string;
  age: string;
  phrases: ReviewPhraseMock[];
};

export const mockCourseLessons: CourseLessonMock[] = [
  {
    id: "lesson-01",
    number: 1,
    title: "Я делаю это обычно",
    description: "Present Simple, базовая трехмерная сборка и первые speaking reps.",
    stepCount: 74,
    completedSteps: 0,
    mastery: 32
  }
];

export const mockReviewPatterns: ReviewPatternMock[] = [
  {
    id: "past-regular-ed",
    name: "Past Simple regular -ed",
    age: "16 дней",
    phrases: [
      { id: "pr-1", russian: "Я работал вчера.", english: "I worked yesterday.", score: 86 },
      { id: "pr-2", russian: "Она открыла окно.", english: "She opened the window.", score: 81 },
      { id: "pr-3", russian: "Мы закончили поздно.", english: "We finished late.", score: 78 },
      { id: "pr-4", russian: "Они играли утром.", english: "They played in the morning.", score: 84 },
      { id: "pr-5", russian: "Он смотрел новости.", english: "He watched the news.", score: 75 }
    ]
  },
  {
    id: "past-irregular",
    name: "Past Simple irregular verbs",
    age: "11 дней",
    phrases: [
      { id: "pi-1", russian: "Я пошел домой.", english: "I went home.", score: 72 },
      { id: "pi-2", russian: "Она купила книгу.", english: "She bought a book.", score: 79 },
      { id: "pi-3", russian: "Мы видели их.", english: "We saw them.", score: 74 }
    ]
  },
  {
    id: "do-support",
    name: "Past Simple do-support",
    age: "9 дней",
    phrases: [
      { id: "ds-1", russian: "Ты не читал это.", english: "You did not read it.", score: 69 },
      { id: "ds-2", russian: "Он не пришел вчера.", english: "He did not come yesterday.", score: 71 },
      { id: "ds-3", russian: "Они не работали утром.", english: "They did not work in the morning.", score: 76 },
      { id: "ds-4", russian: "Она не открыла письмо.", english: "She did not open the letter.", score: 73 }
    ]
  },
  {
    id: "articles",
    name: "Articles a/the",
    age: "6 дней",
    phrases: [
      { id: "ar-1", russian: "Я купил книгу.", english: "I bought a book.", score: 82 },
      { id: "ar-2", russian: "Книга была на столе.", english: "The book was on the table.", score: 77 }
    ]
  }
];
