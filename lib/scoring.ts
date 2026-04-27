export type AnswerStatus = "exact" | "partial" | "wrong";

export type AnswerResult = {
  status: AnswerStatus;
  message: string;
  badTokens: string[];
};

export function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bdoes not\b/g, "doesn't")
    .replace(/\bat week-ends\b/g, "at weekends")
    .replace(/\bon weekends\b/g, "at weekends")
    .replace(/[^a-z0-9?' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string) {
  return normalizeAnswer(value).split(" ").filter(Boolean);
}

export function compareAnswer(rawAnswer: string, acceptedAnswers: string[]): AnswerResult {
  const normalized = normalizeAnswer(rawAnswer);
  const accepted = acceptedAnswers.map(normalizeAnswer);

  if (accepted.includes(normalized)) {
    return {
      status: "exact",
      message: "Ответ совпадает с допустимым вариантом.",
      badTokens: []
    };
  }

  const answerTokens = tokenize(rawAnswer);
  const best = accepted
    .map((candidate) => {
      const expectedTokens = candidate.split(" ");
      const expectedSet = new Set(expectedTokens);
      const overlap = answerTokens.filter((token) => expectedSet.has(token)).length;
      const coverage = overlap / Math.max(expectedTokens.length, 1);
      const badTokens = answerTokens.filter((token) => !expectedSet.has(token));
      return { candidate, coverage, badTokens };
    })
    .sort((a, b) => b.coverage - a.coverage)[0];

  if (best && best.coverage >= 0.78) {
    return {
      status: "partial",
      message: "Смысл близкий. Проверь порядок слов, вспомогательный глагол и окончание -s.",
      badTokens: best.badTokens
    };
  }

  return {
    status: "wrong",
    message: "Пока не принимаю ответ. Сначала собери базовую формулу, затем добавь обстоятельства.",
    badTokens: best?.badTokens ?? answerTokens
  };
}
