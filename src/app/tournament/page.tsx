'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { hskVocabulary, strokeColors, Character } from '@/data/hskVocabulary';
import { useProgress } from '@/app/providers/ProgressProvider';
import { StatsPanel } from '@/components/StatsPanel';
import { TournamentMascot, MascotType, MascotExpression } from '@/components/TournamentMascot';
import { useAudio } from '@/hooks/useAudio';
import { trackEvent } from '@/app/utils/analytics';
import './tournament.css';

// Dynamic client-only imports to avoid SSR issues
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
const HanziCanvas = dynamic(
  () => import('@/components/HanziCanvas').then((mod) => mod.HanziCanvas),
  { ssr: false }
);

interface Player {
  id: string;
  name: string;
  mascot: MascotType;
  totalTime: number; // accumulated time in seconds
  isFinished: boolean;
}

const AVAILABLE_MASCOTS: MascotType[] = ['panda', 'cat', 'bunny', 'bear', 'tiger', 'fox'];

export default function TournamentPage() {
  const {
    xp,
    level,
    streak,
    isMuted,
    addXp,
    toggleMute,
  } = useProgress();

  const { playSFX } = useAudio(isMuted);

  // ── States: Thiết lập trận đấu (Setup) ──
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const [playerMascots, setPlayerMascots] = useState<Record<string, MascotType>>({});
  const [selectedHsk, setSelectedHsk] = useState<string>('hsk1');
  const [wordCount, setWordCount] = useState<number>(3);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── States: Luồng chơi & Trận đấu ──
  const [gameState, setGameState] = useState<'setup' | 'transition' | 'active' | 'summary'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentWords, setTournamentWords] = useState<Character[]>([]);
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(0);

  // active player states
  const [scoreCorrect, setScoreCorrect] = useState<number>(0);
  const [scoreAttempts, setScoreAttempts] = useState<number>(0);
  const [canvasMode, setCanvasMode] = useState<'idle' | 'preview' | 'quiz' | 'done'>('idle');

  // ── Stopwatch/Timer ──
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Mascot Speak bubbles ──
  const [mascotState, setMascotState] = useState<MascotExpression>('idle');
  const [mascotText, setMascotText] = useState<string>('');

  // Confetti size
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize window size
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

  // Initialize random mascots for all possible slots on load/reset
  useEffect(() => {
    const initialMascots: Record<string, MascotType> = {};
    for (let i = 0; i < 8; i++) {
      // Pick random mascot type
      const randIdx = Math.floor(Math.random() * AVAILABLE_MASCOTS.length);
      initialMascots[`player_${i}`] = AVAILABLE_MASCOTS[randIdx];
    }
    setPlayerMascots(initialMascots);
  }, []);

  // Cleanup timers
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
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Mascot Expressions ──
  const setMascotSpeech = (stateExpr: MascotExpression, text: string) => {
    setMascotState(stateExpr);
    setMascotText(text);
  };

  const pronounceChar = (char: string) => {
    if (isMuted) return;
    if (!char) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(char);
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

  // ── Randomize Mascot for individual input ──
  const handleRandomizeMascot = (slotKey: string) => {
    const currentMascot = playerMascots[slotKey];
    // Find next random mascot that is different
    const remaining = AVAILABLE_MASCOTS.filter(m => m !== currentMascot);
    const nextMascot = remaining[Math.floor(Math.random() * remaining.length)];
    
    setPlayerMascots((prev) => ({
      ...prev,
      [slotKey]: nextMascot
    }));
    playSFX('correct');
  };

  // ── Bắt đầu giải đấu (Setup -> Transition) ──
  const handleStartTournament = () => {
    setValidationError(null);

    // 1. Verify player names are not blank
    const tempPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      const name = playerNames[`player_${i}`]?.trim() || '';
      if (!name) {
        setValidationError(`Vui lòng nhập đầy đủ tên cho Người chơi ${i + 1}!`);
        return;
      }
      tempPlayers.push({
        id: `player_${i}`,
        name,
        mascot: playerMascots[`player_${i}`] || 'panda',
        totalTime: 0,
        isFinished: false
      });
    }

    // 2. Select HSK vocabulary words
    const levelData = hskVocabulary[selectedHsk];
    if (!levelData || levelData.groups.length === 0) {
      setValidationError('Không tìm thấy dữ liệu từ vựng cho cấp độ HSK này!');
      return;
    }

    const allChars: Character[] = [];
    levelData.groups.forEach((group) => {
      group.chars.forEach((char) => {
        if (!allChars.some(c => c.char === char.char)) {
          allChars.push(char);
        }
      });
    });

    if (allChars.length < wordCount) {
      setValidationError(`Cấp độ ${selectedHsk.toUpperCase()} không đủ từ để tạo thử thách ${wordCount} từ!`);
      return;
    }

    // Shuffle and pick words (Fisher-Yates)
    const shuffled = [...allChars];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedWords = shuffled.slice(0, wordCount);

    // 3. Set states
    setTournamentWords(selectedWords);
    setPlayers(tempPlayers);
    setActivePlayerIdx(0);
    setActiveWordIdx(0);
    setGameState('transition');
    setMascotSpeech('idle', `Hế lô! Chuẩn bị tinh thần nha! Lượt đấu đầu tiên thuộc về ${tempPlayers[0].name}! 🐼🐾`);
    
    trackEvent('tournament_setup_complete', {
      hsk_level: selectedHsk,
      word_count: wordCount,
      players_count: playerCount
    });
  };

  // ── Bắt đầu lượt của người chơi (Transition -> Active) ──
  const handleStartPlayerTurn = () => {
    const activePlayer = players[activePlayerIdx];
    setActiveWordIdx(0);
    setScoreCorrect(0);
    setScoreAttempts(0);
    setCanvasMode('quiz');
    setGameState('active');
    
    // Start stopwatch
    startTimer();

    setMascotSpeech('quiz', `Đến lượt bạn rồi, vẽ chữ tiếp theo thật chính xác nha! ✏️ Cố lên ${activePlayer.name}!`);
    trackEvent('tournament_player_turn_start', {
      player_name: activePlayer.name,
      mascot: activePlayer.mascot
    });
  };

  // ── Vẽ nét đúng ──
  const handleCorrectStroke = useCallback((strokeNum: number, _totalStrokes: number) => {
    setScoreCorrect(strokeNum);
    setScoreAttempts((prev) => prev + 1);
    setMascotSpeech('correct', 'Quá đỉnh! Nét vẽ chuẩn chỉnh luôn! 🌟');
    playSFX('correct');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Vẽ nét sai ──
  const handleWrongStroke = useCallback(() => {
    setScoreAttempts((prev) => prev + 1);
    setMascotSpeech('wrong', 'Hơi lệch một chút rồi. Cố lên vẽ lại nét đó nhé! 💪');
    playSFX('wrong');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Hoàn thành một từ (HanziCanvas complete callback) ──
  const handleWordComplete = useCallback(() => {
    const activePlayer = players[activePlayerIdx];
    const currentChar = tournamentWords[activeWordIdx];

    // Pronounce character complete
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    completeTimeoutRef.current = setTimeout(() => {
      pronounceChar(currentChar.char);
    }, 400);

    playSFX('complete');

    // Grant small progress XP to the session
    addXp(15);

    // Auto advance to next word after 800ms
    setTimeout(() => {
      const nextWordIdx = activeWordIdx + 1;
      if (nextWordIdx >= tournamentWords.length) {
        // Active player completed all words!
        handlePlayerTurnComplete();
      } else {
        setActiveWordIdx(nextWordIdx);
        setScoreCorrect(0);
        setScoreAttempts(0);
        setCanvasMode('quiz');
        setMascotSpeech('quiz', `Tuyệt vời! Viết tiếp chữ tiếp theo nào: "${tournamentWords[nextWordIdx].char}"! 🚀`);
      }
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWordIdx, activePlayerIdx, players, tournamentWords, addXp]);

  // ── Hoàn thành toàn bộ từ của người chơi hiện tại ──
  const handlePlayerTurnComplete = () => {
    stopTimer();
    
    // Save player's time
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIdx].totalTime = timerSeconds;
    updatedPlayers[activePlayerIdx].isFinished = true;
    setPlayers(updatedPlayers);

    trackEvent('tournament_player_turn_finish', {
      player_name: updatedPlayers[activePlayerIdx].name,
      total_time: timerSeconds
    });

    const nextPlayerIdx = activePlayerIdx + 1;
    if (nextPlayerIdx >= players.length) {
      // All players finished! Transition to summary
      handleFinishTournament();
    } else {
      // Transition to next player turn transition screen
      setActivePlayerIdx(nextPlayerIdx);
      setGameState('transition');
      setMascotSpeech('idle', `Lượt chơi hoàn tất! Chúc mừng ${players[activePlayerIdx].name} đã hoàn thành trong ${formatTime(timerSeconds)}. Tiếp theo hãy chuyển máy cho ${players[nextPlayerIdx].name}! 🐾`);
    }
  };

  // ── Kết thúc giải đấu và vinh danh (Summary) ──
  const handleFinishTournament = () => {
    setGameState('summary');
    setCanvasMode('done');
    playSFX('complete');

    // Reward extra tournament champion XP to current player session
    addXp(150);

    trackEvent('tournament_complete', {
      players_count: players.length,
      hsk_level: selectedHsk,
      word_count: wordCount
    });
  };

  // ── Chơi lại hiệp mới (keeps same player names and config) ──
  const handlePlayAgain = () => {
    // Select new random words
    const levelData = hskVocabulary[selectedHsk];
    const allChars: Character[] = [];
    levelData.groups.forEach((group) => {
      group.chars.forEach((char) => {
        if (!allChars.some(c => c.char === char.char)) {
          allChars.push(char);
        }
      });
    });

    const shuffled = [...allChars];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedWords = shuffled.slice(0, wordCount);

    // Reset player times
    const resetPlayers = players.map(p => ({
      ...p,
      totalTime: 0,
      isFinished: false
    }));

    setTournamentWords(selectedWords);
    setPlayers(resetPlayers);
    setActivePlayerIdx(0);
    setActiveWordIdx(0);
    setGameState('transition');
    setMascotSpeech('idle', `Vòng đấu mới bắt đầu! Đợt này sẽ đấu các chữ khác. Sẵn sàng chưa ${resetPlayers[0].name}? 🐼🐾`);
  };

  // ── Tạo trận mới hoàn toàn ──
  const handleNewTournament = () => {
    setGameState('setup');
    // Clear names
    setPlayerNames({});
    setValidationError(null);
    setMascotSpeech('idle', 'Chào mừng đến với Đấu trường Đua tốc độ! Hãy thiết lập số lượng và tên người chơi nhé! 🐼✨');
  };

  // ── Dừng chơi giữa chừng ──
  const handleQuitTournament = () => {
    if (confirm('Bạn có chắc chắn muốn dừng giải đấu này không? Toàn bộ tiến độ hiện tại sẽ bị xóa!')) {
      stopTimer();
      setGameState('setup');
      setMascotSpeech('idle', 'Đã hủy giải đấu. Hãy thiết lập giải đấu mới khi các bạn đã sẵn sàng nhé! 🐼🐾');
      trackEvent('tournament_quit', {});
    }
  };

  // ── Bỏ qua từ hiện tại (E2E Test và cứu cánh) ──
  const handleSkipWord = () => {
    // Phạt thêm 20 giây vào tổng thời gian thi đấu khi bấm bỏ qua chữ
    setTimerSeconds(t => t + 20);
    playSFX('wrong');

    const nextWordIdx = activeWordIdx + 1;
    if (nextWordIdx >= tournamentWords.length) {
      handlePlayerTurnComplete();
    } else {
      setActiveWordIdx(nextWordIdx);
      setScoreCorrect(0);
      setScoreAttempts(0);
      setCanvasMode('quiz');
      setMascotSpeech('quiz', `Đã bỏ qua chữ vừa rồi (+20s phạt)! Tiếp tục viết chữ tiếp theo: "${tournamentWords[nextWordIdx].char}"! 💪`);
    }
  };

  // ── Helper: Sort players by totalTime (shorter is better) ──
  const getSortedRankings = (): Player[] => {
    return [...players].sort((a, b) => a.totalTime - b.totalTime);
  };

  // Render jade progress beads
  const renderProgressBeads = () => {
    return (
      <div className="jade-beads-container" id="jade-beads-container">
        {tournamentWords.map((_, idx) => {
          let beadClass = 'jade-bead';
          if (idx === activeWordIdx) {
            beadClass += ' active';
          } else if (idx < activeWordIdx) {
            beadClass += ' completed';
          }
          return <div key={idx} className={beadClass} title={`Từ thứ ${idx + 1}`} />;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Confetti reo mừng khi tổng kết */}
      {gameState === 'summary' && (
        <Confetti
          numberOfPieces={150}
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

      <div className="tournament-container">

        {/* ── MÀN HÌNH 1: CẤU HÌNH TRẬN ĐẤU (SETUP) ── */}
        {gameState === 'setup' && (
          <div className="tour-card">
            <h2 className="tour-title">🏆 Đấu Trường Tốc Độ HSK</h2>
            <p className="tour-desc">Đua tài viết chữ Hán nhanh nhất. Luân phiên vẽ chữ, đồng hồ đếm thời gian và tìm ra nhà vô địch!</p>

            {/* Số lượng người chơi */}
            <div className="tour-section">
              <div className="tour-section-title">👥 1. Chọn số lượng người thi đấu</div>
              <div className="players-counter-row">
                <button
                  type="button"
                  className="btn-counter"
                  onClick={() => setPlayerCount(p => Math.max(2, p - 1))}
                  disabled={playerCount <= 2}
                  title="Giảm số người chơi"
                >
                  -
                </button>
                <div className="counter-value">{playerCount} Người</div>
                <button
                  type="button"
                  className="btn-counter"
                  onClick={() => setPlayerCount(p => Math.min(8, p + 1))}
                  disabled={playerCount >= 8}
                  title="Tăng số người chơi"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nhập tên và gán Mascot */}
            <div className="tour-section">
              <div className="tour-section-title">✏️ 2. Nhập tên và chọn Mascot đại diện</div>
              <div className="player-setup-list">
                {Array.from({ length: playerCount }).map((_, idx) => {
                  const slotKey = `player_${idx}`;
                  const mascot = playerMascots[slotKey] || 'panda';
                  return (
                    <div className="player-input-row" key={slotKey}>
                      <div className="mascot-avatar-small" title={`Mascot của Người chơi ${idx + 1}`}>
                        <TournamentMascot type={mascot} state="idle" size={32} />
                      </div>
                      <input
                        type="text"
                        className="player-name-input"
                        placeholder={`Nhập tên người chơi ${idx + 1}...`}
                        value={playerNames[slotKey] || ''}
                        onChange={(e) => {
                          setValidationError(null);
                          setPlayerNames(prev => ({
                            ...prev,
                            [slotKey]: e.target.value
                          }));
                        }}
                        maxLength={14}
                      />
                      <button
                        type="button"
                        className="btn-random-mascot"
                        onClick={() => handleRandomizeMascot(slotKey)}
                        title="Đổi ngẫu nhiên Mascot"
                      >
                        🎲
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HSK & Word Count */}
            <div className="tour-section">
              <div className="tour-section-title">📚 3. Cấp độ HSK & Số lượng chữ thách đấu</div>
              <div className="hsk-grid" style={{ marginBottom: '12px' }}>
                {['hsk1', 'hsk2', 'hsk3'].map((hsk) => (
                  <button
                    key={hsk}
                    type="button"
                    className={`setup-btn ${selectedHsk === hsk ? 'active' : ''}`}
                    onClick={() => setSelectedHsk(hsk)}
                  >
                    Cấp {hsk.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="words-grid">
                {[3, 5, 7].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`setup-btn ${wordCount === count ? 'active' : ''}`}
                    onClick={() => setWordCount(count)}
                  >
                    {count} Từ Hán
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="validation-alert-tour">
                <span>⚠️</span>
                <div>{validationError}</div>
              </div>
            )}

            <button
              type="button"
              className="btn-start-practice"
              onClick={handleStartTournament}
              style={{ marginTop: '16px' }}
            >
              🚀 Bắt Đầu Đua Tài!
            </button>
          </div>
        )}

        {/* ── MÀN HÌNH 2: TRUNG CHUYỂN NGƯỜI CHƠI (TRANSITION) ── */}
        {gameState === 'transition' && players.length > 0 && (
          <div className="transition-card">
            <div className="transition-badge">Pass & Play</div>
            
            <div className="transition-mascot-wrapper">
              <TournamentMascot type={players[activePlayerIdx].mascot} state="idle" size={120} />
            </div>

            <h2 className="transition-text-big">
              Sẵn sàng chưa?<br/>Đến lượt của <span>{players[activePlayerIdx].name}</span>!
            </h2>
            
            <p className="transition-desc">
              Hãy chuyển thiết bị cho **{players[activePlayerIdx].name}**. Đồng hồ sẽ bắt đầu tính giây ngay khi bạn bấm nút dưới đây!
            </p>

            <button
              type="button"
              className="btn-start-practice"
              onClick={handleStartPlayerTurn}
            >
              🖌️ Bắt Đầu Viết Ngay
            </button>
          </div>
        )}

        {/* ── MÀN HÌNH 3: TRẬN ĐẤU ĐANG DIỄN RA (ACTIVE) ── */}
        {gameState === 'active' && players.length > 0 && tournamentWords.length > 0 && (
          <>
            <div className="practice-header-row">
              {/* Nút thoát / Dừng chơi */}
              <button
                type="button"
                id="quit-practice-btn"
                className="btn-quit"
                onClick={handleQuitTournament}
              >
                🚪 Dừng lại
              </button>

              {/* Jade Progress Beads */}
              {renderProgressBeads()}

              {/* Digital Stopwatch */}
              <div className="stopwatch-wood-frame" id="stopwatch-container">
                <span>⏱️</span>
                <div className="stopwatch-digital-display" id="stopwatch-time">
                  {formatTime(timerSeconds)}
                </div>
              </div>
            </div>

            {/* Active Player Banner */}
            <div className="active-player-header-card" style={{ width: '100%', marginBottom: '8px' }}>
              <div className="active-player-info">
                <div className="active-player-mascot-thumb">
                  <TournamentMascot type={players[activePlayerIdx].mascot} state="idle" size={30} />
                </div>
                <div className="active-player-text">
                  Đang thi đấu: <span>{players[activePlayerIdx].name}</span>
                </div>
              </div>
            </div>

            <div className="practice-main-card">
              {/* Word Details Row */}
              <div className="practice-char-info-row">
                <div className="practice-char-meta">
                  <div className="practice-char-han" id="target-character">
                    {tournamentWords[activeWordIdx].char}
                  </div>
                  <div className="practice-char-details">
                    <div className="practice-char-pinyin">
                      {tournamentWords[activeWordIdx].pinyin}
                    </div>
                    <div className="practice-char-meaning">
                      {tournamentWords[activeWordIdx].meaning}
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="practice-pronounce-btn"
                  onClick={() => pronounceChar(tournamentWords[activeWordIdx].char)}
                >
                  🔊 Phát âm
                </button>
              </div>

              {/* Drawing Board Canvas Area */}
              <div className="practice-canvas-row">
                <HanziCanvas
                  character={tournamentWords[activeWordIdx].char}
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

              {/* Progress Stroke details & Skip Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-main)', fontSize: '11px', fontWeight: 700, color: 'var(--ds-ink)' }}>
                  Nét vẽ đúng: {scoreCorrect} / {tournamentWords[activeWordIdx].strokes} nét
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

        {/* ── MÀN HÌNH 4: BẢNG TỔNG SẮP VINH DANH (SUMMARY) ── */}
        {gameState === 'summary' && (
          <div className="result-card">
            <h2 className="result-title" style={{ fontSize: '28px' }}>🏁 Bảng Tổng Sắp Đua Tốc Độ</h2>
            <p className="result-subtitle">Các tuyển thủ đã hoàn thành chặng thi đấu viết chữ Hán xuất sắc.</p>

            {/* 1. TOP 3 PODIUM */}
            {(() => {
              const sorted = getSortedRankings();
              const gold = sorted[0];
              const silver = sorted[1];
              const bronze = sorted[2]; // Can be undefined if 2 players

              return (
                <div className="podium-container">
                  {/* HẠNG 2: BÊN TRÁI */}
                  {silver && (
                    <div className="podium-column">
                      <div className="podium-mascot-pos">
                        <span className="podium-badge-icon">🥈</span>
                        <TournamentMascot type={silver.mascot} state="complete" size={54} />
                      </div>
                      <div className="podium-pillar pillar-silver">
                        <span className="podium-rank-num">2</span>
                        <div className="podium-player-name">{silver.name}</div>
                        <div className="podium-player-time">{formatTime(silver.totalTime)}</div>
                      </div>
                    </div>
                  )}

                  {/* HẠNG 1: CHÍNH GIỮA CAO NHẤT */}
                  {gold && (
                    <div className="podium-column">
                      <div className="podium-mascot-pos">
                        <span className="podium-badge-icon" style={{ transform: 'scale(1.15) translateY(-3px)' }}>👑</span>
                        <TournamentMascot type={gold.mascot} state="complete" size={62} />
                      </div>
                      <div className="podium-pillar pillar-gold">
                        <span className="podium-rank-num">1</span>
                        <div className="podium-player-name" style={{ fontWeight: 900 }}>{gold.name}</div>
                        <div className="podium-player-time" style={{ background: '#fff', color: '#c29334' }}>{formatTime(gold.totalTime)}</div>
                      </div>
                    </div>
                  )}

                  {/* HẠNG 3: BÊN PHẢI */}
                  {bronze && (
                    <div className="podium-column">
                      <div className="podium-mascot-pos">
                        <span className="podium-badge-icon">🥉</span>
                        <TournamentMascot type={bronze.mascot} state="complete" size={48} />
                      </div>
                      <div className="podium-pillar pillar-bronze">
                        <span className="podium-rank-num">3</span>
                        <div className="podium-player-name">{bronze.name}</div>
                        <div className="podium-player-time">{formatTime(bronze.totalTime)}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. FULL RANKINGS TABLE */}
            <div className="tour-section" style={{ marginTop: '20px' }}>
              <div className="tour-table-title">📜 Chi Tiết Thứ Hạng Tuyển Thủ</div>
              <div className="tour-leaderboard-list">
                {getSortedRankings().map((player, index) => (
                  <div className="tour-leaderboard-row" key={player.id}>
                    <div className="tour-row-left">
                      <div className="tour-rank-badge">{index + 1}</div>
                      <div className="tour-row-avatar">
                        <TournamentMascot type={player.mascot} state="idle" size={24} />
                      </div>
                      <div className="tour-row-name">{player.name}</div>
                    </div>
                    <div className="tour-row-time">
                      ⏱️ {formatTime(player.totalTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn-start-practice"
                style={{ width: '100%' }}
                onClick={handlePlayAgain}
              >
                🔄 Chơi Hiệp Mới (Giữ nguyên Đội)
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleNewTournament}
                >
                  ➕ Giải Đấu Mới
                </button>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    🏠 Trang Chủ
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 6. Active Mascot speakbubble (Mascot của người chơi hiện tại hoặc Panda lúc thiết lập) */}
        {gameState !== 'summary' && (
          <div style={{ width: '100%' }}>
            <TournamentMascot
              type={gameState === 'active' || gameState === 'transition' ? players[activePlayerIdx].mascot : 'panda'}
              state={mascotState}
              message={mascotText || 'Chào mừng các bạn đấu sĩ! Chúc giải đấu diễn ra thật rực rỡ và công bằng nhé! 🐼🏆'}
              showBubble={true}
              size={85}
            />
          </div>
        )}
      </div>
    </div>
  );
}
