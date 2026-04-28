# Editorial Report

Generated from `content/editorial/rules.json`.

## Summary

- Block findings: 744
- Warnings: 51
- Info notes: 10

| Target | Block | Warn | Info |
| --- | ---: | ---: | ---: |
| source-book | 744 | 50 | 0 |
| course-data | 0 | 1 | 10 |
| scoring | 0 | 0 | 0 |

Block findings in `content/source/...` mean the source contains risky material. Block findings in `lib/...` mean application course data needs correction before release.

## source-book

File: `content/source/givental-kak-eto-skazat-po-angliyski-2013.md`

### BLOCK week-days-hyphenated

- Count: 3
- Recommendation: Use the modern closed form `weekdays`; in phrases use `on weekdays`.

| Line | Match | Context |
| ---: | --- | --- |
| 739 | `week-days` | по будням - on week-days; |
| 918 | `week-days` | • по будням - on week-days |
| 13542 | `week-days` | по будням - on week-days |

### BLOCK week-ends-hyphenated

- Count: 6
- Recommendation: Use `weekends`; BrE: `at weekends`, AmE: `on weekends`.

| Line | Match | Context |
| ---: | --- | --- |
| 738 | `week-ends` | по выходным - at week-ends, on one's free days; |
| 9507 | `week-ends` | 3. He often watches TV at week-ends. / Does he often watch TV at |
| 9508 | `week-ends` | week-ends? / He doesn't often watch TV at week-ends. |
| 9508 | `week-ends` | week-ends? / He doesn't often watch TV at week-ends. |
| 9522 | `week-ends` | 10. She usually comes 011 time at week-ends. / Does she usually come |
| 9523 | `week-ends` | on time at week-ends? / She doesn't usually come on time at week­ |

### BLOCK beautify-oneself

- Count: 2
- Recommendation: Do not teach this as a default phrase for makeup. Use `put on makeup` or `do one's makeup`.

| Line | Match | Context |
| ---: | --- | --- |
| 911 | `beautify oneself` | • навести макияж - to make up; to beautify oneself |
| 13212 | `beautify oneself` | навести макияж - to make up; to beautify oneself |

### BLOCK come-in-time-last-minute

- Count: 2
- Recommendation: For `в последнюю минуту`, use `to come at the last minute`. `In time` means before it is too late.

| Line | Match | Context |
| ---: | --- | --- |
| 926 | `to come in time` | • п риходить в последнюю минуту - to come in time |
| 13805 | `to come in time` | приходить в последнюю минуту - to come in time |

### BLOCK do-the-room

- Count: 2
- Recommendation: Use `to clean the room` or `to tidy the room`.

| Line | Match | Context |
| ---: | --- | --- |
| 939 | `to do the room` | • у брать комнату - to do the room |
| 14198 | `to do the room` | убирать комнату - to do the room |

### BLOCK specific-restaurant-with-general-meaning

- Count: 1
- Recommendation: For a general restaurant, use `at a restaurant` or `in a restaurant`. Use `the` only when the restaurant is specific/known.

| Line | Match | Context |
| ---: | --- | --- |
| 9565 | `at the restaurant` | supper at the restaurant fairly (quite often). |

### WARN supper-as-primary

- Count: 15
- Recommendation: `Supper` is possible but dated/regional for many learners. Prefer `dinner` as primary; keep `supper` only as an accepted alternative when appropriate.

| Line | Match | Context |
| ---: | --- | --- |
| 940 | `supper` | • у жинать - to have supper |
| 5271 | `supper` | I'll buy something for supper if I go shopping. |
| 5272 | `supper` | Will I buy something for supper if I go shopping? |
| 5273 | `supper` | I won't buy something for supper if I go shopping. |
| 5325 | `supper` | • купить на ужин - to buy for supper |
| 5646 | `supper` | supper? |
| 5648 | `supper` | ужин. - I wo n't be watching ТV while mummy is making supper. |
| 7083 | `supper` | expained to me how to make supper. Дословно по-русски это звучало |
| 9557 | `supper` | 1 9. She seldom has lunch and never has supper. |
| 9565 | `supper` | supper at the restaurant fairly (quite often). |
| 10017 | `supper` | 7. They often have supper at work. / Do they often have supper at |
| 10017 | `supper` | 7. They often have supper at work. / Do they often have supper at |
| ... | ... | 3 more occurrence(s) omitted |

### WARN seldom-as-primary

- Count: 34
- Recommendation: `Seldom` is correct but formal. Prefer `rarely` as the modern primary beginner pattern; accept `seldom` where the book uses it.

| Line | Match | Context |
| ---: | --- | --- |
| 744 | `seldom` | редко - seldom; |
| 751 | `seldom` | довольно редко - rather seldom; |
| 793 | `seldom` | редко seldom; |
| 796 | `seldom` | Я редко пью кофе. - I seldom drink coffee. |
| 827 | `seldom` | Она редко пьет кофе. - She seldom drinks coffee. |
| 6668 | `seldom` | 5. Luxury buildings are seldom built on the outskirts |
| 7092 | `seldom` | Я редко пишу ей письма. -I seldom write letters to her. |
| 7094 | `seldom` | The letters are seldom written to her. |
| 7417 | `seldom` | This pen is seldom made use of. |
| 7421 | `seldom` | Her presence is seldom taken notice of. |
| 7508 | `seldom` | В этой кровати редко спят. - This bed is seldom slept in. |
| 7509 | `seldom` | Из этой чашки редко пьют. - This cup is seldom drunk out of. |
| ... | ... | 22 more occurrence(s) omitted |

