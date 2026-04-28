# Editorial Audit

Source: `content/source/givental-kak-eto-skazat-po-angliyski-2013.md`

This file tracks source-book forms that should not be blindly copied into the trainer. The application should teach modern, natural English first and keep older/book variants only when they are still acceptable.

## Lesson 1 Corrections Applied

- `week-days` -> `weekdays`.
  Modern closed spelling is standard. The trainer uses `on weekdays`.

- `week-ends` -> `weekends`.
  Modern closed spelling is standard. The trainer uses British `at weekends` as primary and accepts American `on weekends`.

- `to make up; to beautify oneself` for `навести макияж` -> `to put on makeup; to do one's makeup`.
  `Beautify oneself` is unnatural for a beginner speech pattern.

- `to come in time` for `приходить в последнюю минуту` -> `to come at the last minute`.
  `In time` usually means "not too late / before the deadline", not "at the last minute".

- `to do the room` for `убрать комнату` -> `to clean the room; to tidy the room`.
  `Do the room` is not a good modern learner pattern here.

- `supper` as the main translation of `ужинать` -> `dinner` as primary, `supper` accepted.
  `Supper` is still possible, especially in some British contexts, but `dinner` is the safer modern default.

- `have supper at the restaurant` -> `have dinner at a restaurant`.
  For an unspecified restaurant, use `a restaurant`. `The restaurant` needs a known/specific restaurant.

- `They never wash themselves` -> `They never wash` as primary.
  `Wash themselves` is grammatical but odd as the default for daily-routine Russian `умываться`.

## Source Issues Found

- Page 23 contains `at week-ends` and `on week-days`.
- Page 265 answer keys contain `at week-ends`.
- Page 265 has extraction/source noise around `comes 011 time`, which should be read as `comes on time`.
- Extracted text contains OCR artifacts such as Cyrillic `а` in `twice а week`; do not copy blindly into course data.

## Policy

- Prefer modern closed forms: `weekdays`, `weekends`.
- Accept major British/American preposition variants when natural: `at weekends` and `on weekends`.
- Do not accept visibly misspelled/hyphenated source-book forms as correct answers if they create bad learner patterns.
- When the book uses a valid but dated form, make the modern form primary and add the book form as an accepted alternative only if it will not harm the learner.
