import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import CouponEventsTab from '@/features/admin/components/CouponEventsTab';
import type { CouponEventPreviewItem } from '@/types';

vi.mock('motion/react');

vi.mock('@/features/admin/api', () => ({
  getAdminCouponEvents: vi.fn(),
  createAdminCouponEvent: vi.fn(),
  updateAdminCouponEvent: vi.fn(),
  deleteAdminCouponEvent: vi.fn(),
  activateAdminCouponEvent: vi.fn(),
  deactivateAdminCouponEvent: vi.fn(),
}));

import {
  getAdminCouponEvents,
  createAdminCouponEvent,
  updateAdminCouponEvent,
  deleteAdminCouponEvent,
  activateAdminCouponEvent,
  deactivateAdminCouponEvent,
} from '@/features/admin/api';

const mockGetEvents = vi.mocked(getAdminCouponEvents);
const mockCreate = vi.mocked(createAdminCouponEvent);
const mockUpdate = vi.mocked(updateAdminCouponEvent);
const mockDelete = vi.mocked(deleteAdminCouponEvent);
const mockActivate = vi.mocked(activateAdminCouponEvent);
const mockDeactivate = vi.mocked(deactivateAdminCouponEvent);

const makeDraftEvent = (id = 1): CouponEventPreviewItem => ({
  id,
  name: '해피아워 이벤트',
  description: '테스트 설명',
  status: 'DRAFT',
  type: 'HAPPY_HOUR',
  rewardTicketType: 'RANDOM',
  rewardAmount: 2,
  startsAt: '2026-05-01T00:00:00Z',
  expiresAt: '2026-05-02T00:00:00Z',
  couponExpiresAt: '2026-05-10T00:00:00Z',
});

const makeActiveEvent = (id = 2): CouponEventPreviewItem => ({
  ...makeDraftEvent(id),
  name: '활성 이벤트',
  status: 'ACTIVE',
});

const makeEndedEvent = (id = 3): CouponEventPreviewItem => ({
  ...makeDraftEvent(id),
  name: '종료된 이벤트',
  status: 'ENDED',
});

const emptyPage = () => ({
  result: 'SUCCESS' as const,
  data: {
    content: [] as CouponEventPreviewItem[],
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  },
  error: null,
});

const pageWith = (...events: CouponEventPreviewItem[]) => ({
  result: 'SUCCESS' as const,
  data: {
    content: events,
    currentPage: 0,
    totalPages: 1,
    totalElements: events.length,
    hasNext: false,
    hasPrevious: false,
  },
  error: null,
});

