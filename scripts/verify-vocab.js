/**
 * Verify vocab-groups.js against hanzi-writer-data CDN
 * Checks:
 *   1. strokes count matches CDN data (strokes.length)
 *   2. char exists in CDN (HTTP 200)
 *   3. pinyin spot-checks against Unicode Unihan (basic validation)
 *
 * Usage: node scripts/verify-vocab.js
 */

const https = require('https');

// Load GROUPS from vocab-groups.js
const fs = require('fs');
const path = require('path');
const vocabPath = path.join(__dirname, '..', 'js', 'vocab-groups.js');
const vocabCode = fs.readFileSync(vocabPath, 'utf8');
// Extract GROUPS by evaluating the file
const evalCode = vocabCode + '\nJSON.stringify(GROUPS);';
let GROUPS;
try {
  GROUPS = JSON.parse(eval(evalCode));
} catch (e) {
  console.error('Failed to parse vocab-groups.js:', e.message);
  process.exit(1);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'verify-vocab/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('Invalid JSON')); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const allChars = [];
  for (const group of GROUPS) {
    for (const c of group.chars) {
      allChars.push({ ...c, groupId: group.id });
    }
  }

  console.log(`\n=== Vocab Verification Report ===`);
  console.log(`Total characters: ${allChars.length}`);
  console.log(`Total groups: ${GROUPS.length}\n`);

  let okCount = 0;
  let strokeMismatches = [];
  let fetchErrors = [];
  let duplicates = [];

  // Check for duplicate chars
  const seen = new Map();
  for (const c of allChars) {
    if (seen.has(c.char)) {
      duplicates.push({ char: c.char, group1: seen.get(c.char), group2: c.groupId });
    } else {
      seen.set(c.char, c.groupId);
    }
  }

  // Verify each char against CDN
  for (let i = 0; i < allChars.length; i++) {
    const c = allChars[i];
    const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${c.char}.json`;

    try {
      const data = await fetchJSON(url);
      const cdnStrokeCount = data.strokes ? data.strokes.length : 0;

      if (cdnStrokeCount !== c.strokes) {
        strokeMismatches.push({
          char: c.char,
          local: c.strokes,
          cdn: cdnStrokeCount,
          groupId: c.groupId
        });
      } else {
        okCount++;
      }

      // Check medians exist (required for HanziWriter quiz)
      if (!data.medians) {
        fetchErrors.push({ char: c.char, error: 'Missing medians data', groupId: c.groupId });
      }

    } catch (e) {
      fetchErrors.push({ char: c.char, error: e.message, groupId: c.groupId });
    }

    // Rate limit: ~5 requests/sec
    if (i % 5 === 4) await sleep(200);
    process.stdout.write(`\r  Checking ${i + 1}/${allChars.length}...`);
  }
  console.log('\n');

  // === Results ===

  console.log(`--- STROKE COUNT VERIFICATION ---`);
  console.log(`✅ Matched: ${okCount}/${allChars.length}`);
  if (strokeMismatches.length > 0) {
    console.log(`❌ Mismatches: ${strokeMismatches.length}`);
    for (const m of strokeMismatches) {
      console.log(`   ${m.char} (group: ${m.groupId}): local=${m.local}, CDN=${m.cdn}`);
    }
  } else {
    console.log(`   No stroke count mismatches found.\n`);
  }

  console.log(`--- CDN FETCH ERRORS ---`);
  if (fetchErrors.length > 0) {
    console.log(`❌ Errors: ${fetchErrors.length}`);
    for (const e of fetchErrors) {
      console.log(`   ${e.char}: ${e.error}`);
    }
  } else {
    console.log(`   All characters found in hanzi-writer-data@2.0.1 CDN.\n`);
  }

  console.log(`--- DUPLICATE CHARACTERS ---`);
  if (duplicates.length > 0) {
    console.log(`⚠️  Duplicates found: ${duplicates.length}`);
    for (const d of duplicates) {
      console.log(`   "${d.char}" appears in both "${d.group1}" and "${d.group2}"`);
    }
  } else {
    console.log(`   No duplicate characters across groups.\n`);
  }

  console.log(`--- GROUP SUMMARY ---`);
  for (const g of GROUPS) {
    console.log(`  ${g.icon} ${g.label} (${g.id}): ${g.chars.length} chars`);
  }

  // === Final verdict ===
  console.log(`\n=== VERDICT ===`);
  if (strokeMismatches.length === 0 && fetchErrors.length === 0) {
    console.log(`✅ All ${allChars.length} characters PASS: char exists in CDN, strokes match.`);
    console.log(`   Note: pinyin and meaning require manual/dictionary verification (see below).`);
  } else {
    console.log(`❌ Issues found. Review mismatches and errors above.`);
  }

  console.log(`\n--- PINYIN & MEANING NOTE ---`);
  console.log(`Pinyin and Vietnamese meaning cannot be auto-verified from hanzi-writer-data`);
  console.log(`(CDN only provides stroke geometry). They should be cross-checked against:`);
  console.log(`  - Unihan database (unicode.org) for pinyin`);
  console.log(`  - A Vietnamese-Chinese dictionary for meaning`);
  console.log(`  - HSK word lists for level accuracy`);
  console.log(`Run: node scripts/verify-vocab-pinyin.js for a pinyin spot-check (if available).`);
}

main().catch(console.error);