'use client';

import { useRef, useEffect } from 'react';

export function useAudio(isMuted: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    // Cleanup AudioContext khi unmount
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const playSFX = (type: 'correct' | 'wrong' | 'complete') => {
    if (isMuted) return;
    
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      
      const now = ctx.currentTime;
      
      if (type === 'correct') {
        // Âm thanh tinh tinh vui tai (nốt C5 -> E5)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'wrong') {
        // Âm thanh trầm rè ngắn báo sai (nốt C3 -> G2)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(130.81, now); // C3
        osc.frequency.linearRampToValueAtTime(98.00, now + 0.15); // G2
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'complete') {
        // Hợp âm arpeggio tươi sáng ăn mừng (C5 -> E5 -> G5 -> C6)
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const noteTime = now + (idx * 0.07);
          osc.frequency.setValueAtTime(freq, noteTime);
          
          gain.gain.setValueAtTime(0.12, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);
          
          osc.start(noteTime);
          osc.stop(noteTime + 0.2);
        });
      }
    } catch (err) {
      console.warn('Audio play failed:', err);
    }
  };

  return { playSFX, initAudio };
}
