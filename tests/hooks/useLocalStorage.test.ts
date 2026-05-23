import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Xóa sạch localStorage trước mỗi ca kiểm thử
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('trả về giá trị ban đầu khi localStorage trống', () => {
    const { result } = renderHook(() => useLocalStorage('hz_xp', 0));
    expect(result.current[0]).toBe(0);
  });

  it('trả về giá trị ban đầu kiểu string khi localStorage trống', () => {
    const { result } = renderHook(() => useLocalStorage('hz_key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('đọc đúng giá trị đã lưu từ localStorage', () => {
    localStorage.setItem('hz_xp', JSON.stringify(350));
    const { result } = renderHook(() => useLocalStorage('hz_xp', 0));
    // Sau khi effect chạy xong, giá trị phải là 350
    expect(result.current[0]).toBe(350);
  });

  it('ghi đè giá trị số vào localStorage khi setValue được gọi', () => {
    const { result } = renderHook(() => useLocalStorage('hz_xp', 0));

    act(() => {
      result.current[1](150);
    });

    expect(result.current[0]).toBe(150);
    expect(localStorage.getItem('hz_xp')).toBe('150');
  });

  it('ghi đè giá trị số sử dụng callback function', () => {
    const { result } = renderHook(() => useLocalStorage('hz_xp', 100));

    act(() => {
      result.current[1]((prev) => prev + 50);
    });

    expect(result.current[0]).toBe(150);
    expect(localStorage.getItem('hz_xp')).toBe('150');
  });

  it('lưu trữ và đọc đúng kiểu dữ liệu mảng', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string[]>('hz_completed_chars', [])
    );

    act(() => {
      result.current[1](['好', '大', '人']);
    });

    expect(result.current[0]).toEqual(['好', '大', '人']);
    expect(JSON.parse(localStorage.getItem('hz_completed_chars')!)).toEqual([
      '好',
      '大',
      '人',
    ]);
  });

  it('không bị lỗi khi localStorage chứa giá trị JSON không hợp lệ', () => {
    // Ghi giá trị JSON lỗi vào localStorage thủ công
    localStorage.setItem('hz_xp', 'not-valid-json');
    // Không được throw error
    expect(() => {
      renderHook(() => useLocalStorage('hz_xp', 0));
    }).not.toThrow();
  });
});
