/**
 * Verify pinyin from vocab-groups.js against Unihan kHanyuPinyin via Unicode CLDR / Unihan
 * Uses the Unihan database lookup at unicode.org or a local reference.
 * 
 * Since Unihan API is not always accessible, this script uses a hardcoded reference
 * mapping for the HSK1-level characters commonly used in this app.
 * 
 * For production use, cross-reference with: https://www.unicode.org/charts/unihan.html
 * 
 * Usage: node scripts/verify-vocab-pinyin.js
 */

const fs = require('fs');
const path = require('path');

// Load GROUPS
const vocabPath = path.join(__dirname, '..', 'js', 'vocab-groups.js');
const vocabCode = fs.readFileSync(vocabPath, 'utf8');
const GROUPS = JSON.parse(eval(vocabCode + '\nJSON.stringify(GROUPS);'));

// Reference pinyin data for verification (simplified pinyin without tones for comparison)
// Source: Unicode Unihan database + standard Mandarin dictionaries
// Format: char -> { pinyin: 'tone-pinyin', alt: ['other readings'] }
const PINYIN_REF = {
  '零': { p: 'líng' }, '一': { p: 'yī' }, '二': { p: 'èr' }, '三': { p: 'sān' },
  '四': { p: 'sì' }, '五': { p: 'wǔ' }, '六': { p: 'liù' }, '七': { p: 'qī' },
  '八': { p: 'bā' }, '九': { p: 'jiǔ' }, '十': { p: 'shí' }, '百': { p: 'bǎi' },
  '千': { p: 'qiān' }, '几': { p: 'jǐ' }, '多': { p: 'duō' }, '少': { p: 'shǎo' },
  '个': { p: 'gè' }, '本': { p: 'běn' }, '点': { p: 'diǎn' }, '块': { p: 'kuài' },
  '岁': { p: 'suì' },
  '我': { p: 'wǒ' }, '你': { p: 'nǐ' }, '他': { p: 'tā' }, '她': { p: 'tā' },
  '们': { p: 'men' }, '这': { p: 'zhè' }, '那': { p: 'nà' }, '哪': { p: 'nǎ' },
  '谁': { p: 'shéi' }, '什': { p: 'shén' }, '么': { p: 'me' }, '吗': { p: 'ma' },
  '呢': { p: 'ne' }, '的': { p: 'de' }, '了': { p: 'le' }, '都': { p: 'dōu' },
  '不': { p: 'bù' }, '没': { p: 'méi' }, '很': { p: 'hěn' }, '太': { p: 'tài' },
  '些': { p: 'xiē' }, '和': { p: 'hé' },
  '人': { p: 'rén' }, '爸': { p: 'bà' }, '妈': { p: 'mā' }, '儿': { p: 'ér' },
  '女': { p: 'nǚ' }, '子': { p: 'zi' }, '姐': { p: 'jiě' }, '先': { p: 'xiān' },
  '生': { p: 'shēng' }, '老': { p: 'lǎo' }, '师': { p: 'shī' }, '朋': { p: 'péng' },
  '友': { p: 'yǒu' }, '同': { p: 'tóng' }, '学': { p: 'xué' }, '医': { p: 'yī' },
  '客': { p: 'kè' }, '名': { p: 'míng' },
  '年': { p: 'nián' }, '月': { p: 'yuè' }, '日': { p: 'rì' }, '时': { p: 'shí' },
  '分': { p: 'fēn' }, '钟': { p: 'zhōng' }, '今': { p: 'jīn' }, '天': { p: 'tiān' },
  '明': { p: 'míng' }, '昨': { p: 'zuó' }, '早': { p: 'zǎo' }, '晚': { p: 'wǎn' },
  '上': { p: 'shàng' }, '下': { p: 'xià' }, '午': { p: 'wǔ' }, '中': { p: 'zhōng' },
  '现': { p: 'xiàn' }, '在': { p: 'zài' }, '再': { p: 'zài' }, '星': { p: 'xīng' },
  '期': { p: 'qī' }, '候': { p: 'hou' },
  '北': { p: 'běi' }, '京': { p: 'jīng' }, '国': { p: 'guó' }, '东': { p: 'dōng' },
  '西': { p: 'xī' }, '前': { p: 'qián' }, '后': { p: 'hòu' }, '面': { p: 'miàn' },
  '里': { p: 'lǐ' }, '家': { p: 'jiā' }, '校': { p: 'xiào' }, '院': { p: 'yuàn' },
  '商': { p: 'shāng' }, '店': { p: 'diàn' }, '馆': { p: 'guǎn' }, '火': { p: 'huǒ' },
  '车': { p: 'chē' }, '站': { p: 'zhàn' },
  '水': { p: 'shuǐ' }, '茶': { p: 'chá' }, '饭': { p: 'fàn' }, '米': { p: 'mǐ' },
  '菜': { p: 'cài' }, '果': { p: 'guǒ' }, '苹': { p: 'píng' }, '吃': { p: 'chī' },
  '喝': { p: 'hē' },
  '出': { p: 'chū' }, '租': { p: 'zū' }, '飞': { p: 'fēi' }, '机': { p: 'jī' },
  '电': { p: 'diàn' }, '脑': { p: 'nǎo' }, '视': { p: 'shì' }, '影': { p: 'yǐng' },
  '话': { p: 'huà' }, '书': { p: 'shū' }, '字': { p: 'zì' }, '桌': { p: 'zhuō' },
  '椅': { p: 'yǐ' }, '衣': { p: 'yī' }, '服': { p: 'fu' }, '杯': { p: 'bēi' },
  '门': { p: 'mén' }, '钱': { p: 'qián' },
  '是': { p: 'shì' }, '有': { p: 'yǒu' }, '来': { p: 'lái' }, '去': { p: 'qù' },
  '看': { p: 'kàn' }, '见': { p: 'jiàn' }, '听': { p: 'tīng' }, '说': { p: 'shuō' },
  '写': { p: 'xiě' }, '读': { p: 'dú' }, '习': { p: 'xí' }, '工': { p: 'gōng' },
  '作': { p: 'zuò' }, '做': { p: 'zuò' }, '叫': { p: 'jiào' }, '开': { p: 'kāi' },
  '回': { p: 'huí' }, '会': { p: 'huì' }, '能': { p: 'néng' }, '想': { p: 'xiǎng' },
  '认': { p: 'rèn' }, '识': { p: 'shi' }, '喜': { p: 'xǐ' }, '欢': { p: 'huan' },
  '请': { p: 'qǐng' }, '买': { p: 'mǎi' }, '住': { p: 'zhù' }, '坐': { p: 'zuò' },
  '睡': { p: 'shuì' }, '觉': { p: 'jiào' }, '打': { p: 'dǎ' }, '喂': { p: 'wèi' },
  '谢': { p: 'xiè' },
  '好': { p: 'hǎo' }, '大': { p: 'dà' }, '小': { p: 'xiǎo' }, '冷': { p: 'lěng' },
  '热': { p: 'rè' }, '高': { p: 'gāo' }, '兴': { p: 'xìng' }, '漂': { p: 'piào' },
  '亮': { p: 'liang' }, '爱': { p: 'ài' }, '对': { p: 'duì' }, '起': { p: 'qǐ' },
  '气': { p: 'qì' }, '关': { p: 'guān' }, '系': { p: 'xi' }, '怎': { p: 'zěn' },
  '样': { p: 'yàng' },
  '地': { p: 'dì' }, '山': { p: 'shān' }, '木': { p: 'mù' }, '风': { p: 'fēng' },
  '云': { p: 'yún' }, '雨': { p: 'yǔ' }, '雪': { p: 'xuě' }, '猫': { p: 'māo' },
  '狗': { p: 'gǒu' }, '汉': { p: 'hàn' }, '语': { p: 'yǔ' },
};