describe('CouponEventsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEvents.mockResolvedValue(emptyPage());
    mockCreate.mockResolvedValue({ result: 'SUCCESS', data: 1, error: null });
    mockUpdate.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
    mockDelete.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
    mockActivate.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
    mockDeactivate.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
  });

  // ── 기본 렌더링 ──

  it('마운트 시 이벤트 목록 API 호출', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => expect(mockGetEvents).toHaveBeenCalledWith({ page: 0, size: 5 }));
  });

  it('빈 목록일 때 빈 상태 메시지 표시', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() =>
      expect(screen.getByText('등록된 쿠폰 이벤트가 없습니다.')).toBeInTheDocument(),
    );
  });

  it('"새 쿠폰 이벤트" 버튼 렌더링', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() =>
      expect(screen.getByText('새 쿠폰 이벤트')).toBeInTheDocument(),
    );
  });

  // ── 이벤트 목록 ──

  it('DRAFT 이벤트에 "준비중" 뱃지 표시', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => {
      expect(screen.getByText('해피아워 이벤트')).toBeInTheDocument();
      expect(screen.getByText('준비중')).toBeInTheDocument();
    });
  });

  it('ACTIVE 이벤트에 "활성" 뱃지 표시', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeActiveEvent()));
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => {
      expect(screen.getByText('활성 이벤트')).toBeInTheDocument();
      expect(screen.getByText('활성')).toBeInTheDocument();
    });
  });

  it('ENDED 이벤트에 "종료" 뱃지 표시', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeEndedEvent()));
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => {
      expect(screen.getByText('종료된 이벤트')).toBeInTheDocument();
      expect(screen.getByText('종료')).toBeInTheDocument();
    });
  });

  it('보상 정보(티켓 유형, 수량) 표시', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() =>
      expect(screen.getByText('랜덤권 2장')).toBeInTheDocument(),
    );
  });

  it('이벤트 유형 라벨 표시', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() =>
      expect(screen.getByText('해피 아워')).toBeInTheDocument(),
    );
  });

  // ── 활성화/비활성화 토글 ──

  it('DRAFT 이벤트에 "활성화" 버튼 표시 및 클릭 시 API 호출', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);

    const btn = await screen.findByText('활성화');
    fireEvent.click(btn);
    await waitFor(() => expect(mockActivate).toHaveBeenCalledWith(1));
  });

  it('ACTIVE 이벤트에 "종료하기" 버튼 표시 및 클릭 시 API 호출', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeActiveEvent()));
    renderWithProviders(<CouponEventsTab />);

    const btn = await screen.findByText('종료하기');
    fireEvent.click(btn);
    await waitFor(() => expect(mockDeactivate).toHaveBeenCalledWith(2));
  });

  it('ENDED 이벤트에는 활성화/종료 버튼 없음', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeEndedEvent()));
    renderWithProviders(<CouponEventsTab />);

    await waitFor(() => expect(screen.getByText('종료된 이벤트')).toBeInTheDocument());
    expect(screen.queryByText('활성화')).not.toBeInTheDocument();
    expect(screen.queryByText('종료하기')).not.toBeInTheDocument();
  });

  // ── 생성 모달 ──

  it('"새 쿠폰 이벤트" 클릭 시 생성 모달 열림', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => expect(screen.getByText('새 쿠폰 이벤트')).toBeInTheDocument());

    fireEvent.click(screen.getByText('새 쿠폰 이벤트'));
    expect(screen.getByLabelText('이벤트 이름')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByText('생성하기')).toBeInTheDocument();
  });

  it('필수 필드 미입력 시 생성 버튼 비활성화', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => expect(screen.getByText('새 쿠폰 이벤트')).toBeInTheDocument());

    fireEvent.click(screen.getByText('새 쿠폰 이벤트'));
    expect(screen.getByText('생성하기')).toBeDisabled();
  });

  it('폼 작성 후 생성 시 API 호출', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => expect(screen.getByText('새 쿠폰 이벤트')).toBeInTheDocument());

    fireEvent.click(screen.getByText('새 쿠폰 이벤트'));

    fireEvent.change(screen.getByLabelText('이벤트 이름'), { target: { value: '새 이벤트' } });
    fireEvent.change(screen.getByLabelText('설명'), { target: { value: '테스트 설명' } });
    fireEvent.change(screen.getByLabelText('이벤트 시작'), { target: { value: '2026-05-01T00:00' } });
    fireEvent.change(screen.getByLabelText('이벤트 종료'), { target: { value: '2026-05-02T00:00' } });
    fireEvent.change(screen.getByLabelText('쿠폰 만료일'), { target: { value: '2026-05-10T00:00' } });

    fireEvent.click(screen.getByText('생성하기'));
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));

    const callBody = mockCreate.mock.calls[0][0];
    expect(callBody.name).toBe('새 이벤트');
    expect(callBody.description).toBe('테스트 설명');
    expect(callBody.type).toBe('HAPPY_HOUR');
    expect(callBody.rewardTicketType).toBe('RANDOM');
    expect(callBody.rewardAmount).toBe(1);
  });

  it('SECRET_CODE 유형 선택 시 시크릿 코드 입력 필드 표시', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => expect(screen.getByText('새 쿠폰 이벤트')).toBeInTheDocument());

    fireEvent.click(screen.getByText('새 쿠폰 이벤트'));
    fireEvent.click(screen.getByText('시크릿 코드'));

    expect(screen.getByLabelText('시크릿 코드')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 모달 닫힘', async () => {
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => expect(screen.getByText('새 쿠폰 이벤트')).toBeInTheDocument());

    fireEvent.click(screen.getByText('새 쿠폰 이벤트'));
    expect(screen.getByLabelText('이벤트 이름')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('닫기'));
    await waitFor(() =>
      expect(screen.queryByLabelText('이벤트 이름')).not.toBeInTheDocument(),
    );
  });

  // ── 수정 모달 ──

  it('수정 버튼 클릭 시 기존 데이터가 채워진 모달 열림', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);

    await waitFor(() => expect(screen.getByText('해피아워 이벤트')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('수정'));

    expect(screen.getByText('쿠폰 이벤트 수정')).toBeInTheDocument();
    expect(screen.getByLabelText('이벤트 이름')).toHaveValue('해피아워 이벤트');
    expect(screen.getByLabelText('설명')).toHaveValue('테스트 설명');
    expect(screen.getByText('수정하기')).toBeInTheDocument();
  });

  it('수정 폼 제출 시 updateAdminCouponEvent 호출', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);

    await waitFor(() => expect(screen.getByText('해피아워 이벤트')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('수정'));

    fireEvent.change(screen.getByLabelText('이벤트 이름'), { target: { value: '수정된 이름' } });
    fireEvent.click(screen.getByText('수정하기'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate.mock.calls[0][0]).toBe(1);
      expect(mockUpdate.mock.calls[0][1].name).toBe('수정된 이름');
    });
  });

  // ── 삭제 ──

  it('삭제 버튼 클릭 시 확인 모달 열림', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);

    await waitFor(() => expect(screen.getByText('해피아워 이벤트')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('삭제'));

    expect(screen.getByText('이벤트 삭제')).toBeInTheDocument();
    expect(screen.getByText('을(를) 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('삭제 확인 시 deleteAdminCouponEvent 호출', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);

    await waitFor(() => expect(screen.getByText('해피아워 이벤트')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('삭제'));

    // 모달 내부의 삭제 버튼 (aria-label이 아닌 텍스트 버튼)
    const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
    const confirmBtn = deleteButtons.find((btn) => btn.className.includes('bg-red-500'));
    fireEvent.click(confirmBtn!);

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(1));
  });

  it('삭제 취소 시 모달 닫힘', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    renderWithProviders(<CouponEventsTab />);

    await waitFor(() => expect(screen.getByText('해피아워 이벤트')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('삭제'));
    expect(screen.getByText('이벤트 삭제')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    await waitFor(() =>
      expect(screen.queryByText('이벤트 삭제')).not.toBeInTheDocument(),
    );
  });

  // ── 에러 처리 ──

  it('목록 API 실패 시 에러 토스트 표시', async () => {
    mockGetEvents.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() =>
      expect(screen.getByText('오류가 발생했습니다.')).toBeInTheDocument(),
    );
  });

  it('활성화 실패 시 에러 토스트 표시', async () => {
    mockGetEvents.mockResolvedValue(pageWith(makeDraftEvent()));
    mockActivate.mockRejectedValue(new Error('Failed'));
    renderWithProviders(<CouponEventsTab />);

    const btn = await screen.findByText('활성화');
    fireEvent.click(btn);
    await waitFor(() =>
      expect(screen.getByText('오류가 발생했습니다.')).toBeInTheDocument(),
    );
  });

  it('생성 실패 시 에러 토스트 표시', async () => {
    mockCreate.mockRejectedValue(new Error('Failed'));
    renderWithProviders(<CouponEventsTab />);
    await waitFor(() => expect(screen.getByText('새 쿠폰 이벤트')).toBeInTheDocument());

    fireEvent.click(screen.getByText('새 쿠폰 이벤트'));
    fireEvent.change(screen.getByLabelText('이벤트 이름'), { target: { value: '이벤트' } });
    fireEvent.change(screen.getByLabelText('설명'), { target: { value: '설명' } });
    fireEvent.change(screen.getByLabelText('이벤트 시작'), { target: { value: '2026-05-01T00:00' } });
    fireEvent.change(screen.getByLabelText('이벤트 종료'), { target: { value: '2026-05-02T00:00' } });
    fireEvent.change(screen.getByLabelText('쿠폰 만료일'), { target: { value: '2026-05-10T00:00' } });
    fireEvent.click(screen.getByText('생성하기'));

    await waitFor(() =>
      expect(screen.getByText('오류가 발생했습니다.')).toBeInTheDocument(),
    );
  });
});
