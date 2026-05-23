import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ProgressProvider, useProgress } from '@/app/providers/ProgressProvider';

/**
 * Wrapper bọc hook trong ProgressProvider
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProgressProvider>{children}</ProgressProvider>
);

describe('ProgressProvider — XP & Level Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('khởi tạo đúng giá trị mặc định', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    expect(result.current.xp).toBe(0);
    expect(result.current.level).toBe(1);
    expect(result.current.streak).toBe(0);
    expect(result.current.completedChars).toEqual([]);
    expect(result.current.isMuted).toBe(false);
  });

  it('tính level đúng: level = Math.floor(xp / 500) + 1', async () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.addXp(500);
    });

    await waitFor(() => {
      expect(result.current.level).toBe(2);
    });
  });

  it('addXp tích lũy đúng sau nhiều lần gọi', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    // React 19 batches updates inside one act — call sequentially
    act(() => { result.current.addXp(100); });
    act(() => { result.current.addXp(200); });

    expect(result.current.xp).toBe(300);
  });

  it('level 3 khi XP >= 1000', async () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.addXp(1000);
    });

    await waitFor(() => {
      expect(result.current.level).toBe(3);
    });
  });

  it('level vẫn là 1 khi XP < 500', async () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.addXp(499);
    });

    await waitFor(() => {
      expect(result.current.level).toBe(1);
    });
  });
});

describe('ProgressProvider — markCharComplete', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-05-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('trả về true khi chữ chưa từng học', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    let isNew: boolean;
    act(() => {
      isNew = result.current.markCharComplete('好');
    });

    expect(isNew!).toBe(true);
    expect(result.current.completedChars).toContain('好');
  });

  it('trả về false khi chữ đã học rồi', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.markCharComplete('好');
    });

    let isNew: boolean;
    act(() => {
      isNew = result.current.markCharComplete('好');
    });

    expect(isNew!).toBe(false);
  });

  it('không thêm bản sao vào completedChars', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.markCharComplete('大');
      result.current.markCharComplete('大');
    });

    expect(result.current.completedChars.filter((c) => c === '大')).toHaveLength(1);
  });

  it('đặt streak = 1 khi học ngày đầu tiên', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.markCharComplete('人');
    });

    expect(result.current.streak).toBe(1);
  });

  it('không tăng streak khi học cùng ngày', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.markCharComplete('人');
    });

    const streakAfterFirst = result.current.streak;

    act(() => {
      result.current.markCharComplete('口');
    });

    expect(result.current.streak).toBe(streakAfterFirst);
  });
});

describe('ProgressProvider — toggleMute & resetProgress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggleMute đổi trạng thái từ false -> true', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
  });

  it('toggleMute đổi trạng thái từ true -> false', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    // React 19 batches — call sequentially
    act(() => { result.current.toggleMute(); });
    act(() => { result.current.toggleMute(); });

    expect(result.current.isMuted).toBe(false);
  });

  it('resetProgress đặt lại tất cả về mặc định', async () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.addXp(1200);
      result.current.toggleMute();
    });

    act(() => {
      result.current.resetProgress();
    });

    await waitFor(() => {
      expect(result.current.xp).toBe(0);
      expect(result.current.level).toBe(1);
      expect(result.current.streak).toBe(0);
      expect(result.current.completedChars).toEqual([]);
      expect(result.current.isMuted).toBe(false);
    });
  });
});

describe('ProgressProvider — useProgress error guard', () => {
  it('ném lỗi khi dùng useProgress ngoài ProgressProvider', () => {
    // Tắt console.error để giữ output test sạch
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useProgress());
    }).toThrow('useProgress must be used within a ProgressProvider');

    spy.mockRestore();
  });
});
