import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeedCard } from '@/components/ui/FeedCard';
import type { FeedItem } from '@/hooks/useFeed';

vi.mock('motion/react');
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe('FeedCard', () => {
  describe('register 타입', () => {
    const item: FeedItem = { id: 1, type: 'register', name: '김*수', time: '방금 전' };

    it('이름을 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('김*수')).toBeInTheDocument();
    });

    it('시간을 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('방금 전')).toBeInTheDocument();
    });

    it('"등록" 텍스트를 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('등록')).toBeInTheDocument();
    });

    it('파란색 아이콘 스타일 적용', () => {
      const { container } = render(<FeedCard item={item} />);
      const iconWrapper = container.querySelector('.bg-blue-100');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('match 타입', () => {
    const item: FeedItem = { id: 2, type: 'match', name: '이*영', count: 3, time: '1분 전' };

    it('이름을 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('이*영')).toBeInTheDocument();
    });

    it('시간을 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('1분 전')).toBeInTheDocument();
    });

    it('count와 함께 "명" 텍스트 렌더링', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('3명')).toBeInTheDocument();
    });

    it('핑크색 아이콘 스타일 적용', () => {
      const { container } = render(<FeedCard item={item} />);
      const iconWrapper = container.querySelector('.bg-pink-100');
      expect(iconWrapper).toBeInTheDocument();
    });
  });
});
