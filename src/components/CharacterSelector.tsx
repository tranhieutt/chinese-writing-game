'use client';

import React, { useEffect, useRef } from 'react';

interface Character {
  char: string;
  pinyin: string;
  meaning: string;
  strokes: number;
}

interface CharacterSelectorProps {
  chars: Character[];
  activeChar: string;
  onSelectChar: (charName: string) => void;
  disabled?: boolean;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  chars,
  activeChar,
  onSelectChar,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn nút từ đang chọn vào viewport (scrollIntoView) giống bản cũ
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('.char-btn.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeChar]);

  return (
    <div className="char-selector" id="char-selector" ref={containerRef}>
      {chars.map((c, i) => {
        // Tách nghĩa Hán Việt: nghĩa Hán Việt trong JSON thường ở sau icon emoji.
        // e.g: "0️⃣ Không, Số 0" -> lấy từ chữ thứ hai trở đi hoặc tách chuỗi
        // Để đơn giản, hiển thị toàn bộ meaning ngắn gọn hoặc nghĩa rút gọn:
        // Bản gốc: c.meaning.split(' ').slice(1).join(' ')
        const meaningWords = c.meaning.split(' ');
        const displayMeaning = meaningWords.length > 1 ? meaningWords.slice(1).join(' ') : c.meaning;

        return (
          <button
            key={c.char}
            type="button"
            className={`char-btn${c.char === activeChar ? ' active' : ''}`}
            onClick={() => onSelectChar(c.char)}
            disabled={disabled}
            style={{
              transform: i % 2 === 0 ? 'rotate(-0.3deg)' : 'rotate(0.45deg)'
            }}
          >
            <span className="han">{c.char}</span>
            <span className="viet">{displayMeaning}</span>
          </button>
        );
      })}
    </div>
  );
};