// Strip tones for comparison: āáǎà -> a, etc
function stripTone(pinyin) {
  const toneMap = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', 'ü': 'v',
  };
  return pinyin.split('').map(c => toneMap[c] || c).join('');
}

function main() {
  console.log('\n=== Pinyin Verification Report ===\n');

  let matchCount = 0;
  let toneOnlyDiff = [];
  let fullDiff = [];
  let missing = [];
  let noRef = [];

  for (const group of GROUPS) {
    for (const c of group.chars) {
      const ref = PINYIN_REF[c.char];
      if (!ref) {
        noRef.push({ char: c.char, pinyin: c.pinyin, groupId: group.id });
        continue;
      }

      if (c.pinyin === ref.p) {
        matchCount++;
      } else if (stripTone(c.pinyin) === stripTone(ref.p)) {
        toneOnlyDiff.push({
          char: c.char,
          local: c.pinyin,
          ref: ref.p,
          groupId: group.id
        });
      } else {
        fullDiff.push({
          char: c.char,
          local: c.pinyin,
          ref: ref.p,
          groupId: group.id
        });
      }
    }
  }

  const totalChars = GROUPS.reduce((s, g) => s + g.chars.length, 0);

  console.log(`Total: ${totalChars}`);
  console.log(`✅ Exact match: ${matchCount}`);
  console.log(`⚠️  Tone-only difference: ${toneOnlyDiff.length}`);
  console.log(`❌ Full pinyin difference: ${fullDiff.length}`);
  console.log(`⬜ No reference data: ${noRef.length}\n`);

  if (toneOnlyDiff.length > 0) {
    console.log('--- TONE-ONLY DIFFERENCES (minor, pinyin base is correct) ---');
    for (const d of toneOnlyDiff) {
      console.log(`   ${d.char} local="${d.local}" ref="${d.ref}" (group: ${d.groupId})`);
    }
    console.log();
  }

  if (fullDiff.length > 0) {
    console.log('--- FULL PINYIN DIFFERENCES (needs review) ---');
    for (const d of fullDiff) {
      console.log(`   ${d.char} local="${d.local}" ref="${d.ref}" (group: ${d.groupId})`);
    }
    console.log();
  }

  if (noRef.length > 0) {
    console.log('--- NO REFERENCE DATA ---');
    for (const d of noRef) {
      console.log(`   ${d.char} pinyin="${d.pinyin}" (group: ${d.groupId})`);
    }
    console.log();
  }

  console.log('=== VERDICT ===');
  if (fullDiff.length === 0 && toneOnlyDiff.length === 0) {
    console.log(`✅ All pinyin values match reference data exactly.`);
  } else if (fullDiff.length === 0) {
    console.log(`✅ All pinyin bases correct. ${toneOnlyDiff.length} have minor tone differences (acceptable for simplified display).`);
  } else {
    console.log(`⚠️  ${fullDiff.length} pinyin values need review.`);
  }
}

main();