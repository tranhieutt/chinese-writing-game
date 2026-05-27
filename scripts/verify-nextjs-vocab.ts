import * as https from 'https';
import { type Character, hskVocabulary } from '../src/data/hskVocabulary';

interface HanziWriterData {
  strokes?: unknown[];
  medians?: unknown[];
}

interface CharacterEntry extends Character {
  level: string;
  groupId: string;
  groupLabel: string;
}

interface StrokeMismatch {
  char: string;
  level: string;
  local: number;
  cdn: number;
  groupId: string;
}

interface FetchError {
  char: string;
  level: string;
  error: string;
  groupId: string;
}

interface DuplicateCharacter {
  char: string;
  level: string;
  group1: string | undefined;
  group2: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function fetchJSON(url: string): Promise<HanziWriterData> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'verify-vocab/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Invalid JSON')); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const allChars: CharacterEntry[] = [];
  
  for (const [level, levelData] of Object.entries(hskVocabulary)) {
    if (!levelData || !levelData.groups) continue;
    for (const group of levelData.groups) {
      for (const c of group.chars) {
        allChars.push({
          ...c,
          level,
          groupId: group.id,
          groupLabel: group.label
        });
      }
    }
  }

  console.log(`\n=== Next.js HSK Vocabulary Verification Report ===`);
  console.log(`Total characters to check: ${allChars.length}\n`);

  let okCount = 0;
  const strokeMismatches: StrokeMismatch[] = [];
  const fetchErrors: FetchError[] = [];
  const duplicates: DuplicateCharacter[] = [];

  // Check for duplicate chars within the same HSK level
  const seenByLevel = new Map<string, Map<string, string>>();
  for (const c of allChars) {
    if (!seenByLevel.has(c.level)) {
      seenByLevel.set(c.level, new Map<string, string>());
    }
    const levelSeen = seenByLevel.get(c.level)!;
    if (levelSeen.has(c.char)) {
      duplicates.push({
        char: c.char,
        level: c.level,
        group1: levelSeen.get(c.char),
        group2: c.groupId
      });
    } else {
      levelSeen.set(c.char, c.groupId);
    }
  }

  // Verify each character against HanziWriter CDN
  for (let i = 0; i < allChars.length; i++) {
    const c = allChars[i];
    const encodedChar = encodeURIComponent(c.char);
    const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodedChar}.json`;

    try {
      const data = await fetchJSON(url);
      const cdnStrokeCount = data.strokes ? data.strokes.length : 0;

      if (cdnStrokeCount !== c.strokes) {
        strokeMismatches.push({
          char: c.char,
          level: c.level,
          local: c.strokes,
          cdn: cdnStrokeCount,
          groupId: c.groupId
        });
      } else {
        okCount++;
      }

      if (!data.medians) {
        fetchErrors.push({
          char: c.char,
          level: c.level,
          error: 'Missing medians data',
          groupId: c.groupId
        });
      }
    } catch (error) {
      fetchErrors.push({
        char: c.char,
        level: c.level,
        error: getErrorMessage(error),
        groupId: c.groupId
      });
    }

    // Rate limit to prevent overloading CDN
    if (i % 5 === 4) await sleep(150);
    process.stdout.write(`\r  Checking ${i + 1}/${allChars.length}: ${c.char} (${c.level})...`);
  }
  console.log('\n');

  // === Display Results ===

  console.log(`--- STROKE COUNT VERIFICATION ---`);
  console.log(`✅ Matched: ${okCount}/${allChars.length}`);
  if (strokeMismatches.length > 0) {
    console.log(`❌ Mismatches found: ${strokeMismatches.length}`);
    for (const m of strokeMismatches) {
      console.log(`   [${m.level}] ${m.char} (group: ${m.groupId}): local=${m.local}, CDN=${m.cdn}`);
    }
  } else {
    console.log(`   No stroke count mismatches found.\n`);
  }

  console.log(`--- CDN FETCH ERRORS ---`);
  if (fetchErrors.length > 0) {
    console.log(`❌ Errors found: ${fetchErrors.length}`);
    for (const e of fetchErrors) {
      console.log(`   [${e.level}] ${e.char} (group: ${e.groupId}): ${e.error}`);
    }
  } else {
    console.log(`   All characters loaded successfully from CDN.\n`);
  }

  console.log(`--- DUPLICATE CHARACTERS ---`);
  if (duplicates.length > 0) {
    console.log(`⚠️  Duplicates found: ${duplicates.length}`);
    for (const d of duplicates) {
      console.log(`   [${d.level}] "${d.char}" appears in both "${d.group1}" and "${d.group2}"`);
    }
  } else {
    console.log(`   No duplicate characters found within any HSK level.\n`);
  }

  console.log(`--- LEVEL SUMMARY ---`);
  for (const [level, levelData] of Object.entries(hskVocabulary)) {
    if (!levelData || !levelData.groups) continue;
    let charCount = 0;
    levelData.groups.forEach(g => charCount += g.chars.length);
    console.log(`  📊 ${level.toUpperCase()}: ${levelData.groups.length} groups, ${charCount} total character entries`);
  }

  console.log(`\n=== FINAL VERDICT ===`);
  if (strokeMismatches.length === 0 && fetchErrors.length === 0) {
    console.log(`✅ All ${allChars.length} characters PASS: Exist in CDN, strokes match.`);
    process.exit(0);
  } else {
    console.log(`❌ Issues found. Please resolve stroke mismatches and errors above.`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
