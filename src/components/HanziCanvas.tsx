'use client';

import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

interface HanziCanvasProps {
  character: string;
  gameMode: 'idle' | 'preview' | 'quiz' | 'done';
  onModeChange: (mode: 'idle' | 'preview' | 'quiz' | 'done') => void;
  onCorrectStroke: (strokeNum: number, totalStrokes: number) => void;
  onWrongStroke: () => void;
  onComplete: () => void;
  playSFX: (type: 'correct' | 'wrong' | 'complete') => void;
  onNextChar: () => void;
  strokeColors: string[];
}

export const HanziCanvas: React.FC<HanziCanvasProps> = ({
  character,
  gameMode,
  onModeChange,
  onCorrectStroke,
  onWrongStroke,
  onComplete,
  playSFX,
  onNextChar,
  strokeColors,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState<number>(0);

  // Lấy kích thước canvas phù hợp với thiết bị giống bản gốc
  const getWriterSize = (): { width: number; height: number } => {
    if (typeof window === 'undefined') return { width: 280, height: 280 };

    const container = containerRef.current;
    if (container && container.parentElement) {
      const parent = container.parentElement;
      const w = parent.clientWidth || parent.offsetWidth;
      const h = parent.clientHeight || parent.offsetHeight;
      if (w > 0 && h > 0) {
        return { width: w, height: h };
      }
    }

    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
      const size = Math.min(200, window.innerWidth * 0.48, window.innerHeight * 0.28);
      return { width: size, height: size };
    }
    return { width: 280, height: 280 };
  };

  // Khởi tạo HanziWriter
  useEffect(() => {
    if (!containerRef.current || !character) return;

    containerRef.current.innerHTML = '';
    const size = getWriterSize();

    // Reset các biến đếm
    setAttempts(0);
    setErrors(0);
    setCurrentStrokeIndex(0);

    const writer = HanziWriter.create(containerRef.current, character, {
      width: size.width,
      height: size.height,
      padding: 20,
      showOutline: true,
      strokeColor: '#21394f',
      outlineColor: '#d9c8b6',
      drawingColor: strokeColors[0],
      drawingWidth: 6,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 200,
      showCharacter: false,
      charDataLoader: (char, onCompleteLoader) => {
        // Load data từ CDN tin cậy
        fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${char}.json`)
          .then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
          })
          .then(onCompleteLoader)
          .catch(() => {
            fetch(`https://unpkg.com/hanzi-writer-data@latest/${char}.json`)
              .then((r) => r.json())
              .then(onCompleteLoader);
          });
      },
    });

    writerRef.current = writer;

    // Lưu tổng số nét
    writer.getCharacterData().then((data) => {
      setTotalStrokes(data.strokes.length);
    });

    // Cleanup khi component unmount
    return () => {
      writerRef.current = null;
    };
  }, [character]);

  // Cập nhật kích thước canvas khi màn hình thay đổi
  useEffect(() => {
    const handleResize = () => {
      if (writerRef.current) {
        const size = getWriterSize();
        writerRef.current.updateDimensions({ width: size.width, height: size.height });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Xử lý các chế độ gameMode (preview, quiz)
  useEffect(() => {
    const writer = writerRef.current;
    if (!writer) return;

    if (gameMode === 'preview') {
      writer.cancelQuiz();
      writer.showOutline();
      writer.hideCharacter();
      
      writer.animateCharacter({
        onComplete: () => {
          onModeChange('idle');
        },
      });
    } else if (gameMode === 'quiz') {
      writer.cancelQuiz();
      writer.showOutline();
      writer.hideCharacter();

      writer.quiz({
        onCorrectStroke: (strokeData) => {
          playSFX('correct');
          onCorrectStroke(strokeData.strokeNum + 1, totalStrokes);
          setCurrentStrokeIndex(strokeData.strokeNum + 1);
          setAttempts((prev) => prev + 1);

          // Đổi màu vẽ cho nét tiếp theo
          const nextColor = strokeColors[(strokeData.strokeNum + 1) % strokeColors.length];
          writer.updateColor('drawingColor', nextColor);
        },
        onMistake: () => {
          playSFX('wrong');
          onWrongStroke();
          setErrors((prev) => prev + 1);
          setAttempts((prev) => prev + 1);
        },
        onComplete: () => {
          playSFX('complete');
          onComplete();
          onModeChange('done');
        },
      });
    } else if (gameMode === 'idle') {
      writer.cancelQuiz();
      writer.showOutline();
      writer.hideCharacter();
      // Reset về nét đầu tiên
      writer.updateColor('drawingColor', strokeColors[0]);
      setCurrentStrokeIndex(0);
      setAttempts(0);
      setErrors(0);
    }
  }, [gameMode, totalStrokes]);

  return (
    <div className="canvas-wrapper">
      {/* Container vẽ chữ */}
      <div id="hanzi-container" ref={containerRef}></div>

      {/* Dấu chấm gợi ý nét vẽ */}
      <div className="stroke-hint-absolute-container" style={{ display: 'none' }}></div>

      {/* Overlay hoàn thành */}
      <div className={`complete-overlay${gameMode === 'done' ? ' show' : ''}`}>
        <div className="complete-star">⭐</div>
        <div className="complete-text">Hoàn thành!</div>
        <div className="complete-sub">
          {totalStrokes} nét · {errors} lần sai
        </div>
        <button 
          type="button" 
          className="btn btn-complete-next" 
          onClick={() => {
            onNextChar();
            onModeChange('idle');
          }}
        >
          Chữ tiếp theo ➡️
        </button>
      </div>
    </div>
  );
};
