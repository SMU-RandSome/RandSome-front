import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeedCard } from '@/components/ui/FeedCard';
import type { FeedItem } from '@/types';

vi.mock('motion/react');
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

const NOW = new Date().toISOString();

describe('FeedCard', () => {
  describe('CANDIDATE_REGISTERED 타입', () => {
    const item: FeedItem = {
      id: 1,
      eventType: 'CANDIDATE_REGISTERED',
      nickname: '행복한 쿼카',
      createdAt: NOW,
    };

    it('닉네임을 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('행복한 쿼카')).toBeInTheDocument();
    });

    it('"방금 전" 시간을 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('방금 전')).toBeInTheDocument();
    });

    it('"등록" 텍스트를 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('등록')).toBeInTheDocument();
    });

    it('파란색 아이콘 스타일 적용', () => {
      const { container } = render(<FeedCard item={item} />);
      expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
    });
  });

  describe('MATCH_REQUESTED 타입', () => {
    const item: FeedItem = {
      id: 2,
      eventType: 'MATCH_REQUESTED',
      nickname: '즐거운 사자',
      requestCount: 3,
      createdAt: NOW,
    };

    it('닉네임을 렌더링함', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('즐거운 사자')).toBeInTheDocument();
    });

    it('requestCount와 함께 "명" 텍스트 렌더링', () => {
      render(<FeedCard item={item} />);
      expect(screen.getByText('3명')).toBeInTheDocument();
    });

    it('핑크색 아이콘 스타일 적용', () => {
      const { container } = render(<FeedCard item={item} />);
      expect(container.querySelector('.bg-pink-100')).toBeInTheDocument();
    });
  });

  describe('시간 포맷', () => {
    it('1시간 전 표시', () => {
      const past = new Date(Date.now() - 61 * 60 * 1000).toISOString();
      const item: FeedItem = { id: 3, eventType: 'CANDIDATE_REGISTERED', nickname: '테스트', createdAt: past };
      render(<FeedCard item={item} />);
      expect(screen.getByText('1시간 전')).toBeInTheDocument();
    });

    it('30분 전 표시', () => {
      const past = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const item: FeedItem = { id: 4, eventType: 'CANDIDATE_REGISTERED', nickname: '테스트', createdAt: past };
      render(<FeedCard item={item} />);
      expect(screen.getByText('30분 전')).toBeInTheDocument();
    });
  });
});
