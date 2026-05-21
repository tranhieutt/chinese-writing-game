# Vocabulary Workflow

Updated: 2026-05-21

Scope: product vocabulary expansion for the Chinese writing game. This file defines process, data ownership, and verification before changing `js/vocab-groups.js` or adding word-level learning.

## Current State

The game currently trains single Chinese characters. `js/vocab-groups.js` stores 87 character entries grouped by topic. HanziWriter and `hanzi-writer-data` provide stroke-order data only; they do not provide vocabulary lists, HSK levels, pinyin, Vietnamese meanings, or word categories.

Update 2026-05-21: HSK1 classic source coverage has been applied. `docs/vocabulary/hsk1-classic-150.md` stores the 150-word source list. The current active game data has 189 unique characters across 10 topic groups, covering all 178 unique Han characters extracted from that source list plus 11 legacy extra characters.

## Goal

Expand vocabulary with traceable source data while preserving the current character-writing loop.

Target direction:

```text
source word list -> normalized word records -> unique character bank -> CDN support check -> game data update -> UI/progress upgrade
```

## Source Selection

Choose one canonical source before editing vocabulary data.

Recommended options:

| Source | Use When | Notes |
| --- | --- | --- |
| HSK classic Level 1, 150 words | Small, beginner-friendly MVP | Common learning target; many items are words, not single characters. |
| HSK 3.0 Band 1 | Newer standard alignment | Larger scope than classic HSK1; needs careful sequencing. |
| User-provided list | Product-specific curriculum | Must include pinyin, Vietnamese meaning, and category decisions. |
| Textbook list | Classroom alignment | Record textbook name, edition, lesson, and page if available. |

Required source note for every expansion:

```text
source_name:
source_url_or_book:
source_version_or_access_date:
selection_rule:
excluded_items:
```

## Normalize Word List

Store source vocabulary as word-level records before extracting characters.

Canonical shape:

```js
{
  word: '学生',
  pinyin: 'xuesheng',
  meaning: 'học sinh',
  level: 'HSK1',
  category: 'people',
  source: 'hsk1-classic'
}
```

Rules:

- Keep `word` as the original Chinese vocabulary item.
- Keep pinyin tone marks or tone numbers consistent across the whole dataset.
- Keep `meaning` short and Vietnamese-first.
- Assign one primary `category` for UI grouping.
- Preserve source identity so future drift is auditable.

## Word To Character Extraction

The current writing engine works on one character at a time. For each word:

```text
学生 -> 学 + 生
中国 -> 中 + 国
谢谢 -> 谢
```

Extraction rules:

- Split words into Unicode Han characters.
- Deduplicate repeated characters within the same word and across the dataset.
- Ignore punctuation, spaces, Latin text, and tone markers.
- Keep reverse links: each character should know which source words use it.
- Do not assume a word is complete because all characters exist; word-level progress is separate.

Suggested derived shape:

```js
{
  char: '学',
  pinyin: 'xue',
  meaning: 'học',
  strokes: 8,
  sourceWords: ['学生', '学习']
}
```

## HanziWriter CDN Support Check

Every character must have stroke data before it enters the active game list.

Check URL pattern:

```text
https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/<char>.json
```

Pass criteria:

- HTTP 200 for each character JSON.
- JSON includes `strokes` and `medians`.
- Local `strokes` value matches actual `strokes.length`, or the local value is corrected.

Unsupported handling:

- Exclude unsupported characters from active writing mode.
- Record excluded characters and reason in the source note.
- Do not silently add a character that fails CDN lookup.

## Data Model Migration

### Phase 1: Character Expansion

Keep the existing UI and data model:

```js
GROUPS = [
  { id, label, icon, chars: [{ char, pinyin, meaning, strokes }] }
]
```

Add characters derived from the chosen source. This gives users more writing practice without changing gameplay.

### Phase 2: Source-Aware Character Bank

Introduce source metadata:

```js
CHARACTER_BANK = [
  { char, pinyin, meaning, strokes, level, categories, sourceWords }
]
```

Generate `GROUPS` from `CHARACTER_BANK` or keep `GROUPS` as a curated view.

### Phase 3: Word Mode

Introduce word-level learning:

```js
WORD_GROUPS = [
  { id, label, icon, words: [{ word, pinyin, meaning, level, category, chars }] }
]
```

Word mode behavior:

- User selects a word.
- App shows word, pinyin, Vietnamese meaning.
- App trains each character in sequence.
- Completion records both character progress and word progress.

## UI Workflow

Recommended product sequence:

1. Keep current character mode.
2. Add HSK/source filter.
3. Add word detail text: "appears in: 学生, 学习".
4. Add word mode after character expansion is stable.
5. Add completion summary: characters completed, words completed, HSK coverage.

Avoid adding word mode before source and character verification are stable.

## Progress And Persistence

Current keys:

| Key | Meaning |
| --- | --- |
| `hz_xp` | Total XP |
| `hz_streak` | Current streak |
| `hz_last_date` | Last completion date |
| `hz_completed_chars` | Completed single characters |
| `hz_muted` | Audio preference |

Future word-mode keys:

| Key | Meaning |
| --- | --- |
| `hz_completed_words` | Completed source words |
| `hz_vocab_source_version` | Dataset version used for migration checks |
| `hz_hsk1_progress` | Optional cached HSK1 progress summary |

Migration rule: existing `hz_completed_chars` must remain readable.

## Verification Checklist

Before claiming vocabulary expansion complete:

- Source file or source note exists.
- Total source words counted.
- Unique characters counted.
- Unsupported characters listed or confirmed none.
- Every active character fetches HanziWriter data.
- Local stroke counts match fetched data.
- No duplicate character entries inside active groups.
- UI still loads first group and first character.
- Preview and quiz work for at least one newly added character.
- localStorage from previous app versions does not break startup.

## Recommended MVP Plan

```text
1. Pick HSK classic Level 1 as source.
2. Create normalized 150-word source file.
3. Extract unique characters.
4. Verify each character against hanzi-writer-data@2.0.1.
5. Add missing supported characters to GROUPS.
6. Update README/CODEMAP with source and counts.
7. Defer word mode until character bank is stable.
```

## Non-Goals For First Expansion

- No backend.
- No account system.
- No automatic sync with external HSK sites at runtime.
- No unsupported character fallback drawing engine.
- No replacing HanziWriter data with custom stroke data.
