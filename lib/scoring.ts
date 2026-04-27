export type AnswerStatus = "exact" | "partial" | "wrong";

export type AnswerResult = {
  status: AnswerStatus;
  message: string;
  badTokens: string[];
};

export type GrammarHint = {
  fragment: string;
  correction: string;
  shortRu: string;
  grammarRu: string;
  category: "grammar" | "word_order" | "vocabulary" | "meaning" | "spelling" | "punctuation";
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

function editDistance(left: string, right: string) {
  const matrix = Array.from({ length: left.length + 1 }, (_, row) =>
    Array.from({ length: right.length + 1 }, (_, column) => (row === 0 ? column : column === 0 ? row : 0))
  );

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return matrix[left.length][right.length];
}

function possibleBaseForms(token: string) {
  const forms = new Set([token]);

  if (token.endsWith("ies") && token.length > 3) {
    forms.add(`${token.slice(0, -3)}y`);
  }

  if (token.endsWith("es") && token.length > 2) {
    forms.add(token.slice(0, -2));
  }

  if (token.endsWith("s") && token.length > 1) {
    forms.add(token.slice(0, -1));
  }

  return [...forms];
}

function expectedVerbAfterAuxiliary(tokens: string[]) {
  const auxiliaries = new Set(["do", "does", "don't", "doesn't"]);
  const subjects = new Set(["i", "you", "we", "they", "he", "she", "it"]);
  const adverbs = new Set(["never", "always", "usually", "often", "sometimes", "seldom", "rarely"]);

  for (let index = 0; index < tokens.length; index += 1) {
    if (!auxiliaries.has(tokens[index])) {
      continue;
    }

    for (let cursor = index + 1; cursor < tokens.length; cursor += 1) {
      const token = tokens[cursor];
      if (subjects.has(token) || adverbs.has(token)) {
        continue;
      }
      return token;
    }
  }

  return "";
}

export function detectGrammarHint(rawAnswer: string, acceptedAnswers: string[]): GrammarHint | null {
  const answerTokens = tokenize(rawAnswer);
  const expectedTokens = tokenize(acceptedAnswers[0] ?? "");
  const hasPresentSimpleAuxiliary = answerTokens.some((token) => ["do", "does", "don't", "doesn't"].includes(token));

  if (!hasPresentSimpleAuxiliary) {
    return null;
  }

  const expectedVerb = expectedVerbAfterAuxiliary(expectedTokens);
  if (!expectedVerb) {
    return null;
  }

  const expectedSet = new Set(expectedTokens);
  const suspiciousToken = answerTokens.find((token) => {
    if (expectedSet.has(token) || token.length < 3) {
      return false;
    }

    return possibleBaseForms(token).some((candidate) => editDistance(candidate, expectedVerb) <= 2);
  });

  if (!suspiciousToken) {
    return null;
  }

  return {
    fragment: suspiciousToken,
    correction: expectedVerb,
    shortRu: "В вопросе Present Simple после do/does смысловой глагол ставится в базовую форму.",
    grammarRu:
      "Формула вопроса: do/does + подлежащее + базовый глагол. Окончание -s/-es переносится на does только для he/she/it, поэтому после do/does пишем wash, а не washes/wathes.",
    category: "grammar"
  };
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
