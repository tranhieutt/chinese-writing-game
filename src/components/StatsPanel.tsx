'use client';

import React from 'react';
import { Volume2, VolumeX, HelpCircle, Flame, Sparkles, Award } from 'lucide-react';
import Link from 'next/link';

interface StatsPanelProps {
  xp: number;
  level: number;
  streak: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHelp: () => void;
  currentHsk: string;
  onHskChange: (hsk: string) => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  xp,
  level,
  streak,
  isMuted,
  onToggleMute,
  onOpenHelp,
  currentHsk,
  onHskChange,
}) => {
  const currentLevelXP = xp % 500;
  const progressPercent = (currentLevelXP / 500) * 100;

  return (
    <div className="header">
      <div className="header-main-row">
        <div className="header-branding">
          <div className="header-owl" aria-label="Panda mascot" style={{ cursor: 'default' }}>🐼</div>
          <div className="header-text-group">
            <div className="header-title">Luyện Viết <span>Chữ Hán</span></div>
            <div className="header-sub">Học viết đúng thứ tự nét bút · 練字</div>
          </div>
        </div>
        
        {/* Gamified Stats Panel */}
        <div className="header-stats">
          <div 
            className="header-stat-item streak-badge" 
            title="Chuỗi ngày học tập liên tiếp"
          >
            <Flame className="w-4 h-4 fill-current text-red-500 inline-block mr-1" />
            <span id="user-streak">{streak}</span> ngày
          </div>
          <div 
            className="header-stat-item xp-badge" 
            title="Điểm kinh nghiệm tích lũy"
          >
            <Sparkles className="w-4 h-4 text-yellow-600 inline-block mr-1" />
            <span id="user-xp">{xp}</span> XP
          </div>
          <div className="header-stat-item lvl-badge">
            <Award className="w-4 h-4 text-emerald-700 inline-block mr-1" />
            Cấp <span id="user-level">{level}</span>
          </div>
          
          <button 
            type="button"
            id="mute-toggle" 
            className="mute-btn" 
            onClick={onToggleMute} 
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 inline" /> : <Volume2 className="w-4 h-4 inline" />}
          </button>
          
          <Link 
            href="/practice" 
            className="btn-practice-nav"
            title="Luyện tập ngẫu nhiên tính giờ"
          >
            🎯 Luyện ngẫu nhiên
          </Link>

          <Link 
            href="/tournament" 
            className="btn-tournament-nav"
            title="Đấu trường thi đấu tốc độ"
          >
            🏆 Đấu Trường
          </Link>

          <select 
            value={currentHsk} 
            onChange={(e) => onHskChange(e.target.value)}
            className="hsk-select-btn"
            title="Chọn cấp độ HSK"
          >
            <option value="hsk1">📚 HSK 1</option>
            <option value="hsk2">📚 HSK 2</option>
            <option value="hsk3">📚 HSK 3</option>
          </select>

          <button 
            type="button"
            id="btn-help" 
            className="btn-help-icon" 
            onClick={onOpenHelp} 
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle className="w-3.5 h-3.5 inline mr-1" /> Hướng dẫn
          </button>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="level-progress-wrapper">
        <div className="level-progress-bar">
          <div 
            className="level-progress-fill" 
            id="level-progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
