'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { hskVocabulary, strokeColors, Character } from '@/data/hskVocabulary';
import { useProgress } from '@/app/providers/ProgressProvider';
import { StatsPanel } from '@/components/StatsPanel';
import { MascotPanda } from '@/components/MascotPanda';
import { useAudio } from '@/hooks/useAudio';
import { trackEvent } from '@/app/utils/analytics';
import './practice.css';

// Client-only dynamic imports
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
const HanziCanvas = dynamic(
  () => import('@/components/HanziCanvas').then((mod) => mod.HanziCanvas),
  { ssr: false }
);

// Trạng thái Mascot
type MascotStateType = 'idle' | 'preview' | 'quiz' | 'correct' | 'wrong' | 'complete';

export default function PracticePage() {
  const {
    xp,
    level,
    streak,
    isMuted,
    addXp,
    toggleMute,
  } = useProgress();

  const { playSFX } = useAudio(isMuted);

  // States chọn chế độ
  const [selectedHsk, setSelectedHsk] = useState<string>('hsk1');
  const [wordCount, setWordCount] = useState<number>(3);
  const [gameState, setGameState] = useState<'setup' | 'practice' | 'summary'>('setup');

  // States quá trình luyện tập
  const [practiceWords, setPracticeWords] = useState<Character[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scoreCorrect, setScoreCorrect] = useState<number>(0);
  const [scoreAttempts, setScoreAttempts] = useState<number>(0);
  const [canvasMode, setCanvasMode] = useState<'idle' | 'preview' | 'quiz' | 'done'>('idle');

  // Bộ đếm thời gian
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mascot Panda
  const [mascotState, setMascotState] = useState<MascotStateType>('idle');
  const [mascotText, setMascotText] = useState<string>('Chào mừng bạn đến với võ đài luyện chữ ngẫu nhiên tính giờ! Hãy chọn cấp độ và số từ để bắt đầu thử thách nhé! 🐼');

  // Thống kê kết quả
  const [totalStrokesWritten, setTotalStrokesWritten] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [xpEarned, setXpEarned] = useState<number>(0);

  // Kích thước màn hình cho Confetti
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Cleanup Timer và Timeout
  useEffect(() => {
    return () => {
      stopTimer();
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    };
  }, []);

  // ── Logic Timer ──
  const startTimer = () => {
    stopTimer();
    setTimerSeconds(0);
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Định dạng mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Phát âm chữ Hán
  const pronounceChar = (charToPronounce: string) => {
    if (isMuted) return;
    if (!charToPronounce) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(charToPronounce);
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

  // ── Mascot Phrases ──
  const setMascotPhrase = (state: MascotStateType, customText?: string) => {
    setMascotState(state);
    if (customText) {
      setMascotText(customText);
      return;
    }

    const phrases = {
      idle: [
        'Sẵn sàng chưa bạn ơi? Hãy viết thật nắn nót nhé! 🐼',
        'Tập trung cao độ nào! Mỗi chữ là một thử thách!'
      ],
      preview: [
        'Hãy quan sát hướng đi của nét vẽ nhé! 🖌️'
      ],
      quiz: [
        'Đến lượt bạn rồi, vẽ chữ tiếp theo thật chính xác nha! ✏️',
        'Cố lên bạn ơi, nét chữ nắn nót rất đẹp mắt! ✨'
      ],
      correct: [
        'Tuyệt quá! Nét bút rất chuẩn xác! 🎉',
        'Giỏi lắm! Đúng rồi, tiếp tục phát huy nào! 🌟',
        'Đẹp lắm bạn ơi, nét vẽ sắc bén! 🐼'
      ],
      wrong: [
        'Không sao đâu, thử lại nét vừa rồi nhé! 💪',
        'Hơi lệch một chút rồi, vẽ lại nào!',
        'Cố lên, chú ý hướng của nét bút nha!'
      ],
      complete: [
        'Chúc mừng! Bạn đã hoàn thành xuất sắc tất cả chữ Hán! 🏆🐼'
      ]
    };

    const list = phrases[state] || phrases.idle;
    const randomText = list[Math.floor(Math.random() * list.length)];
    setMascotText(randomText);
  };

  // ── Bắt đầu Luyện tập ──
  const handleStartPractice = () => {
    // 1. Thu thập tất cả từ vựng của cấp độ HSK được chọn
    const levelData = hskVocabulary[selectedHsk];
    if (!levelData || levelData.groups.length === 0) {
      alert('Không tìm thấy dữ liệu từ vựng cho cấp độ này!');
      return;
    }

    const allChars: Character[] = [];
    levelData.groups.forEach((group) => {
      group.chars.forEach((char) => {
        // Đảm bảo không trùng chữ
        if (!allChars.some(c => c.char === char.char)) {
          allChars.push(char);
        }
      });
    });

    if (allChars.length < wordCount) {
      alert('Số từ trong cấp độ này không đủ để cấu hình!');
      return;
    }

    // 2. Xáo trộn ngẫu nhiên (Fisher-Yates) và cắt lấy số lượng từ mong muốn
    const shuffled = [...allChars];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectedWords = shuffled.slice(0, wordCount);

    // 3. Khởi tạo states
    setPracticeWords(selectedWords);
    setCurrentIndex(0);
    setScoreCorrect(0);
    setScoreAttempts(0);
    setTotalStrokesWritten(0);
    setSkippedCount(0);
    setXpEarned(0);
    setGameState('practice');
    setCanvasMode('quiz');
    
    // 4. Kích hoạt timer
    startTimer();

    // 5. Thoại mascot
    setMascotPhrase('quiz', `Trận đấu bắt đầu! Tổng cộng có ${wordCount} chữ Hán. Hãy cùng viết chữ đầu tiên: "${selectedWords[0].char}"! 🚀`);
    trackEvent('practice_start', { hsk_level: selectedHsk, word_count: wordCount });
  };

  // ── Vẽ nét đúng ──
  const handleCorrectStroke = useCallback((strokeNum: number, _totalStrokes: number) => {
    setScoreCorrect(strokeNum);
    setScoreAttempts((prev) => prev + 1);
    setTotalStrokesWritten((prev) => prev + 1);
    setMascotPhrase('correct');
    
    // Cộng 10 XP nhỏ cho mỗi nét bút đúng để tăng độ hào hứng
    addXp(10);
    setXpEarned((prev) => prev + 10);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addXp]);

  // ── Vẽ nét sai ──
  const handleWrongStroke = useCallback(() => {
    setScoreAttempts((prev) => prev + 1);
    setMascotPhrase('wrong');
  }, []);

  // ── Hoàn thành một từ ──
  const handleWordComplete = useCallback(() => {
    const currentChar = practiceWords[currentIndex];
    
    // Phát âm chữ vừa viết xong
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    completeTimeoutRef.current = setTimeout(() => {
      pronounceChar(currentChar.char);
    }, 400);

    // Thêm điểm XP thưởng khi viết xong chữ hoàn chỉnh (50 XP)
    addXp(50);
    setXpEarned((prev) => prev + 50);

    // Chuyển sang chữ tiếp theo sau 800ms
    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= practiceWords.length) {
        // Hoàn thành toàn bộ hiệp luyện tập
        handleFinishPractice();
      } else {
        setCurrentIndex(nextIdx);
        setScoreCorrect(0);
        setScoreAttempts(0);
        setCanvasMode('quiz');
        setMascotPhrase('quiz', `Tuyệt đỉnh! Viết tiếp chữ tiếp theo nào: "${practiceWords[nextIdx].char}"! 🐼🐾`);
      }
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, practiceWords, addXp]);

  // ── Bỏ qua chữ hiện tại ──
  const handleSkipWord = () => {
    const currentChar = practiceWords[currentIndex];
    setSkippedCount((prev) => prev + 1);
    trackEvent('practice_skip_word', { char_name: currentChar.char });

    const nextIdx = currentIndex + 1;
    if (nextIdx >= practiceWords.length) {
      handleFinishPractice();
    } else {
      setCurrentIndex(nextIdx);
      setScoreCorrect(0);
      setScoreAttempts(0);
      setCanvasMode('quiz');
      setMascotPhrase('quiz', `Đã bỏ qua chữ vừa rồi. Hãy tiếp tục với chữ: "${practiceWords[nextIdx].char}"! 💪`);
    }
  };

  // ── Dừng giữa chừng / Thoát ──
  const handleQuitPractice = () => {
    if (confirm('Bạn có chắc chắn muốn dừng hiệp luyện tập này không? Tiến độ hiện tại sẽ không được lưu!')) {
      stopTimer();
      setGameState('setup');
      setMascotPhrase('idle', 'Đã dừng hiệp luyện tập. Đừng nản chí nhé, lần sau hãy tiếp tục cố gắng hơn! 🐼🐾');
      trackEvent('practice_quit', { current_progress: `${currentIndex}/${wordCount}` });
    }
  };

  // ── Hoàn thành toàn bộ hiệp đấu ──
  const handleFinishPractice = () => {
    stopTimer();
    
    // Điểm thưởng bonus khi hoàn thành xuất sắc toàn bộ hiệp đấu nhanh
    const timeSpent = timerSeconds;
    let speedBonus = 0;
    const averageTimePerWord = timeSpent / wordCount;

    if (averageTimePerWord < 10) {
      speedBonus = 200; // Tốc độ thần sấm (dưới 10s/từ)
    } else if (averageTimePerWord < 20) {
      speedBonus = 100; // Tốc độ nhanh nhẹn (dưới 20s/từ)
    } else if (averageTimePerWord < 30) {
      speedBonus = 50; // Tốc độ trung bình (dưới 30s/từ)
    }

    if (speedBonus > 0) {
      addXp(speedBonus);
      setXpEarned((prev) => prev + speedBonus);
    }

    setGameState('summary');
    setCanvasMode('done');
    playSFX('correct'); // Reo vui
    setMascotPhrase('complete');
    trackEvent('practice_completed_session', {
      hsk_level: selectedHsk,
      word_count: wordCount,
      time_spent: timeSpent,
      skipped: skippedCount,
      xp_bonus: speedBonus
    });
  };

  // Quay lại setup để chơi hiệp mới
  const handlePlayAgain = () => {
    setGameState('setup');
    setMascotPhrase('idle', 'Chào mừng quay trở lại võ đài! Hãy thiết lập cấu hình mới và bắt đầu nhé! 🐼✨');
  };

  // Render các chấm tiến trình hạt ngọc
  const renderProgressBeads = () => {
    return (
      <div className="jade-beads-container" id="jade-beads-container">
        {practiceWords.map((_, idx) => {
          let beadClass = 'jade-bead';
          if (idx === currentIndex) {
            beadClass += ' active';
          } else if (idx < currentIndex) {
            beadClass += ' completed';
          }
          return <div key={idx} className={beadClass} title={`Từ thứ ${idx + 1}`} />;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Confetti khi hoàn thành summary */}
      {gameState === 'summary' && (
        <Confetti
          numberOfPieces={160}
          recycle={false}
          width={windowSize.width}
          height={windowSize.height}
        />
      )}

      {/* 1. Header Stats Panel */}
      <StatsPanel
        xp={xp}
        level={level}
        streak={streak}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHelp={() => {}}
        currentHsk={selectedHsk}
        onHskChange={(hsk) => {
          if (gameState === 'setup') {
            setSelectedHsk(hsk);
          }
        }}
      />

      <div className="practice-container">
        {/* ── Màn hình 1: Lựa chọn cấu hình (setup) ── */}
        {gameState === 'setup' && (
          <div className="setup-card">
            <h2 className="setup-title">🎯 Luyện Ngẫu Nhiên HSK</h2>
            <p className="setup-desc">Thử thách trí nhớ và tốc độ viết chữ Hán ngẫu nhiên không trùng lặp từ bộ HSK được tuyển chọn.</p>

            <div className="setup-section">
              <div className="setup-section-title">📚 1. Chọn cấp độ HSK</div>
              <div className="hsk-grid">
                <button
                  type="button"
                  id="hsk-level-1"
                  className={`setup-btn ${selectedHsk === 'hsk1' ? 'active' : ''}`}
                  onClick={() => setSelectedHsk('hsk1')}
                >
                  Cấp độ HSK 1
                </button>
                <button
                  type="button"
                  id="hsk-level-2"
                  className={`setup-btn ${selectedHsk === 'hsk2' ? 'active' : ''}`}
                  onClick={() => setSelectedHsk('hsk2')}
                >
                  Cấp độ HSK 2
                </button>
                <button
                  type="button"
                  id="hsk-level-3"
                  className={`setup-btn ${selectedHsk === 'hsk3' ? 'active' : ''}`}
                  onClick={() => setSelectedHsk('hsk3')}
                >
                  Cấp độ HSK 3
                </button>
              </div>
            </div>

            <div className="setup-section">
              <div className="setup-section-title">🔢 2. Chọn số lượng từ ngẫu nhiên</div>
              <div className="words-grid">
                <button
                  type="button"
                  id="word-count-3"
                  className={`setup-btn ${wordCount === 3 ? 'active' : ''}`}
                  onClick={() => setWordCount(3)}
                >
                  3 Từ
                </button>
                <button
                  type="button"
                  id="word-count-5"
                  className={`setup-btn ${wordCount === 5 ? 'active' : ''}`}
                  onClick={() => setWordCount(5)}
                >
                  5 Từ
                </button>
                <button
                  type="button"
                  id="word-count-7"
                  className={`setup-btn ${wordCount === 7 ? 'active' : ''}`}
                  onClick={() => setWordCount(7)}
                >
                  7 Từ
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', width: '100%' }}>
              <Link href="/" style={{ flex: 1, textDecoration: 'none' }}>
                <button
                  type="button"
                  className="btn-setup-back"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  🏠 Về trang chủ
                </button>
              </Link>
              <button
                type="button"
                id="start-practice-btn"
                className="btn-start-practice"
                onClick={handleStartPractice}
                style={{ flex: 2, marginTop: 0 }}
              >
                🔥 Bắt đầu Luyện tập
              </button>
            </div>
          </div>
        )}

        {/* ── Màn hình 2: Trận đấu Luyện viết (practice) ── */}
        {gameState === 'practice' && practiceWords.length > 0 && (
          <>
            <div className="practice-header-row">
              {/* Nút thoát */}
              <button
                type="button"
                id="quit-practice-btn"
                className="btn-quit"
                onClick={handleQuitPractice}
              >
                🚪 Dừng lại
              </button>

              {/* Tiến trình hạt ngọc */}
              {renderProgressBeads()}

              {/* Stopwatch */}
              <div className="stopwatch-wood-frame" id="stopwatch-container">
                <span style={{ fontSize: '13px' }}>⏱️</span>
                <div className="stopwatch-digital-display" id="stopwatch-time">
                  {formatTime(timerSeconds)}
                </div>
              </div>
            </div>

            <div className="practice-main-card">
              {/* Char Info */}
              <div className="practice-char-info-row">
                <div className="practice-char-meta">
                  <div className="practice-char-han" id="target-character">
                    {practiceWords[currentIndex].char}
                  </div>
                  <div className="practice-char-details">
                    <div className="practice-char-pinyin">
                      {practiceWords[currentIndex].pinyin}
                    </div>
                    <div className="practice-char-meaning">
                      {practiceWords[currentIndex].meaning}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="practice-pronounce-btn"
                  onClick={() => pronounceChar(practiceWords[currentIndex].char)}
                >
                  🔊 Phát âm
                </button>
              </div>

              {/* Canvas Area Container */}
              <div className="practice-canvas-row">
                <HanziCanvas
                  character={practiceWords[currentIndex].char}
                  gameMode={canvasMode}
                  onModeChange={setCanvasMode}
                  onCorrectStroke={handleCorrectStroke}
                  onWrongStroke={handleWrongStroke}
                  onComplete={handleWordComplete}
                  playSFX={playSFX}
                  onNextChar={() => {}}
                  strokeColors={strokeColors}
                />
              </div>

              {/* Trình bỏ qua từ & Thống kê nét vẽ hiện tại */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-main)', fontSize: '11px', color: 'var(--ds-ink)' }}>
                  Nét vẽ: {scoreCorrect} / {practiceWords[currentIndex].strokes}
                </div>
                <button
                  type="button"
                  id="skip-word-btn"
                  className="btn-skip-char"
                  onClick={handleSkipWord}
                >
                  ⏩ Bỏ qua
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Màn hình 3: Kết quả & Tổng kết (summary) ── */}
        {gameState === 'summary' && (
          <div className="result-card">
            <div className="result-crown">🏆</div>
            <h2 className="result-title">Thử Thách Hoàn Thành!</h2>
            <p className="result-subtitle">Bạn đã xuất sắc vượt qua đợt luyện chữ Hán ngẫu nhiên tính giờ.</p>

            <div className="ink-stats-table">
              <div className="ink-stat-row">
                <span className="ink-stat-label">Cấp độ HSK</span>
                <span className="ink-stat-val" id="summary-hsk">
                  HSK {selectedHsk.replace('hsk', '')}
                </span>
              </div>
              <div className="ink-stat-row">
                <span className="ink-stat-label">Số chữ hoàn thành</span>
                <span className="ink-stat-val" id="summary-completed">
                  {wordCount - skippedCount} / {wordCount} từ
                </span>
              </div>
              <div className="ink-stat-row">
                <span className="ink-stat-label">Tổng thời gian</span>
                <span className="ink-stat-val" id="summary-time">
                  {formatTime(timerSeconds)}
                </span>
              </div>
              <div className="ink-stat-row">
                <span className="ink-stat-label">Tốc độ trung bình</span>
                <span className="ink-stat-val" id="summary-speed">
                  {(timerSeconds / (wordCount || 1)).toFixed(1)} giây/chữ
                </span>
              </div>
              <div className="ink-stat-row">
                <span className="ink-stat-label">Kinh nghiệm nhận được</span>
                <span className="ink-stat-val xp-reward" id="summary-xp">
                  +{xpEarned} XP
                </span>
              </div>
            </div>

            <div className="result-actions">
              <button
                type="button"
                id="play-again-btn"
                className="btn-result-action btn-result-primary"
                onClick={handlePlayAgain}
              >
                🔄 Luyện hiệp mới
              </button>
              <Link href="/">
                <button
                  type="button"
                  id="back-home-btn"
                  className="btn-result-action btn-result-secondary"
                  style={{ width: '100%' }}
                >
                  🏠 Về trang chủ
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* 6. Mascot Gấu Trúc SVG & Bong Bóng Thoại */}
        <MascotPanda state={mascotState} message={mascotText} />
      </div>
    </div>
  );
}
