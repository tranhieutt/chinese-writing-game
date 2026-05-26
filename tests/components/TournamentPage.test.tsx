import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TournamentPage from '@/app/tournament/page';

// Mock các hooks và component động để tránh lỗi môi trường Jest JSDom
jest.mock('@/app/providers/ProgressProvider', () => ({
  useProgress: () => ({
    xp: 100,
    level: 1,
    streak: 0,
    isMuted: false,
    addXp: jest.fn(),
    toggleMute: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAudio', () => ({
  useAudio: () => ({
    playSFX: jest.fn(),
  }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('react-confetti', () => () => <div data-testid="confetti" />);

// Mock HanziCanvas và dynamic imports
jest.mock('next/dynamic', () => () => {
  const MockHanziCanvas = () => <div data-testid="mock-hanzicanvas" />;
  return MockHanziCanvas;
});

describe('TournamentPage - Setup and Logic Phase', () => {
  it('hiển thị tiêu đề đấu trường và mặc định có 3 người chơi', () => {
    render(<TournamentPage />);
    expect(screen.getByText('🏆 Đấu Trường Tốc Độ HSK')).toBeInTheDocument();
    expect(screen.getByText('3 Người')).toBeInTheDocument();
    // Bắt đầu bằng 3 ô nhập tên trống
    const inputs = screen.getAllByPlaceholderText(/Nhập tên người chơi/);
    expect(inputs).toHaveLength(3);
    inputs.forEach((input) => expect(input).toHaveValue(''));
  });

  it('tăng hoặc giảm số người chơi khi click nút + hoặc -', () => {
    render(<TournamentPage />);
    
    // Tăng lên 4 người chơi
    const plusBtn = screen.getByTitle('Tăng số người chơi');
    fireEvent.click(plusBtn);
    expect(screen.getByText('4 Người')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Nhập tên người chơi/)).toHaveLength(4);

    // Giảm về 2 người chơi
    const minusBtn = screen.getByTitle('Giảm số người chơi');
    fireEvent.click(minusBtn);
    fireEvent.click(minusBtn);
    expect(screen.getByText('2 Người')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Nhập tên người chơi/)).toHaveLength(2);
  });

  it('khóa nút giảm khi đạt 2 người chơi và nút tăng khi đạt 8 người chơi', () => {
    render(<TournamentPage />);
    const minusBtn = screen.getByTitle('Giảm số người chơi') as HTMLButtonElement;
    const plusBtn = screen.getByTitle('Tăng số người chơi') as HTMLButtonElement;

    // Giảm xuống tối thiểu 2
    fireEvent.click(minusBtn);
    expect(minusBtn).toBeDisabled();

    // Tăng lên tối đa 8
    for (let i = 0; i < 7; i++) {
      fireEvent.click(plusBtn);
    }
    expect(plusBtn).toBeDisabled();
  });

  it('hiển thị thông báo lỗi khi bấm Bắt đầu mà chưa điền đầy đủ tên', () => {
    render(<TournamentPage />);
    const startBtn = screen.getByText('🚀 Bắt Đầu Đua Tài!');
    
    // Bấm khi chưa nhập tên
    fireEvent.click(startBtn);
    expect(screen.getByText('Vui lòng nhập đầy đủ tên cho Người chơi 1!')).toBeInTheDocument();
  });

  it('cho phép đổi ngẫu nhiên mascot cho người chơi khi click nút xúc xắc', () => {
    render(<TournamentPage />);
    const diceBtns = screen.getAllByTitle('Đổi ngẫu nhiên Mascot');
    expect(diceBtns).toHaveLength(3);

    // Click nút xúc xắc thứ nhất không gây lỗi
    fireEvent.click(diceBtns[0]);
  });
});
