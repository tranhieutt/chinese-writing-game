// Thư viện HanziWriter Loader
window.__hwReady = false;
window.__hwError = null;

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve(url);
    s.onerror = () => reject(new Error('Failed to load: ' + url));
    document.head.appendChild(s);
  });
}

async function loadHanziWriter() {
  const sources = [
    'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js',
    'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js',
    'https://unpkg.com/hanzi-writer@3.7.3/dist/hanzi-writer.min.js',
    'https://unpkg.com/hanzi-writer@latest/dist/hanzi-writer.min.js'
  ];
  for (const src of sources) {
    try {
      await loadScript(src);
      if (typeof HanziWriter !== 'undefined') {
        console.log('HanziWriter loaded from:', src);
        window.__hwReady = true;
        return;
      }
    } catch (e) {
      console.warn(e.message);
    }
  }
  window.__hwError = 'Không tải được thư viện HanziWriter. Vui lòng kiểm tra kết nối Internet.';
}

// Game State
let currentGroup = GROUPS[0];
let currentChar = currentGroup.chars[0];
let writer = null;
let mode = 'idle';
let strokeTotal = 0;
let strokeDone = 0;
let scoreCorrect = 0;
let scoreAttempts = 0;
let scoreChars = 0;
let completedChars = new Set();

function buildGroupTabs() {
  const tabsEl = document.getElementById('group-tabs');
  tabsEl.innerHTML = '';
  GROUPS.forEach((g, i) => {
    const btn = document.createElement('button');
    btn.className = 'group-tab' + (i === 0 ? ' active' : '');
    btn.innerHTML = `${g.icon} ${g.label} <span class="tab-count">${g.chars.length}</span>`;
    btn.onclick = () => selectGroup(i);
    tabsEl.appendChild(btn);
  });
  updateControlsState();
}

function selectGroup(idx) {
  currentGroup = GROUPS[idx];
  document.querySelectorAll('.group-tab').forEach((b, i) => b.classList.toggle('active', i === idx));
  buildCharSelector();
  selectChar(0);
}

function buildCharSelector() {
  const selector = document.getElementById('char-selector');
  selector.innerHTML = '';
  currentGroup.chars.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'char-btn' + (i === 0 ? ' active' : '');
    btn.innerHTML = `<span class="han">${c.char}</span><span class="viet">${c.meaning.split(' ').slice(1).join(' ')}</span>`;
    btn.onclick = () => selectChar(i);
    selector.appendChild(btn);
  });
  updateControlsState();
}

