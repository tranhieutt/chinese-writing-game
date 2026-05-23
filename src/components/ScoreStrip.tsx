'use client';

import React from 'react';

interface ScoreStripProps {
  correctStrokes: number;
  totalAttempts: number;
  completedCount: number;
}

export const ScoreStrip: React.FC<ScoreStripProps> = ({
  correctStrokes,
  totalAttempts,
  completedCount,
}) => {
  return (
    <div className="score-strip">
      <span className="score-strip-item">
        🎯 Nét đúng: <strong id="score-correct">{correctStrokes}</strong>
      </span>
      <span className="score-strip-divider">·</span>
      <span className="score-strip-item">
        📝 Lần thử: <strong id="score-attempts">{totalAttempts}</strong>
      </span>
      <span className="score-strip-divider">·</span>
      <span className="score-strip-item">
        📚 Chữ đã học: <strong id="score-chars">{completedCount}</strong>
      </span>
    </div>
  );
};
