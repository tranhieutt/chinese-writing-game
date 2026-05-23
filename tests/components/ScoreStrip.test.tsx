import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreStrip } from '@/components/ScoreStrip';

describe('ScoreStrip', () => {
  it('hiển thị đúng số nét đúng', () => {
    render(
      <ScoreStrip correctStrokes={10} totalAttempts={12} completedCount={3} />
    );
    const el = screen.getByText('10');
    expect(el).toBeInTheDocument();
  });

  it('hiển thị đúng tổng lần thử', () => {
    render(
      <ScoreStrip correctStrokes={10} totalAttempts={15} completedCount={3} />
    );
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('hiển thị đúng số chữ đã học', () => {
    render(
      <ScoreStrip correctStrokes={0} totalAttempts={0} completedCount={8} />
    );
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('hiển thị đúng khi tất cả bằng 0', () => {
    render(
      <ScoreStrip correctStrokes={0} totalAttempts={0} completedCount={0} />
    );
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });

  it('phần tử score-correct có id đúng', () => {
    render(
      <ScoreStrip correctStrokes={7} totalAttempts={9} completedCount={2} />
    );
    expect(document.getElementById('score-correct')?.textContent).toBe('7');
    expect(document.getElementById('score-attempts')?.textContent).toBe('9');
    expect(document.getElementById('score-chars')?.textContent).toBe('2');
  });
});