function selectChar(idx) {
  if (strokeObserver) strokeObserver.disconnect();
  Object.keys(strokeColorMap).forEach(k => delete strokeColorMap[k]);
  currentChar = currentGroup.chars[idx];
  document.querySelectorAll('.char-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
  document.getElementById('char-display').textContent = currentChar.char;
  document.getElementById('char-pinyin').textContent = currentChar.pinyin;
  document.getElementById('char-meaning').textContent = currentChar.meaning;
  document.getElementById('stroke-count-badge').textContent = `${currentChar.strokes} nét`;
  document.getElementById('complete-overlay').classList.remove('show');
  setMode('idle');
  initWriter();
}

function initWriter(onReady) {
  const container = document.getElementById('hanzi-container');
  container.innerHTML = '';
  strokeDone = 0;
  strokeTotal = currentChar.strokes;

  updateProgress(0, strokeTotal);
  buildStrokeDots(strokeTotal);

  writer = HanziWriter.create('hanzi-container', currentChar.char, {
    width: container.parentElement.offsetWidth || 280,
    height: container.parentElement.offsetHeight || 280,
    padding: 20,
    showOutline: true,
    strokeColor: '#21394f',
    outlineColor: '#d9c8b6',
    drawingColor: STROKE_COLORS[0],
    drawingWidth: 6,
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 200,
    showCharacter: false,
    charDataLoader: (char, onComplete) => {
      const dataUrls = [
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${char}.json`,
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${char}.json`,
        `https://unpkg.com/hanzi-writer-data@latest/${char}.json`
      ];
      const tryUrl = (i) => {
        if (i >= dataUrls.length) {
          setStatus('wrong', `❌ Không tải được dữ liệu chữ "${char}"`);
          return;
        }
        fetch(dataUrls[i])
          .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(onComplete)
          .catch(() => tryUrl(i + 1));
      };
      tryUrl(0);
    },
    onLoadCharDataError: (reason) => {
      console.error('Char data error:', reason);
      setStatus('wrong', `❌ Lỗi tải dữ liệu chữ "${currentChar.char}"`);
    }
  });

  initStrokeObserver();

  if (onReady) {
    setTimeout(onReady, 600);
  }
}

function setMode(m) {
  mode = m;
  const badge = document.getElementById('mode-badge');
  badge.className = 'mode-badge';
  if (m === 'preview') { badge.className += ' badge-preview'; badge.textContent = 'Xem trước'; }
  else if (m === 'quiz') { badge.className += ' badge-quiz'; badge.textContent = 'Luyện viết'; }
  else if (m === 'done') { badge.className += ' badge-done'; badge.textContent = 'Hoàn thành'; }
  else { badge.className += ' badge-preview'; badge.textContent = 'Sẵn sàng'; }
  updateControlsState();
}

function updateControlsState() {
  const btnAnimate = document.getElementById('btn-animate');
  const btnQuiz = document.getElementById('btn-quiz');
  const btnReset = document.getElementById('btn-reset');
  const groupTabs = document.querySelectorAll('.group-tab');
  const charBtns = document.querySelectorAll('.char-btn');

  const isLocked = (mode === 'preview' || mode === 'quiz');

  if (btnAnimate) btnAnimate.disabled = isLocked || mode === 'done';
  if (btnQuiz) btnQuiz.disabled = isLocked || mode === 'done';
  if (btnReset) btnReset.disabled = false; // Always allow resetting to break loops or stuck state

  groupTabs.forEach(t => t.disabled = isLocked);
  charBtns.forEach(b => b.disabled = isLocked);
}

function animateStrokes() {
  if (!writer) return;
  setMode('preview');
  setStatus('quiz', '🖌️ Đang xem thứ tự nét...');
  strokeDone = 0;
  updateProgress(0, strokeTotal);
  buildStrokeDots(strokeTotal);
  document.getElementById('complete-overlay').classList.remove('show');
  writer.animateCharacter({
    onComplete: () => {
      setMode('idle');
      setStatus('idle', '✅ Đã xem xong! Nhấn "Luyện viết" để thực hành.');
    }
  });
}

function startQuiz() {
  if (!writer) return;
  setMode('quiz');
  strokeDone = 0;
  document.getElementById('complete-overlay').classList.remove('show');
  updateProgress(0, strokeTotal);
  buildStrokeDots(strokeTotal);
  setStatus('quiz', '✏️ Vẽ nét theo thứ tự đúng trên khung trắng');

  // Reset bản đồ màu
  Object.keys(strokeColorMap).forEach(k => delete strokeColorMap[k]);

  // Đặt màu bút vẽ cho nét đầu tiên
  writer.updateColor('drawingColor', STROKE_COLORS[0]);

  // MutationObserver will handle color reapplication reactively

  writer.quiz({
    onMistake: (strokeData) => {
      scoreAttempts++;
      updateScoreUI();
      setStatus('wrong', `❌ Sai rồi! Thử lại nét ${strokeData.strokeNum + 1}`);
    },
    onCorrectStroke: (strokeData) => {
      scoreCorrect++;
      scoreAttempts++;
      strokeDone = strokeData.strokeNum + 1;
      updateProgress(strokeDone, strokeTotal);
      const strokeColor = STROKE_COLORS[strokeData.strokeNum % STROKE_COLORS.length];
      markStrokeDot(strokeData.strokeNum, 'done', strokeColor);
      updateScoreUI();
      setStatus('correct', `✅ Đúng! Nét ${strokeDone}/${strokeTotal}`);
      // Tô màu nét vừa đúng trong SVG
      colorStrokeSVG(strokeData.strokeNum, strokeColor);
      // Đổi màu bút vẽ cho nét tiếp theo
      const nextColor = STROKE_COLORS[strokeDone % STROKE_COLORS.length];
      writer.updateColor('drawingColor', nextColor);
    },
    onComplete: (summaryData) => {
      if (strokeObserver) strokeObserver.disconnect();
      setMode('done');
      document.getElementById('complete-overlay').classList.remove('show');
      void document.getElementById('complete-overlay').offsetWidth;
      document.getElementById('complete-overlay').classList.add('show');
      document.getElementById('complete-sub').textContent =
        `${strokeTotal} nét · ${summaryData.totalMistakes} lần sai`;
      if (!completedChars.has(currentChar.char)) {
        completedChars.add(currentChar.char);
        scoreChars = completedChars.size;
        document.getElementById('score-chars').textContent = scoreChars;
      }
      updateProgress(strokeTotal, strokeTotal);
      setStatus('complete', `🎉 Tuyệt vời! Đã hoàn thành "${currentChar.char}" — ${currentChar.meaning}`);
    }
  });
}

function resetChar() {
  if (strokeObserver) strokeObserver.disconnect();
  Object.keys(strokeColorMap).forEach(k => delete strokeColorMap[k]);
  document.getElementById('complete-overlay').classList.remove('show');
  setStatus('idle', 'Đã làm mới. Nhấn "Xem nét" hoặc "Luyện viết".');
  setMode('idle');
  initWriter();
}

function updateProgress(done, total) {
  const pct = total > 0 ? (done / total * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${done} / ${total}`;
}

function updateScoreUI() {
  document.getElementById('score-correct').textContent = scoreCorrect;
  document.getElementById('score-attempts').textContent = scoreAttempts;
}

function buildStrokeDots(n) {
  const hint = document.getElementById('stroke-hint');
  hint.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const dot = document.createElement('div');
    dot.className = 'stroke-dot';
    dot.textContent = i + 1;
    dot.id = `dot-${i}`;
    hint.appendChild(dot);
  }
}

// Lưu màu cho từng nét để reapply
const strokeColorMap = {};
let strokeObserver = null;

function initStrokeObserver() {
  if (strokeObserver) {
    strokeObserver.disconnect();
  }
  const container = document.getElementById('hanzi-container');
  if (!container) return;

  strokeObserver = new MutationObserver(() => {
    if (Object.keys(strokeColorMap).length > 0) {
      applyAllStrokeColors();
    }
  });

  strokeObserver.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['fill', 'style', 'class']
  });
}

function colorStrokeSVG(strokeIdx, color) {
  strokeColorMap[strokeIdx] = color;
  applyAllStrokeColors();
}

function applyAllStrokeColors() {
  const svg = document.querySelector('#hanzi-container svg');
  if (!svg) return;

  const topG = svg.querySelector(':scope > g');
  if (!topG) return;

  // Tìm g layer có nhiều g con nhất = character stroke layer
  const layers = Array.from(topG.querySelectorAll(':scope > g'));
  const charLayer = layers.reduce((best, g) =>
    g.querySelectorAll(':scope > g').length > (best ? best.querySelectorAll(':scope > g').length : 0) ? g : best
  , null);

  if (!charLayer) return;

  const strokeGs = charLayer.querySelectorAll(':scope > g');

  Object.entries(strokeColorMap).forEach(([idx, color]) => {
    const g = strokeGs[parseInt(idx)];
    if (!g) return;
    g.querySelectorAll('path').forEach(p => {
      const f = p.getAttribute('fill');
      if (f && f !== 'none' && f !== 'rgba(0,0,0,0)') {
        p.setAttribute('fill', color);
      }
    });
  });
}

function markStrokeDot(idx, cls, color) {
  const dot = document.getElementById(`dot-${idx}`);
  if (dot) {
    dot.className = 'stroke-dot ' + cls;
    if (color && cls === 'done') {
      dot.style.background = color;
      dot.style.borderColor = color;
      dot.style.boxShadow = `2px 3px 0 ${color}66`;
      dot.style.color = 'white';
    }
  }
  const next = document.getElementById(`dot-${idx + 1}`);
  if (next) next.className = 'stroke-dot current';
}

function setStatus(type, msg) {
  const el = document.getElementById('status-box');
  el.className = 'status-box status-' + type;
  el.textContent = msg;
}

// Khởi động khi tải trang
(async function init() {
  buildGroupTabs();
  buildCharSelector();
  buildStrokeDots(currentChar.strokes);
  const dot0 = document.getElementById('dot-0');
  if (dot0) dot0.className = 'stroke-dot current';
  setStatus('idle', '⏳ Đang tải thư viện viết chữ Hán...');

  await loadHanziWriter();

  if (window.__hwError || typeof HanziWriter === 'undefined') {
    setStatus('wrong', '❌ ' + (window.__hwError || 'Không tải được HanziWriter'));
    document.querySelectorAll('.btn').forEach(b => b.disabled = true);
    return;
  }

  initWriter();
  setStatus('idle', 'Nhấn "Xem nét" để xem thứ tự, hoặc "Luyện viết" để bắt đầu');
})();