### WARN wash-themselves-default

- Count: 1
- Recommendation: For Russian `умываться`, prefer `wash`, `wash one's face`, or a concrete routine phrase. `Wash themselves` is grammatical but often unnatural as a default.

| Line | Match | Context |
| ---: | --- | --- |
| 9552 | `wash themselves` | 14. They never wash themselves. |

### BLOCK ocr-cyrillic-a-in-english

- Count: 681
- Recommendation: OCR artifact: Cyrillic `а` appears inside an English phrase. Replace with Latin `a`.

| Line | Match | Context |
| ---: | --- | --- |
| 735 | `e а w` | дважды в неделю - twice а week; |
| 736 | `s а m` | 4 раза в месяц - 4 times а month; |
| 829 | `s а l` | Папа много читает. - Daddy reads а lot. |
| 831 | `e а l` | Это мне очень мешает. - It bothers me а lot. |
| 914 | `e а s` | • перекусить - to have а snack |
| 922 | `e а b` | • п ринимать ванну - to take а bath; to have а bath |
| 922 | `e а b` | • п ринимать ванну - to take а bath; to have а bath |
| 923 | `e а s` | • п ринимать душ - to take а shower; to have а shower |
| 923 | `e а s` | • п ринимать душ - to take а shower; to have а shower |
| 1177 | `t а j` | • просто шутка - just а joke |
| 1209 | `m а s` | так: I am а student. |
| 1244 | `s а s` | He is а singer. |
| ... | ... | 669 more occurrence(s) omitted |

### BLOCK ocr-cyrillic-tv

- Count: 45
- Recommendation: OCR artifact: Cyrillic `Т` in `TV`. Use Latin `TV`.

| Line | Match | Context |
| ---: | --- | --- |
| 806 | `ТV` | You usually w atch ТV in the evening. |
| 934 | `ТV` | • смотреть телевизор - to watch ТV |
| 2314 | `ТV` | Не смотри телевизор! - Don't watch ТV! |
| 2534 | `ТV` | Have I been watching ТV since morning? |
| 2535 | `ТV` | I have not been watching ТV since morning. |
| 2959 | `ТV` | I used to watch ТV regularly. |
| 2960 | `ТV` | Did I used to watch ТV regularly? |
| 2961 | `ТV` | I didn't used to watch ТV regularly. |
| 3271 | `ТV` | • I was watching ТV |
| 3284 | `ТV` | I was watching ТV from 2 till 5. |
| 3298 | `ТV` | I was watching ТV while mummy was cooking dinner. |
| 3300 | `ТV` | I was watching ТV while (as) my parents were abusing. |
| ... | ... | 33 more occurrence(s) omitted |

### BLOCK ocr-on-time-011

- Count: 1
- Recommendation: OCR/source artifact around `on time`. Verify against the PDF image and normalize to `on time`.

| Line | Match | Context |
| ---: | --- | --- |
| 9522 | `011 time` | 10. She usually comes 011 time at week-ends. / Does she usually come |

### BLOCK ocr-usually-backslash

- Count: 1
- Recommendation: OCR/source artifact. Use `usually`.

| Line | Match | Context |
| ---: | --- | --- |
| 9516 | `usual\y` | 7. It usually rains in autumn. / Does it usual\y rain in autumn? / It |

## course-data

File: `lib/course.ts`

### WARN wash-themselves-default

- Count: 1
- Recommendation: For Russian `умываться`, prefer `wash`, `wash one's face`, or a concrete routine phrase. `Wash themselves` is grammatical but often unnatural as a default.

| Line | Match | Context |
| ---: | --- | --- |
| 224 | `wash themselves` | alternatives: ["They never wash their faces.", "They never wash themselves."] |

### INFO book-weekend-preposition

- Count: 10
- Recommendation: Acceptable AmE. If lesson is British-first, display `at weekends` as primary and accept `on weekends` as an alternative.

| Line | Match | Context |
| ---: | --- | --- |
| 82 | `on weekends` | { ru: "по выходным", en: "at weekends; on weekends" }, |
| 143 | `on weekends` | alternatives: ["He often watches TV on weekends. Does he often watch TV on weekends? He doesn't often watch TV on weekends."] |
| 143 | `on weekends` | alternatives: ["He often watches TV on weekends. Does he often watch TV on weekends? He doesn't often watch TV on weekends."] |
| 143 | `on weekends` | alternatives: ["He often watches TV on weekends. Does he often watch TV on weekends? He doesn't often watch TV on weekends."] |
| 182 | `on weekends` | "He usually comes on time on weekends. Does he usually come on time on weekends? He doesn't usually come on time on weekends.", |
| 182 | `on weekends` | "He usually comes on time on weekends. Does he usually come on time on weekends? He doesn't usually come on time on weekends.", |
| 182 | `on weekends` | "He usually comes on time on weekends. Does he usually come on time on weekends? He doesn't usually come on time on weekends.", |
| 183 | `on weekends` | "She usually comes on time on weekends. Does she usually come on time on weekends? She doesn't usually come on time on weekends." |
| 183 | `on weekends` | "She usually comes on time on weekends. Does she usually come on time on weekends? She doesn't usually come on time on weekends." |
| 183 | `on weekends` | "She usually comes on time on weekends. Does she usually come on time on weekends? She doesn't usually come on time on weekends." |

## scoring

File: `lib/scoring.ts`

No findings.
