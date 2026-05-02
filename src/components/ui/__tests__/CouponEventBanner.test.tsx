import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CouponEventBanner } from '@/components/ui/CouponEventBanner';
import type { CouponEventPreviewItem } from '@/types';

vi.mock('motion/react');

const makeEvent = (id: number, overrides?: Partial<CouponEventPreviewItem>): CouponEventPreviewItem => ({
  id,
  name: `이벤트${id}`,
  eventType: 'HAPPY_HOUR',
  status: 'ACTIVE',
  totalQuantity: 100,
  ...overrides,
});

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('CouponEventBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('이벤트가 없으면 아무것도 렌더링하지 않음', () => {
    const { container } = renderWithRouter(<CouponEventBanner events={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('단일 이벤트일 때 이벤트 이름을 표시함', () => {
    renderWithRouter(<CouponEventBanner events={[makeEvent(1, { name: '해피아워 이벤트' })]} />);
    expect(screen.getByText('해피아워 이벤트')).toBeInTheDocument();
  });

  it('단일 이벤트일 때 dot indicator를 표시하지 않음', () => {
    renderWithRouter(<CouponEventBanner events={[makeEvent(1)]} />);
    expect(screen.queryByLabelText('1번째 이벤트')).not.toBeInTheDocument();
  });

  it('여러 이벤트일 때 dot indicator를 표시함', () => {
    renderWithRouter(
      <CouponEventBanner events={[makeEvent(1), makeEvent(2), makeEvent(3)]} />,
    );
    expect(screen.getByLabelText('1번째 이벤트')).toBeInTheDocument();
    expect(screen.getByLabelText('2번째 이벤트')).toBeInTheDocument();
    expect(screen.getByLabelText('3번째 이벤트')).toBeInTheDocument();
  });

  it('이벤트 타입과 수량 정보를 표시함', () => {
    renderWithRouter(
      <CouponEventBanner
        events={[makeEvent(1, { eventType: 'SECRET_CODE', totalQuantity: 50 })]}
      />,
    );
    expect(screen.getByText(/시크릿 코드/)).toBeInTheDocument();
    expect(screen.getByText(/50매 한정/)).toBeInTheDocument();
  });

  it('ACTIVE 상태일 때 "진행중" 뱃지를 표시함', () => {
    renderWithRouter(<CouponEventBanner events={[makeEvent(1, { status: 'ACTIVE' })]} />);
    expect(screen.getByText('진행중')).toBeInTheDocument();
  });

  it('DRAFT 상태일 때 "시작 예정" 뱃지를 표시함', () => {
    renderWithRouter(<CouponEventBanner events={[makeEvent(1, { status: 'DRAFT' })]} />);
    expect(screen.getByText('시작 예정')).toBeInTheDocument();
  });

  it('3.5초마다 자동 슬라이드됨', () => {
    renderWithRouter(
      <CouponEventBanner events={[makeEvent(1), makeEvent(2)]} />,
    );
    expect(screen.getByText('이벤트1')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.getByText('이벤트2')).toBeInTheDocument();
  });
});
