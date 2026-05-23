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

  // Refs cho hệ thống tô màu nét SVG (giống bản gốc app.js)
  const strokeColorMapRef = useRef<Record<number, string>>({});
  const strokeObserverRef = useRef<MutationObserver | null>(null);

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

  // ── Hệ thống tô màu nét SVG đã viết đúng ──
  //
  // HanziWriter v3 render mỗi nét bằng <path> (animationPath) với clip-path.
  // Khi viết đúng 1 nét, HanziWriter gọi showStroke() → render() → re-apply
  // strokeColor lên <path> attribute. Nếu ta chỉ dùng setAttribute('stroke'),
  // HanziWriter sẽ đè lại ngay lập tức.
  //
  // Giải pháp: dùng element.style.stroke (inline style) để override attribute,
  // vì inline CSS style có priority cao hơn SVG attribute.
  //
  // Cấu trúc SVG của HanziWriter:
  //   svg > defs(...) > g(positioner) > g[0](outline) g[1](main) g[2](highlight)
  //   Mỗi g chứa trực tiếp <path> theo thứ tự stroke index

  /** Lấy danh sách <path> của layer chính (main) trong SVG */
  const getMainStrokePaths = (): SVGPathElement[] | null => {
    if (!containerRef.current) return null;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return null;

    // svg > g(positioner) - là <g> đầu tiên trực tiếp trong svg (không tính <defs>)
    const positionerG = svg.querySelector(':scope > g');
    if (!positionerG) return null;

    // positionerG > g[0]=outline, g[1]=main, g[2]=highlight
    const charLayers = Array.from(positionerG.querySelectorAll(':scope > g'));
    const mainLayer = charLayers[1]; // layer chính (main character)
    if (!mainLayer) return null;

    // Mỗi path trong mainLayer là _animationPath của StrokeRenderer, theo thứ tự stroke index
    return Array.from(mainLayer.querySelectorAll(':scope > path')) as SVGPathElement[];
  };

  /** Áp dụng tất cả màu đã lưu lên SVG paths bằng inline style */
  const applyAllStrokeColors = () => {
    const paths = getMainStrokePaths();
    if (!paths || paths.length === 0) return;

    Object.entries(strokeColorMapRef.current).forEach(([idx, color]) => {
      const path = paths[parseInt(idx)];
      if (!path) return;
      // Dùng inline style để override SVG attribute mà HanziWriter set bằng setAttributeNS.
      // Inline style.stroke > attr stroke, nên HanziWriter không thể đè lại.
      path.style.stroke = color;
    });
  };

  /** Tô màu cho 1 nét cụ thể và lưu vào map */
  const colorStrokeSVG = (strokeIdx: number, color: string) => {
    strokeColorMapRef.current[strokeIdx] = color;
    // Apply ngay lập tức
    applyAllStrokeColors();
    // Và thêm 1 lần nữa trong frame tiếp theo (phòng trường hợp HanziWriter
    // re-render async sau khi showStroke() → nextStroke())
    requestAnimationFrame(() => applyAllStrokeColors());
    // Backup: apply lần 3 sau 50ms để chắc chắn bắt được mọi re-render
    setTimeout(() => applyAllStrokeColors(), 50);
  };

  /** Xóa toàn bộ inline style stroke đã override */
  const clearAllStrokeStyles = () => {
    const paths = getMainStrokePaths();
    if (paths) {
      paths.forEach((path) => {
        path.style.removeProperty('stroke');
      });
    }
  };

  /** Khởi tạo MutationObserver để reapply màu khi HanziWriter re-render */
  const initStrokeObserver = () => {
    if (strokeObserverRef.current) {
      strokeObserverRef.current.disconnect();
    }
    const container = containerRef.current;
    if (!container) return;

    strokeObserverRef.current = new MutationObserver(() => {
      if (Object.keys(strokeColorMapRef.current).length === 0) return;
      // requestAnimationFrame đảm bảo reapply SAU khi HanziWriter render xong
      requestAnimationFrame(() => applyAllStrokeColors());
    });

    strokeObserverRef.current.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['stroke', 'opacity', 'style', 'd', 'stroke-dashoffset'],
    });
  };

  // Khởi tạo HanziWriter
  useEffect(() => {
    if (!containerRef.current || !character) return;

    containerRef.current.innerHTML = '';
    const size = getWriterSize();

    // Reset các biến đếm và bản đồ màu
    setAttempts(0);
    setErrors(0);
    setCurrentStrokeIndex(0);
    strokeColorMapRef.current = {};
    if (strokeObserverRef.current) {
      strokeObserverRef.current.disconnect();
    }

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
      highlightOnComplete: false,
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

    // Khởi tạo observer cho stroke coloring
    initStrokeObserver();

    // Cleanup khi component unmount
    return () => {
      if (strokeObserverRef.current) {
        strokeObserverRef.current.disconnect();
      }
      writerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Xóa style override trước khi animate
      strokeColorMapRef.current = {};
      clearAllStrokeStyles();
      
      writer.animateCharacter({
        onComplete: () => {
          onModeChange('idle');
        },
      });
    } else if (gameMode === 'quiz') {
      writer.cancelQuiz();
      writer.showOutline();
      writer.hideCharacter();

      // Reset bản đồ màu và xóa style override khi bắt đầu quiz mới
      strokeColorMapRef.current = {};
      clearAllStrokeStyles();

      // Đặt màu bút vẽ cho nét đầu tiên
      writer.updateColor('drawingColor', strokeColors[0]);

      writer.quiz({
        onCorrectStroke: (strokeData) => {
          playSFX('correct');
          onCorrectStroke(strokeData.strokeNum + 1, totalStrokes);
          setCurrentStrokeIndex(strokeData.strokeNum + 1);
          setAttempts((prev) => prev + 1);

          // Tô màu nét vừa viết đúng trên SVG bằng inline style
          const currentColor = strokeColors[strokeData.strokeNum % strokeColors.length];
          colorStrokeSVG(strokeData.strokeNum, currentColor);

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
          if (strokeObserverRef.current) {
            strokeObserverRef.current.disconnect();
          }
          playSFX('complete');
          onComplete();
          onModeChange('done');
        },
      });
    } else if (gameMode === 'idle') {
      writer.cancelQuiz();
      writer.showOutline();
      writer.hideCharacter();
      // Reset bản đồ màu, xóa style override, reset về nét đầu tiên
      strokeColorMapRef.current = {};
      clearAllStrokeStyles();
      writer.updateColor('drawingColor', strokeColors[0]);
      setCurrentStrokeIndex(0);
      setAttempts(0);
      setErrors(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode, totalStrokes, playSFX, onCorrectStroke, onWrongStroke, onComplete, onModeChange, strokeColors]);

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
