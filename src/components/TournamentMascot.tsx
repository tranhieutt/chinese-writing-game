'use client';

import React, { useEffect, useRef, useState } from 'react';

export type MascotType = 'panda' | 'cat' | 'bunny' | 'bear' | 'tiger' | 'fox';
export type MascotExpression = 'idle' | 'quiz' | 'correct' | 'wrong' | 'complete';

interface TournamentMascotProps {
  type: MascotType;
  state: MascotExpression;
  message?: string;
  size?: number; // width/height in px
  showBubble?: boolean;
}

export const TournamentMascot: React.FC<TournamentMascotProps> = ({
  type,
  state,
  message,
  size = 100,
  showBubble = false,
}) => {
  const pupilLeftRef = useRef<SVGCircleElement>(null);
  const pupilRightRef = useRef<SVGCircleElement>(null);
  const [bounceTrigger, setBounceTrigger] = useState<boolean>(false);

  // Trigger bounce animation when state or message changes
  useEffect(() => {
    setBounceTrigger(true);
    const timer = setTimeout(() => setBounceTrigger(false), 450);
    return () => clearTimeout(timer);
  }, [state, message, type]);

  // Eye tracking mouse movement logic
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const pupils = [pupilLeftRef.current, pupilRightRef.current];

      pupils.forEach((pupil) => {
        if (!pupil) return;

        const rect = pupil.getBoundingClientRect();
        const pupilCenterX = rect.left + rect.width / 2;
        const pupilCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - pupilCenterX;
        const deltaY = e.clientY - pupilCenterY;

        const angle = Math.atan2(deltaY, deltaX);
        const maxOffset = 1.2;

        const dx = Math.cos(angle) * maxOffset;
        const dy = Math.sin(angle) * maxOffset;

        // Base coordinates for eyes vary slightly by animal type
        let baseLX = 39;
        let baseLY = 48;
        let baseRX = 61;
        let baseRY = 48;

        if (type === 'bunny') {
          baseLX = 38; baseLY = 50; baseRX = 62; baseRY = 50;
        } else if (type === 'fox') {
          baseLX = 37; baseLY = 49; baseRX = 63; baseRY = 49;
        } else if (type === 'cat') {
          baseLX = 38; baseLY = 47; baseRX = 62; baseRY = 47;
        }

        const isLeft = pupil.id.endsWith('-l');
        const cx = (isLeft ? baseLX : baseRX) + dx;
        const cy = (isLeft ? baseLY : baseRY) + dy;

        pupil.setAttribute('cx', cx.toString());
        pupil.setAttribute('cy', cy.toString());
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [type]);

  // CSS bubble class
  const getBubbleClass = () => {
    switch (state) {
      case 'correct':
      case 'complete':
        return 'status-correct';
      case 'wrong':
        return 'status-wrong';
      default:
        return 'status-idle';
    }
  };

  // Render Mascot SVGs by type
  const renderMascotSVG = () => {
    const isWrong = state === 'wrong';
    const isCorrect = state === 'correct' || state === 'complete';

    switch (type) {
      case 'cat':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Body */}
            <circle cx="50" cy="55" r="32" fill="#fffdf9" stroke="#21394f" strokeWidth={3} />
            
            {/* Ears */}
            {/* Left Ear */}
            <path d="M22 34 L12 12 L38 25 Z" fill="#21394f" stroke="#21394f" strokeWidth={3} strokeLinejoin="round" />
            <path d="M24 31 L17 17 L34 25 Z" fill="#f5c4c7" />
            {/* Right Ear */}
            <path d="M78 34 L88 12 L62 25 Z" fill="#21394f" stroke="#21394f" strokeWidth={3} strokeLinejoin="round" />
            <path d="M76 31 L83 17 L66 25 Z" fill="#f5c4c7" />
            
            {/* Cheeks Fluff */}
            <path d="M18 55 Q13 55 18 63" fill="none" stroke="#21394f" strokeWidth={3} strokeLinecap="round" />
            <path d="M82 55 Q87 55 82 63" fill="none" stroke="#21394f" strokeWidth={3} strokeLinecap="round" />
            
            {/* Eyes patches / whites */}
            <circle cx="38" cy="47" r="5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            <circle cx="62" cy="47" r="5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            
            {/* Pupils */}
            <circle ref={pupilLeftRef} cx="38" cy="47" r="1.5" fill="#21394f" id="cat-pupil-l" />
            <circle ref={pupilRightRef} cx="62" cy="47" r="1.5" fill="#21394f" id="cat-pupil-r" />

            {/* Whiskers */}
            <path d="M14 47 L26 49" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M12 53 L25 53" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M14 59 L26 57" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            
            <path d="M86 47 L74 49" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M88 53 L75 53" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M86 59 L74 57" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />

            {/* Nose */}
            <polygon points="48,51 52,51 50,53.5" fill="#c95f66" stroke="#c95f66" strokeWidth={1} />
            
            {/* Mouth */}
            {isWrong ? (
              <path d="M46 59 Q50 56 54 59" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            ) : isCorrect ? (
              <path d="M45 56 Q47.5 59 50 56 Q52.5 59 55 56" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            ) : (
              <path d="M46 57 Q48 59 50 57.5 Q52 59 54 57" fill="none" stroke="#21394f" strokeWidth={2} strokeLinecap="round" />
            )}
            
            {/* Blush */}
            <circle cx="28" cy="55" r="3.5" fill="#f3d1cc" />
            <circle cx="72" cy="55" r="3.5" fill="#f3d1cc" />
          </svg>
        );

      case 'bunny':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Ears */}
            {/* Left Ear */}
            <path d="M30 40 Q15 0 28 8 Q41 16 38 40" fill="#ffffff" stroke="#21394f" strokeWidth={3} strokeLinejoin="round" />
            <path d="M31 36 Q22 8 30 14 Q38 20 35 36" fill="#f5c4c7" />
            {/* Right Ear */}
            <path d="M70 40 Q85 0 72 8 Q59 16 62 40" fill="#ffffff" stroke="#21394f" strokeWidth={3} strokeLinejoin="round" />
            <path d="M69 36 Q78 8 70 14 Q62 20 65 36" fill="#f5c4c7" />

            {/* Body */}
            <circle cx="50" cy="58" r="31" fill="#ffffff" stroke="#21394f" strokeWidth={3} />
            
            {/* Eyes */}
            <circle cx="38" cy="50" r="4.5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            <circle cx="62" cy="50" r="4.5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            
            {/* Pupils */}
            <circle ref={pupilLeftRef} cx="38" cy="50" r="1.3" fill="#21394f" id="bunny-pupil-l" />
            <circle ref={pupilRightRef} cx="62" cy="50" r="1.3" fill="#21394f" id="bunny-pupil-r" />

            {/* Nose */}
            <circle cx="50" cy="57" r="2.5" fill="#c95f66" />
            
            {/* Mouth */}
            {isWrong ? (
              <path d="M46 64 Q50 61 54 64" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            ) : isCorrect ? (
              <path d="M45 61 Q50 67 55 61" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            ) : (
              <path d="M47 62 Q50 64 53 62" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            )}
            
            {/* Blush */}
            <circle cx="25" cy="59" r="4" fill="#f3d1cc" />
            <circle cx="75" cy="59" r="4" fill="#f3d1cc" />
          </svg>
        );

      case 'bear':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Body */}
            <circle cx="50" cy="55" r="32" fill="#dfb36c" stroke="#21394f" strokeWidth={3} />
            
            {/* Ears */}
            {/* Left Ear */}
            <circle cx="25" cy="30" r="11" fill="#dfb36c" stroke="#21394f" strokeWidth={3} />
            <circle cx="25" cy="30" r="6" fill="#ead8bd" />
            {/* Right Ear */}
            <circle cx="75" cy="30" r="11" fill="#dfb36c" stroke="#21394f" strokeWidth={3} />
            <circle cx="75" cy="30" r="6" fill="#ead8bd" />

            {/* Eyes */}
            <circle cx="39" cy="48" r="4.5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            <circle cx="61" cy="48" r="4.5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            
            {/* Pupils */}
            <circle ref={pupilLeftRef} cx="39" cy="48" r="1.3" fill="#21394f" id="bear-pupil-l" />
            <circle ref={pupilRightRef} cx="61" cy="48" r="1.3" fill="#21394f" id="bear-pupil-r" />

            {/* Snout */}
            <ellipse cx="50" cy="58" rx="8" ry="6" fill="#fffdf9" stroke="#21394f" strokeWidth={2} />
            <ellipse cx="50" cy="55.5" rx="3.5" ry="2.2" fill="#21394f" />
            
            {/* Mouth */}
            {isWrong ? (
              <path d="M47 61 Q50 58 53 61" fill="none" stroke="#21394f" strokeWidth={2} strokeLinecap="round" />
            ) : isCorrect ? (
              <path d="M46 59 Q50 63 54 59" fill="none" stroke="#21394f" strokeWidth={2} strokeLinecap="round" />
            ) : (
              <path d="M47 59.5 Q50 61.5 53 59.5" fill="none" stroke="#21394f" strokeWidth={1.8} strokeLinecap="round" />
            )}
            
            {/* Blush */}
            <circle cx="26" cy="56" r="3.5" fill="#f3d1cc" opacity={0.7} />
            <circle cx="74" cy="56" r="3.5" fill="#f3d1cc" opacity={0.7} />
          </svg>
        );

      case 'tiger':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Body */}
            <circle cx="50" cy="55" r="32" fill="#f8a543" stroke="#21394f" strokeWidth={3} />
            
            {/* Ears */}
            {/* Left Ear */}
            <circle cx="26" cy="30" r="10" fill="#f8a543" stroke="#21394f" strokeWidth={3} />
            <circle cx="26" cy="30" r="5" fill="#fffdf9" />
            {/* Right Ear */}
            <circle cx="74" cy="30" r="10" fill="#f8a543" stroke="#21394f" strokeWidth={3} />
            <circle cx="74" cy="30" r="5" fill="#fffdf9" />

            {/* Tiger Stripes on forehead */}
            <path d="M50 25 L50 32" stroke="#21394f" strokeWidth={3.5} strokeLinecap="round" />
            <path d="M44 28 Q50 31 56 28" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            
            {/* Cheeks Stripes */}
            <path d="M19 53 L28 53" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M19 59 L26 58" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M81 53 L72 53" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M81 59 L74 58" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />

            {/* Eyes */}
            <circle cx="39" cy="48" r="4.5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            <circle cx="61" cy="48" r="4.5" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            
            {/* Pupils */}
            <circle ref={pupilLeftRef} cx="39" cy="48" r="1.3" fill="#21394f" id="tiger-pupil-l" />
            <circle ref={pupilRightRef} cx="61" cy="48" r="1.3" fill="#21394f" id="tiger-pupil-r" />

            {/* Snout */}
            <ellipse cx="50" cy="58" rx="7" ry="5.2" fill="#fffdf9" stroke="#21394f" strokeWidth={2} />
            <polygon points="48.5,55.5 51.5,55.5 50,57.5" fill="#21394f" />
            
            {/* Mouth */}
            {isWrong ? (
              <path d="M47 61 Q50 59 53 61" fill="none" stroke="#21394f" strokeWidth={2} strokeLinecap="round" />
            ) : isCorrect ? (
              <path d="M46 59 Q50 63 54 59" fill="none" stroke="#21394f" strokeWidth={2} strokeLinecap="round" />
            ) : (
              <path d="M47 59.5 Q50 61 53 59.5" fill="none" stroke="#21394f" strokeWidth={1.8} strokeLinecap="round" />
            )}
            
            {/* Blush */}
            <circle cx="30" cy="56" r="3.5" fill="#c95f66" opacity={0.6} />
            <circle cx="70" cy="56" r="3.5" fill="#c95f66" opacity={0.6} />
          </svg>
        );

      case 'fox':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Ears */}
            {/* Left Ear */}
            <path d="M24 35 L12 10 L38 26 Z" fill="#e06c75" stroke="#21394f" strokeWidth={3} strokeLinejoin="round" />
            <path d="M26 31 L18 16 L33 26 Z" fill="#21394f" />
            {/* Right Ear */}
            <path d="M76 35 L88 10 L62 26 Z" fill="#e06c75" stroke="#21394f" strokeWidth={3} strokeLinejoin="round" />
            <path d="M74 31 L82 16 L67 26 Z" fill="#21394f" />

            {/* Body */}
            <circle cx="50" cy="56" r="31" fill="#e06c75" stroke="#21394f" strokeWidth={3} />
            
            {/* White face cheeks masks */}
            <path d="M21 54 C17 65 30 75 50 72 C70 75 83 65 79 54 C74 48 64 54 50 54 C36 54 26 48 21 54 Z" fill="#fffdf9" stroke="#21394f" strokeWidth={2.5} />

            {/* Eyes */}
            <circle cx="37" cy="49" r="4" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            <circle cx="63" cy="49" r="4" fill="#ffffff" stroke="#21394f" strokeWidth={2.5} />
            
            {/* Pupils */}
            <circle ref={pupilLeftRef} cx="37" cy="49" r="1.2" fill="#21394f" id="fox-pupil-l" />
            <circle ref={pupilRightRef} cx="63" cy="49" r="1.2" fill="#21394f" id="fox-pupil-r" />

            {/* Nose */}
            <circle cx="50" cy="62" r="2.8" fill="#21394f" />
            
            {/* Mouth */}
            {isWrong ? (
              <path d="M47 67 Q50 64 53 67" fill="none" stroke="#21394f" strokeWidth={2.2} strokeLinecap="round" />
            ) : isCorrect ? (
              <path d="M45 65 Q50 70 55 65" fill="none" stroke="#21394f" strokeWidth={2.2} strokeLinecap="round" />
            ) : (
              <path d="M47 65.5 Q50 67.5 53 65.5" fill="none" stroke="#21394f" strokeWidth={1.8} strokeLinecap="round" />
            )}
            
            {/* Blush */}
            <circle cx="28" cy="57" r="3" fill="#f3d1cc" />
            <circle cx="72" cy="57" r="3" fill="#f3d1cc" />
          </svg>
        );

      case 'panda':
      default:
        return (
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Head/Body */}
            <circle cx="50" cy="55" r="33" fill="#ffffff" stroke="#21394f" strokeWidth={3} />
            
            {/* Ears */}
            <circle cx="23" cy="29" r="11" fill="#21394f" />
            <circle cx="77" cy="29" r="11" fill="#21394f" />
            <circle cx="23" cy="29" r="6" fill="#ead8bd" />
            <circle cx="77" cy="29" r="6" fill="#ead8bd" />
            
            {/* Eye patches */}
            <ellipse cx="38" cy="49" rx="8" ry="10" transform="rotate(-15 38 49)" fill="#21394f" />
            <ellipse cx="62" cy="49" rx="8" ry="10" transform="rotate(15 62 49)" fill="#21394f" />
            
            {/* Eye whites */}
            <circle cx="39" cy="48" r="3" fill="#ffffff" />
            <circle cx="61" cy="48" r="3" fill="#ffffff" />
            
            {/* Pupils */}
            <circle ref={pupilLeftRef} cx="39" cy="48" r="1.2" fill="#21394f" id="panda-pupil-l" />
            <circle ref={pupilRightRef} cx="61" cy="48" r="1.2" fill="#21394f" id="panda-pupil-r" />
            
            {/* Nose */}
            <ellipse cx="50" cy="58" rx="4.5" ry="3" fill="#21394f" />
            
            {/* Mouth */}
            {isWrong ? (
              <path d="M47 64 Q50 61 53 64" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            ) : (
              <path d="M47 62 Q50 65 53 62" fill="none" stroke="#21394f" strokeWidth={2.5} strokeLinecap="round" />
            )}

            {/* Blush */}
            <circle cx="26" cy="57" r="3.5" fill="#f3d1cc" />
            <circle cx="74" cy="57" r="3.5" fill="#f3d1cc" />
          </svg>
        );
    }
  };

  return (
    <div className="mascot-section" style={{ gap: '14px' }}>
      <div 
        className="mascot-avatar"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          animation: bounceTrigger ? 'panda-bounce 0.4s ease-out' : 'panda-bounce 3s infinite ease-in-out'
        }}
      >
        {renderMascotSVG()}
      </div>

      {showBubble && message && (
        <div className={`mascot-bubble ${getBubbleClass()}`} id="mascot-bubble" style={{ maxWidth: '320px' }}>
          <div className="mascot-text" id="mascot-text" style={{ fontSize: '13.5px', lineHeight: 1.45 }}>{message}</div>
        </div>
      )}
    </div>
  );
};
