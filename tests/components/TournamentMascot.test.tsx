import React from 'react';
import { render, screen } from '@testing-library/react';
import { TournamentMascot, MascotType } from '@/components/TournamentMascot';

describe('TournamentMascot Component', () => {
  const mascotTypes: MascotType[] = ['panda', 'cat', 'bunny', 'bear', 'tiger', 'fox'];

  mascotTypes.forEach((type) => {
    it(`hiển thị chính xác mascot ${type} không lỗi`, () => {
      const { container } = render(<TournamentMascot type={type} state="idle" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('hiển thị bong bóng thoại khi showBubble = true và có tin nhắn', () => {
    render(<TournamentMascot type="cat" state="idle" message="Chào đấu sĩ!" showBubble={true} />);
    expect(screen.getByText('Chào đấu sĩ!')).toBeInTheDocument();
    expect(document.getElementById('mascot-bubble')).toHaveClass('status-idle');
  });

  it('bong bóng thoại có class CSS chính xác dựa trên trạng thái correct/wrong', () => {
    const { rerender } = render(
      <TournamentMascot type="bunny" state="correct" message="Đúng rồi!" showBubble={true} />
    );
    expect(document.getElementById('mascot-bubble')).toHaveClass('status-correct');

    rerender(
      <TournamentMascot type="bunny" state="wrong" message="Sai rồi!" showBubble={true} />
    );
    expect(document.getElementById('mascot-bubble')).toHaveClass('status-wrong');
  });
});
