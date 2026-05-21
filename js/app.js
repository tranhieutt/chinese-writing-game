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

// Gamification variables
let xp = 0;
let level = 1;
let streak = 0;
let audioCtx = null;
let isMuted = false;

// ── Web Audio API SFX Synthesizer ──
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSFX(type) {
  if (isMuted) return;
  try {
    initAudio();
    const now = audioCtx.currentTime;
    
    if (type === 'correct') {
      // Âm thanh tinh tinh vui tai (nốt C5 -> E5)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'wrong') {
      // Âm thanh trầm rè ngắn báo sai (nốt C3 -> G2)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(130.81, now); // C3
      osc.frequency.linearRampToValueAtTime(98.00, now + 0.15); // G2
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'complete') {
      // Hợp âm arpeggio tươi sáng ăn mừng (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const noteTime = now + (idx * 0.07);
        osc.frequency.setValueAtTime(freq, noteTime);
        
        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);
        
        osc.start(noteTime);
        osc.stop(noteTime + 0.2);
      });
    }
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
}

function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem('hz_muted', isMuted);
  const btn = document.getElementById('mute-toggle');
  if (btn) {
    btn.textContent = isMuted ? '🔇' : '🔊';
  }
  initAudio();
}

// ── Help Modal Handlers ──
function openHelp() {
  const modal = document.getElementById('help-modal');
  if (modal) modal.classList.add('show');
  initAudio();
}

function closeHelp() {
  const modal = document.getElementById('help-modal');
  if (modal) modal.classList.remove('show');
  initAudio();
}

