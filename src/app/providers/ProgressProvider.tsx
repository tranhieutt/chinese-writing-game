'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ProgressContextType {
  xp: number;
  level: number;
  streak: number;
  completedChars: string[];
  isMuted: boolean;
  addXp: (amount: number) => void;
  markCharComplete: (char: string) => boolean;
  toggleMute: () => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useLocalStorage<number>('hz_xp', 0);
  const [streak, setStreak] = useLocalStorage<number>('hz_streak', 0);
  const [completedChars, setCompletedChars] = useLocalStorage<string[]>('hz_completed_chars', []);
  const [isMuted, setIsMuted] = useLocalStorage<boolean>('hz_muted', false);
  const [level, setLevel] = useState<number>(1);

  // Tính toán level mỗi khi XP thay đổi (500 XP tăng 1 level)
  useEffect(() => {
    const calculatedLevel = Math.floor(xp / 500) + 1;
    setLevel(calculatedLevel);
  }, [xp]);

  // Kiểm tra streak khi app load — reset nếu bỏ qua hơn 1 ngày
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastDate = window.localStorage.getItem('hz_last_date');
      if (lastDate) {
        const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) setStreak(0);
      }
    } catch (e) {
      console.error('Error checking streak:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const markCharComplete = (char: string): boolean => {
    const isNew = !completedChars.includes(char);
    if (isNew) {
      setCompletedChars((prev) => [...prev, char]);

      // Cập nhật streak & ngày học khi hoàn thành 1 chữ hán mới trong ngày
      const todayStr = new Date().toISOString().split('T')[0];
      const lastDate = typeof window !== 'undefined'
        ? window.localStorage.getItem('hz_last_date')
        : null;

      if (lastDate !== todayStr) {
        if (lastDate) {
          const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastDate).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setStreak(diffDays === 1 ? (s) => s + 1 : 1);
        } else {
          setStreak(1);
        }
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hz_last_date', todayStr);
        }
      }
    }
    return isNew;
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const resetProgress = () => {
    setXp(0);
    setStreak(0);
    setCompletedChars([]);
    setIsMuted(false);
    setLevel(1);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('hz_last_date');
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        xp,
        level,
        streak,
        completedChars,
        isMuted,
        addXp,
        markCharComplete,
        toggleMute,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
