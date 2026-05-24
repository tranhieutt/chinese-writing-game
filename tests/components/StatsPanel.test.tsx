import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsPanel } from '@/components/StatsPanel';

// Mock lucide-react để tránh lỗi SVG trong môi trường jsdom
jest.mock('lucide-react', () => ({
  Volume2: () => <svg data-testid="icon-volume2" />,
  VolumeX: () => <svg data-testid="icon-volumex" />,
  HelpCircle: () => <svg data-testid="icon-help" />,
  Flame: () => <svg data-testid="icon-flame" />,
  Sparkles: () => <svg data-testid="icon-sparkles" />,
  Award: () => <svg data-testid="icon-award" />,
}));

const defaultProps = {
  xp: 250,
  level: 2,
  streak: 5,
  isMuted: false,
  onToggleMute: jest.fn(),
  onOpenHelp: jest.fn(),
  currentHsk: 'hsk1',
  onHskChange: jest.fn(),
};

describe('StatsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hiển thị đúng giá trị XP, Level, Streak', () => {
    render(<StatsPanel {...defaultProps} />);
    expect(document.getElementById('user-xp')?.textContent).toBe('250');
    expect(document.getElementById('user-level')?.textContent).toBe('2');
    expect(document.getElementById('user-streak')?.textContent).toBe('5');
  });

  it('hiển thị icon Volume2 khi không tắt tiếng', () => {
    render(<StatsPanel {...defaultProps} isMuted={false} />);
    expect(screen.getByTestId('icon-volume2')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-volumex')).not.toBeInTheDocument();
  });

  it('hiển thị icon VolumeX khi tắt tiếng', () => {
    render(<StatsPanel {...defaultProps} isMuted={true} />);
    expect(screen.getByTestId('icon-volumex')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-volume2')).not.toBeInTheDocument();
  });

  it('gọi onToggleMute khi bấm nút mute', () => {
    const onToggleMute = jest.fn();
    render(<StatsPanel {...defaultProps} onToggleMute={onToggleMute} />);
    fireEvent.click(document.getElementById('mute-toggle')!);
    expect(onToggleMute).toHaveBeenCalledTimes(1);
  });

  it('gọi onOpenHelp khi bấm nút hướng dẫn', () => {
    const onOpenHelp = jest.fn();
    render(<StatsPanel {...defaultProps} onOpenHelp={onOpenHelp} />);
    fireEvent.click(document.getElementById('btn-help')!);
    expect(onOpenHelp).toHaveBeenCalledTimes(1);
  });

  it('thanh tiến trình XP có chiều rộng chính xác', () => {
    // 250 XP tương đương 50% của một cấp (500 XP/cấp)
    render(<StatsPanel {...defaultProps} xp={250} level={1} />);
    const fill = document.getElementById('level-progress-fill');
    expect(fill?.style.width).toBe('50%');
  });

  it('thanh tiến trình đặt lại về 0 khi level mới bắt đầu', () => {
    // 1000 XP = 2 cấp đã hoàn thành, progress trong cấp mới = 0%
    render(<StatsPanel {...defaultProps} xp={1000} level={3} />);
    const fill = document.getElementById('level-progress-fill');
    expect(fill?.style.width).toBe('0%');
  });

  it('hiển thị tiêu đề game đúng', () => {
    render(<StatsPanel {...defaultProps} />);
    expect(screen.getByText(/Luyện Viết/i)).toBeInTheDocument();
    expect(screen.getByText('Chữ Hán')).toBeInTheDocument();
  });

  it('hiển thị đúng dropdown chọn HSK với giá trị hiện tại', () => {
    render(<StatsPanel {...defaultProps} currentHsk="hsk2" />);
    const select = screen.getByTitle('Chọn cấp độ HSK') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('hsk2');
  });

  it('gọi onHskChange khi thay đổi lựa chọn HSK', () => {
    const onHskChange = jest.fn();
    render(<StatsPanel {...defaultProps} onHskChange={onHskChange} />);
    const select = screen.getByTitle('Chọn cấp độ HSK');
    fireEvent.change(select, { target: { value: 'hsk3' } });
    expect(onHskChange).toHaveBeenCalledWith('hsk3');
  });
});