// ── Gamification State & Sync ──
function loadGamification() {
  xp = parseInt(localStorage.getItem('hz_xp') || '0', 10);
  level = Math.floor(xp / 500) + 1;
  
  // Load Completed characters
  const savedCompleted = localStorage.getItem('hz_completed_chars');
  if (savedCompleted) {
    try {
      const arr = JSON.parse(savedCompleted);
      completedChars = new Set(arr);
      scoreChars = completedChars.size;
      const scoreCharsEl = document.getElementById('score-chars');
      if (scoreCharsEl) scoreCharsEl.textContent = scoreChars;
    } catch (e) {
      completedChars = new Set();
    }
  }

  // Load and check Streak
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = localStorage.getItem('hz_last_date');
  streak = parseInt(localStorage.getItem('hz_streak') || '0', 10);
  
  if (lastDate) {
    const diffTime = Math.abs(new Date(todayStr) - new Date(lastDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      streak = 0; // Streak broken
      localStorage.setItem('hz_streak', 0);
    }
  } else {
    streak = 0;
  }
  
  // Audio state
  isMuted = localStorage.getItem('hz_muted') === 'true';
  const muteBtn = document.getElementById('mute-toggle');
  if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : '🔊';

  // Synchronize stats UI
  const xpEl = document.getElementById('user-xp');
  const levelEl = document.getElementById('user-level');
  const streakEl = document.getElementById('user-streak');
  if (xpEl) xpEl.textContent = xp;
  if (levelEl) levelEl.textContent = level;
  if (streakEl) streakEl.textContent = streak;
  
  updateLevelProgressBar();
}

function updateLevelProgressBar() {
  const currentLevelXP = xp % 500;
  const pct = (currentLevelXP / 500) * 100;
  const fillEl = document.getElementById('level-progress-fill');
  if (fillEl) fillEl.style.width = pct + '%';
}

function addXP(amount) {
  xp += amount;
  localStorage.setItem('hz_xp', xp);
  
  const xpEl = document.getElementById('user-xp');
  if (xpEl) xpEl.textContent = xp;
  
  const newLevel = Math.floor(xp / 500) + 1;
  if (newLevel > level) {
    level = newLevel;
    const levelEl = document.getElementById('user-level');
    if (levelEl) levelEl.textContent = level;
    
    // Level up announcement
    setTimeout(() => {
      playSFX('complete');
      updateMascot('welcome', `🎉 Cực đỉnh! Bạn đã thăng cấp lên Cấp ${level}! Chăm viết tiếp nhé! 🐼👑`);
      triggerConfetti();
    }, 400);
  }
  updateLevelProgressBar();
}

function handleStreakAndCompletion() {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = localStorage.getItem('hz_last_date');
  let currentStreak = parseInt(localStorage.getItem('hz_streak') || '0', 10);
  
  if (lastDate !== todayStr) {
    if (lastDate) {
      const diffTime = Math.abs(new Date(todayStr) - new Date(lastDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    streak = currentStreak;
    localStorage.setItem('hz_streak', currentStreak);
    localStorage.setItem('hz_last_date', todayStr);
    
    const streakEl = document.getElementById('user-streak');
    if (streakEl) streakEl.textContent = currentStreak;
  }
}

// ── Mascot Interaction System ──
const MASCOT_PHRASES = {
  welcome: [
    "Chào mừng bạn học sinh chăm chỉ! Hôm nay hãy luyện viết thật vui vẻ nhé! 🐼",
    "Viết chữ Hán thật dễ! Hãy cùng tớ thử sức nào! 🐼",
    "Mỗi nét chữ Hán đều chứa một câu chuyện, hãy cùng vẽ nên nhé! 🎨"
  ],
  preview: [
    "Hãy nhìn nét cọ chạy để ghi nhớ thứ tự vẽ nhé! 🖌️",
    "Quan sát kỹ hướng đi của từng nét bút nha! 👀"
  ],
  quiz: [
    "Đến lượt bạn rồi đó, hãy vẽ nét tiếp theo thật nắn nót nha! ✏️",
    "Hãy vẽ thật chậm rãi và chính xác nào! 🌟"
  ],
  correct: [
    "Tuyệt vời quá! Nét vẽ chuẩn luôn! 🎉",
    "Giỏi lắm! Đúng rồi đó! 🌟",
    "Nét vẽ rất đẹp, tiếp tục nào! 🐼",
    "Chính xác! Bạn học nhanh thật đấy! 🚀"
  ],
  wrong: [
    "Không sao đâu, vẽ lại nét này nhé! 💪",
    "Hơi lệch một chút rồi, thử lại nào!",
    "Cố lên bạn ơi, tớ tin bạn làm được! 🐼",
    "Chú ý hướng nét bút vẽ nha!"
  ],
  complete: [
    "Xuất sắc! Bạn đã viết hoàn chỉnh chữ này rồi! Nhận thêm XP nhé! 🏆",
    "Tuyệt đỉnh! Chữ viết rất đẹp và đúng nét! 🐼🎉"
  ]
};

function updateMascot(state, customMessage) {
  const textEl = document.getElementById('mascot-text');
  if (!textEl) return;
  
  if (customMessage) {
    textEl.textContent = customMessage;
  } else {
    const list = MASCOT_PHRASES[state] || MASCOT_PHRASES.welcome;
    const rand = list[Math.floor(Math.random() * list.length)];
    textEl.textContent = rand;
  }
  
  // Cập nhật class trạng thái cho bong bóng thoại để màu sắc đồng bộ với trạng thái của Mascot
  const bubble = document.getElementById('mascot-bubble');
  if (bubble) {
    let statusClass = 'status-idle';
    if (state === 'preview' || state === 'quiz') statusClass = 'status-quiz';
    else if (state === 'correct') statusClass = 'status-correct';
    else if (state === 'wrong') statusClass = 'status-wrong';
    else if (state === 'complete') statusClass = 'status-complete';
    bubble.className = 'mascot-bubble ' + statusClass;
  }
  
  // Mascot quick bounce animation on dialogue update
  const avatar = document.querySelector('.mascot-avatar');
  if (avatar) {
    avatar.style.animation = 'none';
    void avatar.offsetWidth; // Reflow to reset animation
    avatar.style.animation = 'panda-bounce 0.4s ease-out';
    setTimeout(() => {
      avatar.style.animation = 'panda-bounce 3s infinite ease-in-out';
    }, 400);
  }
}

// ── Confetti Particle Animation ──
let confettiActive = false;
let confettiParticles = [];
let confettiCanvas = null;
let confettiCtx = null;

function resizeConfettiCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = confettiCanvas.parentElement.clientWidth;
    confettiCanvas.height = confettiCanvas.parentElement.clientHeight;
  }
}

function getWriterSize() {
  const container = document.getElementById('hanzi-container');
  if (!container || !container.parentElement) return { width: 280, height: 280 };
  
  const parent = container.parentElement;
  let w = parent.clientWidth || parent.offsetWidth;
  let h = parent.clientHeight || parent.offsetHeight;
  
  // Nếu màn hình mobile rất nhỏ hoặc CSS chưa load xong hoàn toàn gây ra clientWidth = 0, 
  // tính toán kích thước dựa theo viewport
  if (w <= 0 || h <= 0) {
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
      // Dựa theo CSS: width: min(200px, 48vw, 28vh)
      const size = Math.min(200, window.innerWidth * 0.48, window.innerHeight * 0.28);
      w = size;
      h = size;
    } else {
      w = 280;
      h = 280;
    }
  }
  
  return { width: Math.max(120, w), height: Math.max(120, h) };
}

let resizeWriterTimeout;
function resizeHanziWriter() {
  clearTimeout(resizeWriterTimeout);
  resizeWriterTimeout = setTimeout(() => {
    if (writer && typeof HanziWriter !== 'undefined') {
      const size = getWriterSize();
      writer.updateDimensions({ width: size.width, height: size.height });
    }
  }, 100);
}

window.addEventListener('resize', () => {
  resizeConfettiCanvas();
  resizeHanziWriter();
});

function triggerConfetti() {
  if (!confettiCanvas || !confettiCtx) return;
  resizeConfettiCanvas();
  confettiParticles = [];
  const colors = ['#e26d5c', '#f7df98', '#7cb1a4', '#b8c9d4', '#4e88ad', '#c95f66'];
  for (let i = 0; i < 70; i++) {
    confettiParticles.push({
      x: confettiCanvas.width / 2,
      y: confettiCanvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 4,
      r: Math.random() * 4 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008
    });
  }
  if (!confettiActive) {
    confettiActive = true;
    requestAnimationFrame(updateConfetti);
  }
}

function updateConfetti() {
  if (!confettiActive || !confettiCtx || !confettiCanvas) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  let alive = false;
  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.16; // Gravity
    p.vx *= 0.98; // Drag
    p.alpha -= p.decay;
    
    if (p.alpha > 0) {
      alive = true;
      confettiCtx.save();
      confettiCtx.globalAlpha = p.alpha;
      confettiCtx.fillStyle = p.color;
      confettiCtx.beginPath();
      confettiCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      confettiCtx.fill();
      confettiCtx.restore();
    }
  });
  
  if (alive) {
    requestAnimationFrame(updateConfetti);
  } else {
    confettiActive = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// ── Navigation & Control Panel ──
function buildGroupTabs() {
  const tabsEl = document.getElementById('group-tabs');
  tabsEl.innerHTML = '';
  GROUPS.forEach((g, i) => {
    const btn = document.createElement('button');
    btn.className = 'group-tab' + (i === 0 ? ' active' : '');
    btn.innerHTML = `${g.icon} ${g.label} <span class="tab-count">${g.chars.length}</span>`;
    btn.onclick = () => { selectGroup(i); initAudio(); };
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
    btn.onclick = () => { selectChar(i); initAudio(); };
    selector.appendChild(btn);
  });
  updateControlsState();
}

function selectChar(idx) {
  if (strokeObserver) strokeObserver.disconnect();
  Object.keys(strokeColorMap).forEach(k => delete strokeColorMap[k]);
  currentChar = currentGroup.chars[idx];
  document.querySelectorAll('.char-btn').forEach((b, i) => b.classList.toggle('active', i === idx));

  // Tự động cuộn nút từ đang hoạt động vào tầm nhìn (scrollIntoView) mượt mà
  const activeBtn = document.querySelector('.char-btn.active');
  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  document.getElementById('char-display').textContent = currentChar.char;
  document.getElementById('char-pinyin').textContent = currentChar.pinyin;
  document.getElementById('char-meaning').textContent = currentChar.meaning;
  document.getElementById('stroke-count-badge').textContent = `${currentChar.strokes} nét`;
  document.getElementById('complete-overlay').classList.remove('show');
  
  setMode('idle');
  initWriter();
  updateMascot('welcome');
}

function prevChar() {
  if (!currentGroup || !currentGroup.chars.length) return;
  const currentIndex = currentGroup.chars.findIndex(c => c.char === currentChar.char);
  let newIndex = currentIndex - 1;
  if (newIndex < 0) {
    newIndex = currentGroup.chars.length - 1;
  }
  selectChar(newIndex);
  initAudio();
}

function nextChar() {
  if (!currentGroup || !currentGroup.chars.length) return;
  const currentIndex = currentGroup.chars.findIndex(c => c.char === currentChar.char);
  let newIndex = currentIndex + 1;
  if (newIndex >= currentGroup.chars.length) {
    newIndex = 0;
  }
  selectChar(newIndex);
  initAudio();
}

function initWriter(onReady) {
  if (typeof HanziWriter === 'undefined') {
    console.warn("HanziWriter is not loaded yet.");
    return;
  }

  const container = document.getElementById('hanzi-container');
  if (!container) return;
  container.innerHTML = '';
  strokeDone = 0;
  strokeTotal = currentChar.strokes;

  updateProgress(0, strokeTotal);
  buildStrokeDots(strokeTotal);

  const size = getWriterSize();

  writer = HanziWriter.create('hanzi-container', currentChar.char, {
    width: size.width,
    height: size.height,
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
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  const isLocked = (mode === 'preview' || mode === 'quiz');

  if (btnAnimate) btnAnimate.disabled = isLocked || mode === 'done';
  if (btnQuiz) btnQuiz.disabled = isLocked || mode === 'done';
  if (btnReset) btnReset.disabled = false;
  if (btnPrev) btnPrev.disabled = isLocked;
  if (btnNext) btnNext.disabled = isLocked;

  groupTabs.forEach(t => t.disabled = isLocked);
  charBtns.forEach(b => b.disabled = isLocked);
}

function animateStrokes() {
  if (!writer) return;
  initAudio();
  setMode('preview');
  updateMascot('preview');
  setStatus('quiz', '🖌️ Đang xem thứ tự nét...');
  strokeDone = 0;
  updateProgress(0, strokeTotal);
  buildStrokeDots(strokeTotal);
  document.getElementById('complete-overlay').classList.remove('show');
  writer.animateCharacter({
    onComplete: () => {
      setMode('idle');
      updateMascot('welcome');
      setStatus('idle', '✅ Đã xem xong! Nhấn "Luyện viết" để thực hành.');
    }
  });
}

function startQuiz() {
  if (!writer) return;
  initAudio();
  setMode('quiz');
  updateMascot('quiz');
  strokeDone = 0;
  document.getElementById('complete-overlay').classList.remove('show');
  updateProgress(0, strokeTotal);
  buildStrokeDots(strokeTotal);
  setStatus('quiz', '✏️ Vẽ nét theo thứ tự đúng trên khung trắng');

  // Reset bản đồ màu
  Object.keys(strokeColorMap).forEach(k => delete strokeColorMap[k]);

  // Đặt màu bút vẽ cho nét đầu tiên
  writer.updateColor('drawingColor', STROKE_COLORS[0]);

  writer.quiz({
    onMistake: (strokeData) => {
      scoreAttempts++;
      updateScoreUI();
      playSFX('wrong');
      updateMascot('wrong');
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
      
      playSFX('correct');
      updateMascot('correct');
      addXP(10); // +10 XP cho mỗi nét vẽ đúng
      
      setStatus('correct', `✅ Đúng! Nét ${strokeDone}/${strokeTotal}`);
      colorStrokeSVG(strokeData.strokeNum, strokeColor);
      
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
      
      // Lưu trữ chữ đã học
      if (!completedChars.has(currentChar.char)) {
        completedChars.add(currentChar.char);
        scoreChars = completedChars.size;
        document.getElementById('score-chars').textContent = scoreChars;
        localStorage.setItem('hz_completed_chars', JSON.stringify(Array.from(completedChars)));
      }
      
      updateProgress(strokeTotal, strokeTotal);
      setStatus('complete', `🎉 Tuyệt vời! Đã hoàn thành "${currentChar.char}" — ${currentChar.meaning}`);
      
      playSFX('complete');
      triggerConfetti();
      const scoreWordXP = Math.max(0, 100 - summaryData.totalMistakes * 10);
      addXP(scoreWordXP);
      handleStreakAndCompletion();
      updateMascot('complete', `🎉 Hoàn hảo! Bạn nhận được thêm +${scoreWordXP} XP thưởng!`);
    }
  });
}

function resetChar() {
  if (strokeObserver) strokeObserver.disconnect();
  initAudio();
  Object.keys(strokeColorMap).forEach(k => delete strokeColorMap[k]);
  document.getElementById('complete-overlay').classList.remove('show');
  setStatus('idle', 'Đã làm mới. Nhấn "Xem nét" hoặc "Luyện viết".');
  setMode('idle');
  initWriter();
  updateMascot('welcome');
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

// Lưu màu cho từng nét để reapply khi MutationObserver kích hoạt
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
  const bubble = document.getElementById('mascot-bubble');
  const text = document.getElementById('mascot-text');
  if (bubble) {
    bubble.className = 'mascot-bubble status-' + type;
  }
  if (text) {
    text.textContent = msg;
  }
}

// Khởi động khi tải trang
(async function init() {
  confettiCanvas = document.getElementById('confetti-canvas');
  confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  loadGamification();
  buildGroupTabs();
  buildCharSelector();
  buildStrokeDots(currentChar.strokes);
  const dot0 = document.getElementById('dot-0');
  if (dot0) dot0.className = 'stroke-dot current';
  setStatus('idle', '⏳ Đang tải thư viện viết chữ Hán...');
  updateMascot('welcome');

  await loadHanziWriter();

  if (window.__hwError || typeof HanziWriter === 'undefined') {
    setStatus('wrong', '❌ ' + (window.__hwError || 'Không tải được HanziWriter'));
    document.querySelectorAll('.btn').forEach(b => b.disabled = true);
    return;
  }

  initWriter();
  setStatus('idle', 'Nhấn "Xem nét" để xem thứ tự, hoặc "Luyện viết" để bắt đầu');
})();
