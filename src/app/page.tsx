'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import vocabularyData from '@/data/vocabulary.json';
import { useProgress } from './providers/ProgressProvider';
import { StatsPanel } from '@/components/StatsPanel';
import { ScoreStrip } from '@/components/ScoreStrip';
import { GroupTabs } from '@/components/GroupTabs';
import { CharacterSelector } from '@/components/CharacterSelector';
import { HanziCanvas } from '@/components/HanziCanvas';
import { MascotPanda } from '@/components/MascotPanda';
import { useAudio } from '@/hooks/useAudio';

// Import react-confetti động để tránh lỗi render phía server (SSR)
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Kiểu dữ liệu
interface Character {
  char: string;
  pinyin: string;
  meaning: string;
  strokes: number;
}

interface Group {
  id: string;
  label: string;
  icon: string;
  chars: Character[];
}

export default function GamePage() {
  const {
    xp,
    level,
    streak,
    completedChars,
    isMuted,
    addXp,
    markCharComplete,
    toggleMute,
    resetProgress,
  } = useProgress();

  // Khởi tạo audio sfx
  const { playSFX } = useAudio(isMuted);

  // Load danh sách nhóm từ vựng và màu vẽ nét
  const groups: Group[] = vocabularyData.groups;
  const strokeColors: string[] = vocabularyData.strokeColors;

  // States quản lý chữ đang chọn
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0].id);
  const [activeGroup, setActiveGroup] = useState<Group>(groups[0]);
  const [activeCharName, setActiveCharName] = useState<string>(groups[0].chars[0].char);
  const [activeChar, setActiveChar] = useState<Character>(groups[0].chars[0]);

  // States quản lý điểm số vẽ nét hiện tại của chữ
  const [scoreCorrect, setScoreCorrect] = useState<number>(0);
  const [scoreAttempts, setScoreAttempts] = useState<number>(0);

  // States quản lý trạng thái Game & Mascot
  const [gameMode, setGameMode] = useState<'idle' | 'preview' | 'quiz' | 'done'>('idle');
  const [mascotState, setMascotState] = useState<'idle' | 'preview' | 'quiz' | 'correct' | 'wrong' | 'complete'>('idle');
  const [mascotText, setMascotText] = useState<string>('Chào bạn học sinh chăm chỉ! Hôm nay hãy luyện viết thật vui vẻ nhé! 🐼');

  // Modals
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [fbDifficulty, setFbDifficulty] = useState<string>('');
  const [fbFeatures, setFbFeatures] = useState<string>('');
  const [fbSuccess, setFbSuccess] = useState<boolean>(false);

  // Cập nhật nhóm khi activeGroupId đổi
  useEffect(() => {
    const group = groups.find((g) => g.id === activeGroupId) || groups[0];
    setActiveGroup(group);
    setActiveCharName(group.chars[0].char);
  }, [activeGroupId, groups]);

  // Cập nhật chữ khi activeCharName đổi
  useEffect(() => {
    const char = activeGroup.chars.find((c) => c.char === activeCharName) || activeGroup.chars[0];
    setActiveChar(char);
    // Reset điểm vẽ của chữ này
    setScoreCorrect(0);
    setScoreAttempts(0);
    setGameMode('idle');
    setMascotState('idle');
    setMascotText(getRandomMascotText('welcome'));
  }, [activeCharName, activeGroup]);

  // Mascot phrases
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

  const getRandomMascotText = (state: keyof typeof MASCOT_PHRASES) => {
    const list = MASCOT_PHRASES[state];
    return list[Math.floor(Math.random() * list.length)];
  };

  const handleMascotSpeech = (state: keyof typeof MASCOT_PHRASES, customMessage?: string) => {
    setMascotState(state === 'welcome' ? 'idle' : state);
    if (customMessage) {
      setMascotText(customMessage);
    } else {
      setMascotText(getRandomMascotText(state));
    }
  };

  // Trình phát âm Web Speech API
  const pronounceChar = () => {
    if (isMuted) return;
    if (!activeChar || !activeChar.char) return;
    if (!window.speechSynthesis) {
      handleMascotSpeech('wrong', '⚠️ Trình duyệt không hỗ trợ phát âm. Hãy dùng Chrome hoặc Edge!');
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(activeChar.char);
    utter.lang = 'zh-CN';
    utter.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice =
      voices.find(v => v.lang === 'zh-CN' && v.localService) ||
      voices.find(v => v.lang === 'zh-CN') ||
      voices.find(v => v.lang.startsWith('zh'));
    if (zhVoice) utter.voice = zhVoice;

    window.speechSynthesis.speak(utter);
  };

  // Navigation
  const prevChar = () => {
    const currentIndex = activeGroup.chars.findIndex(c => c.char === activeCharName);
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = activeGroup.chars.length - 1;
    }
    setActiveCharName(activeGroup.chars[newIndex].char);
  };

  const nextChar = () => {
    const currentIndex = activeGroup.chars.findIndex(c => c.char === activeCharName);
    let newIndex = currentIndex + 1;
    if (newIndex >= activeGroup.chars.length) {
      newIndex = 0;
    }
    setActiveCharName(activeGroup.chars[newIndex].char);
  };

  // Gửi feedback giả lập
  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', { fbDifficulty, fbFeatures });
    setFbSuccess(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedback(false);
    setTimeout(() => {
      setFbDifficulty('');
      setFbFeatures('');
      setFbSuccess(false);
    }, 200);
  };

  const handleResetProgress = () => {
    if (confirm('Bạn có chắc chắn muốn xóa hết thành tích và học lại từ đầu không?')) {
      resetProgress();
      setScoreCorrect(0);
      setScoreAttempts(0);
      setGameMode('idle');
      handleMascotSpeech('welcome', 'Đã xóa thành tích. Bắt đầu học lại từ đầu nhé!');
    }
  };

  // Callback điều khiển các sự kiện vẽ nét của HanziCanvas
  const handleCorrectStroke = useCallback((strokeNum: number, _totalStrokes: number) => {
    setScoreCorrect(strokeNum);
    setScoreAttempts((prev) => prev + 1);
    addXp(10);
    handleMascotSpeech('correct');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addXp]);

  const handleWrongStroke = useCallback(() => {
    setScoreAttempts((prev) => prev + 1);
    handleMascotSpeech('wrong');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = useCallback(() => {
    const isNew = markCharComplete(activeChar.char);
    if (isNew) {
      addXp(100);
    }
    handleMascotSpeech('complete');
    // Tự động phát âm khi viết hoàn tất chữ Hán để ghi nhớ sâu sắc
    setTimeout(() => {
      pronounceChar();
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChar, markCharComplete, addXp]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Hiệu ứng hoa giấy chúc mừng khi hoàn thành chữ */}
      {gameMode === 'done' && (
        <Confetti
          numberOfPieces={120}
          recycle={false}
          width={typeof window !== 'undefined' ? window.innerWidth : 600}
          height={typeof window !== 'undefined' ? window.innerHeight : 600}
        />
      )}

      {/* 1. Stats Panel */}
      <StatsPanel
        xp={xp}
        level={level}
        streak={streak}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHelp={() => setShowHelp(true)}
      />

      <div className="container">
        {/* 2. Score Strip */}
        <ScoreStrip
          correctStrokes={scoreCorrect}
          totalAttempts={scoreAttempts}
          completedCount={completedChars.length}
        />

        {/* 3. Group Tabs */}
        <GroupTabs
          groups={groups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroupId}
          disabled={gameMode === 'preview' || gameMode === 'quiz'}
        />

        {/* 4. Character Selector */}
        <CharacterSelector
          chars={activeGroup.chars}
          activeChar={activeCharName}
          onSelectChar={setActiveCharName}
          disabled={gameMode === 'preview' || gameMode === 'quiz'}
        />

        {/* 5. Main Game Card */}
        <div className="main-card">
          <div className={`mode-badge ${
            gameMode === 'preview' ? 'badge-preview' :
            gameMode === 'quiz' ? 'badge-quiz' :
            gameMode === 'done' ? 'badge-done' : 'badge-preview'
          }`}>
            {gameMode === 'preview' ? 'Xem trước' :
             gameMode === 'quiz' ? 'Luyện viết' :
             gameMode === 'done' ? 'Hoàn thành' : 'Sẵn sàng'}
          </div>

          {/* Char Info */}
          <div className="char-info">
            <div className="char-display">{activeChar.char}</div>
            <div className="char-pinyin">{activeChar.pinyin}</div>
            
            <div className="char-pronounce-row">
              <button 
                type="button"
                className="btn-side-animate btn-side-vertical"
                disabled={gameMode === 'preview' || gameMode === 'quiz' || gameMode === 'done'}
                onClick={() => {
                  setGameMode('preview');
                  handleMascotSpeech('preview');
                }}
              >
                🖌️ Xem nét
              </button>
              <button 
                type="button"
                className="btn-pronounce"
                onClick={pronounceChar}
                disabled={gameMode === 'preview'}
              >
                🔊 Phát âm
              </button>
              <button 
                type="button"
                className="btn-side-quiz btn-side-vertical"
                disabled={gameMode === 'preview' || gameMode === 'quiz' || gameMode === 'done'}
                onClick={() => {
                  setGameMode('quiz');
                  handleMascotSpeech('quiz');
                }}
              >
                ✏️ Luyện viết
              </button>
            </div>
            
            <div className="char-meaning">{activeChar.meaning}</div>
            <div className="stroke-count-badge">{activeChar.strokes} nét</div>
          </div>

          {/* Canvas Area Container */}
          <div className="canvas-area-container">
            <button 
              type="button"
              className="btn btn-floating-nav"
              onClick={prevChar}
              disabled={gameMode === 'preview' || gameMode === 'quiz'}
            >
              ⬅️
            </button>

            {/* HanziWriter Canvas vẽ chữ */}
            <HanziCanvas
              character={activeChar.char}
              gameMode={gameMode}
              onModeChange={setGameMode}
              onCorrectStroke={handleCorrectStroke}
              onWrongStroke={handleWrongStroke}
              onComplete={handleComplete}
              playSFX={playSFX}
              onNextChar={nextChar}
              strokeColors={strokeColors}
            />

            <button 
              type="button"
              className="btn btn-floating-nav"
              onClick={nextChar}
              disabled={gameMode === 'preview' || gameMode === 'quiz'}
            >
              ➡️
            </button>
          </div>

          {/* 6. Mascot Gấu Trúc SVG & Bong Bóng Thoại */}
          <MascotPanda state={mascotState} message={mascotText} />

          {/* Tiến độ viết dưới dạng thanh ngang */}
          <div className="progress-section">
            <div className="progress-label">
              <span>Tiến độ viết</span>
              <span>{scoreCorrect} / {activeChar.strokes}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(scoreCorrect / activeChar.strokes) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Nút reset chữ */}
          <div className="controls">
            <button 
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setGameMode('idle');
                setScoreCorrect(0);
                setScoreAttempts(0);
                handleMascotSpeech('welcome', 'Đã làm lại chữ này.');
              }}
              disabled={gameMode === 'preview' || gameMode === 'quiz'}
            >
              🔄 Làm lại
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleResetProgress}
              disabled={gameMode === 'preview' || gameMode === 'quiz'}
              style={{ marginLeft: '8px' }}
            >
              🧹 Học lại từ đầu
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '12px 0 18px',
          fontSize: '0.75rem',
          color: '#aaa',
          letterSpacing: '0.04em',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center'
        }}>
          <div>made by <a href="https://github.com/tranhieutt" target="_blank" rel="noopener" style={{ color: '#aaa', textDecoration: 'none' }}>tranhieutt</a></div>
          <div>
            <button 
              type="button"
              className="footer-feedback-btn" 
              onClick={() => setShowFeedback(true)}
            >
              Bạn muốn góp ý sản phẩm?
            </button>
          </div>
        </footer>
      </div>

      {/* Help Modal */}
      <div className={`modal-backdrop ${showHelp ? 'show' : ''}`}>
        <div className="modal-card">
          <button type="button" className="modal-close" onClick={() => setShowHelp(false)}>&times;</button>
          <h3 className="modal-title">🎨 Cách chơi & Học viết chữ</h3>
          <div className="modal-body">
            <div className="help-step">
              <span className="step-num">1</span>
              <p>Chọn một <strong>chủ đề</strong> ở phía trên (ví dụ: Thiên nhiên, Số đếm...).</p>
            </div>
            <div className="help-step">
              <span className="step-num">2</span>
              <p>Chọn <strong>chữ Hán</strong> bạn muốn học trong danh sách chữ hiển thị.</p>
            </div>
            <div className="help-step">
              <span className="step-num">3</span>
              <p>Bấm <strong>🖌 Xem nét</strong> để xem hướng dẫn thứ tự các nét bút tự động.</p>
            </div>
            <div className="help-step">
              <span className="step-num">4</span>
              <p>Bấm <strong>✏️ Luyện viết</strong> và vẽ theo đúng thứ tự. Mỗi nét viết đúng sẽ được tô màu riêng rực rỡ và cho bạn điểm <strong>XP</strong>!</p>
            </div>
            <div className="help-step">
              <span className="step-num">5</span>
              <p>Luyện tập hàng ngày để tích lũy điểm XP tăng cấp và duy trì chuỗi <strong>Streak 🔥</strong> nhé!</p>
            </div>
          </div>
          <button type="button" className="btn btn-primary modal-ok-btn" onClick={() => setShowHelp(false)}>Bắt đầu học ngay!</button>
        </div>
      </div>

      {/* Feedback Modal */}
      <div className={`modal-backdrop ${showFeedback ? 'show' : ''}`}>
        <div className="modal-card">
          <button type="button" className="modal-close" onClick={closeFeedbackModal}>&times;</button>
          <h3 className="modal-title" style={{ marginBottom: '12px' }}>📝 Góp ý sản phẩm</h3>
          
          {!fbSuccess ? (
            <form onSubmit={submitFeedback}>
              <div className="modal-body" style={{ gap: '12px', marginBottom: '18px' }}>
                <div className="feedback-field">
                  <label className="feedback-label" htmlFor="fb-difficulty">Bạn có gặp khó khăn gì khi sử dụng không?</label>
                  <textarea 
                    className="feedback-textarea" 
                    id="fb-difficulty" 
                    value={fbDifficulty}
                    onChange={(e) => setFbDifficulty(e.target.value)}
                    placeholder="Ví dụ: Vẽ nét chưa nhạy, game tải chậm..." 
                    required 
                  />
                </div>
                <div className="feedback-field">
                  <label className="feedback-label" htmlFor="fb-features">Bạn muốn sản phẩm có thêm tính năng gì?</label>
                  <textarea 
                    className="feedback-textarea" 
                    id="fb-features" 
                    value={fbFeatures}
                    onChange={(e) => setFbFeatures(e.target.value)}
                    placeholder="Ví dụ: Chế độ ôn tập từ vựng, bảng xếp hạng..." 
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary modal-ok-btn">Cảm ơn bạn - Gửi</button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ marginBottom: '12px' }}>
                <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px', transform: 'scale(1.1)' }}>
                  <circle cx="50" cy="55" r="33" fill="#ffffff" stroke="#21394f" strokeWidth={3} />
                  <circle cx="23" cy="29" r="11" fill="#21394f" />
                  <circle cx="77" cy="29" r="11" fill="#21394f" />
                  <circle cx="23" cy="29" r="6" fill="#ead8bd" />
                  <circle cx="77" cy="29" r="6" fill="#ead8bd" />
                  <ellipse cx="38" cy="49" rx="8" ry="10" transform="rotate(-15 38 49)" fill="#21394f" />
                  <ellipse cx="62" cy="49" rx="8" ry="10" transform="rotate(15 62 49)" fill="#21394f" />
                  <circle cx="39" cy="48" r="3" fill="#ffffff" />
                  <circle cx="61" cy="48" r="3" fill="#ffffff" />
                  <circle cx="39" cy="48" r="1.2" fill="#21394f" />
                  <circle cx="61" cy="48" r="1.2" fill="#21394f" />
                  <ellipse cx="50" cy="58" rx="4.5" ry="3" fill="#21394f" />
                  <path d="M44 61 Q50 67 56 61" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
                  <circle cx="26" cy="57" r="3.5" fill="#f3d1cc" />
                  <circle cx="74" cy="57" r="3.5" fill="#f3d1cc" />
                </svg>
              </div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ds-ink)', marginBottom: '8px' }}>Cảm ơn bạn rất nhiều!</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--ds-ink)', lineHeight: 1.45, marginBottom: '20px' }}>Ý kiến đóng góp của bạn đã được ghi nhận. Tớ sẽ cố gắng cải thiện game tốt hơn mỗi ngày! 🐼</p>
              <button type="button" className="btn btn-primary modal-ok-btn" onClick={closeFeedbackModal}>Đóng</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
