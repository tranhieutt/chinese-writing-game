'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MascotPandaProps {
  state: 'idle' | 'preview' | 'quiz' | 'correct' | 'wrong' | 'complete';
  message: string;
}

export const MascotPanda: React.FC<MascotPandaProps> = ({ state, message }) => {
  const pupilLeftRef = useRef<SVGCircleElement>(null);
  const pupilRightRef = useRef<SVGCircleElement>(null);
  const [bounceTrigger, setBounceTrigger] = useState<boolean>(false);

  // Trigger bounce animation khi đổi state lời nói của Panda
  useEffect(() => {
    setBounceTrigger(true);
    const timer = setTimeout(() => setBounceTrigger(false), 450);
    return () => clearTimeout(timer);
  }, [state, message]);

  // Hiệu ứng tương tác: Mắt liếc theo con trỏ chuột
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const pupils = [pupilLeftRef.current, pupilRightRef.current];
      
      pupils.forEach((pupil) => {
        if (!pupil) return;

        // Lấy tọa độ tâm của con ngươi
        const rect = pupil.getBoundingClientRect();
        const pupilCenterX = rect.left + rect.width / 2;
        const pupilCenterY = rect.top + rect.height / 2;

        // Tính vector từ tâm tới chuột
        const deltaX = e.clientX - pupilCenterX;
        const deltaY = e.clientY - pupilCenterY;

        // Tính góc
        const angle = Math.atan2(deltaY, deltaX);

        // Khoảng cách tối đa con ngươi có thể di chuyển (đơn vị pixel trong SVG)
        const maxOffset = 1.5; 

        // Tính toán độ lệch dx, dy
        const dx = Math.cos(angle) * maxOffset;
        const dy = Math.sin(angle) * maxOffset;

        // Set tọa độ mới
        pupil.setAttribute('cx', (pupil.id === 'panda-pupil-l' ? 39 : 61) + dx + '');
        pupil.setAttribute('cy', 48 + dy + '');
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Lấy class CSS phù hợp với trạng thái bóng thoại
  const getBubbleClass = () => {
    switch (state) {
      case 'preview':
      case 'quiz':
        return 'status-quiz';
      case 'correct':
        return 'status-correct';
      case 'wrong':
        return 'status-wrong';
      case 'complete':
        return 'status-complete';
      default:
        return 'status-idle';
    }
  };

  return (
    <div className="mascot-section">
      <div 
        className="mascot-avatar"
        style={{
          animation: bounceTrigger ? 'panda-bounce 0.4s ease-out' : 'panda-bounce 3s infinite ease-in-out'
        }}
      >
        <svg viewBox="0 0 100 100" className="panda-svg">
          {/* Body/Head */}
          <circle cx="50" cy="55" r="33" fill="#ffffff" stroke="#21394f" stroke-width="3" />
          
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
          
          {/* Pupils (Con ngươi di động) */}
          <circle 
            ref={pupilLeftRef}
            cx="39" 
            cy="48" 
            r="1.2" 
            fill="#21394f" 
            id="panda-pupil-l" 
          />
          <circle 
            ref={pupilRightRef}
            cx="61" 
            cy="48" 
            r="1.2" 
            fill="#21394f" 
            id="panda-pupil-r" 
          />
          
          {/* Nose */}
          <ellipse cx="50" cy="58" rx="4.5" ry="3" fill="#21394f" />
          
          {/* Mouth (Thay đổi hình dạng khuôn miệng dựa trên trạng thái vui/buồn) */}
          {state === 'wrong' ? (
            // Miệng buồn nhẹ
            <path d="M47 64 Q50 61 53 64" fill="none" stroke="#21394f" stroke-width="2.5" stroke-linecap="round" />
          ) : (
            // Miệng cười vui vẻ
            <path d="M47 62 Q50 65 53 62" fill="none" stroke="#21394f" stroke-width="2.5" stroke-linecap="round" />
          )}

          {/* Blush */}
          <circle cx="26" cy="57" r="3.5" fill="#f3d1cc" />
          <circle cx="74" cy="57" r="3.5" fill="#f3d1cc" />
        </svg>
      </div>

      <div className={`mascot-bubble ${getBubbleClass()}`} id="mascot-bubble">
        <div className="mascot-text" id="mascot-text">{message}</div>
      </div>
    </div>
  );
};
