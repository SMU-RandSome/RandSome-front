import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import RequestsPage from '@/pages/RequestsPage';
import type { MatchingHistoryItem } from '@/types';

vi.mock('motion/react');

vi.mock('@/features/matching/api', () => ({
  getMatchingHistory: vi.fn(),
  withdrawMatching: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { getMatchingHistory, withdrawMatching } from '@/features/matching/api';
const mockGetHistory = vi.mocked(getMatchingHistory);
const mockWithdraw = vi.mocked(withdrawMatching);

const makePending = (id = 1): MatchingHistoryItem => ({
  id,
  matchingTypeLabel: '무작위 매칭',
  applicationStatus: 'PENDING',
  appliedAt: '2024-01-15T12:00:00',
  applicationCount: 2,
});

const makeApproved = (id = 2): MatchingHistoryItem => ({
  id,
  matchingTypeLabel: '이상형 기반 매칭',
  applicationStatus: 'APPROVED',
  appliedAt: '2024-01-16T12:00:00',
  applicationCount: 3,
});

describe('RequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetHistory.mockResolvedValue({ result: 'SUCCESS', data: [], error: null });
    mockWithdraw.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
  });

  it('탭 3개(대기중·완료·거절)가 렌더링됨', () => {
    renderWithProviders(<RequestsPage />);
    expect(screen.getByText('대기중')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('거절')).toBeInTheDocument();
  });

  it('마운트 시 PENDING 상태로 API 호출', async () => {
    renderWithProviders(<RequestsPage />);
    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledWith('PENDING'));
  });

  it('빈 데이터 응답 시 대기중 빈 상태 메시지 표시', async () => {
    renderWithProviders(<RequestsPage />);
    await waitFor(() =>
      expect(screen.getByText('대기중인 신청이 없어요')).toBeInTheDocument(),
    );
  });

  it('PENDING 아이템 렌더링 — 승인 대기 뱃지 표시', async () => {
    mockGetHistory.mockResolvedValue({ result: 'SUCCESS', data: [makePending()], error: null });
    renderWithProviders(<RequestsPage />);
    await waitFor(() => {
      expect(screen.getByText('무작위 매칭')).toBeInTheDocument();
      expect(screen.getByText('관리자 승인 대기중')).toBeInTheDocument();
    });
  });

  it('APPROVED 아이템에 "매칭 결과 보기" 버튼 표시', async () => {
    mockGetHistory.mockImplementation((status) => {
      if (status === 'APPROVED')
        return Promise.resolve({ result: 'SUCCESS', data: [makeApproved()], error: null });
      return Promise.resolve({ result: 'SUCCESS', data: [], error: null });
    });
    renderWithProviders(<RequestsPage />);
    await waitFor(() => expect(screen.getByText('대기중인 신청이 없어요')).toBeInTheDocument());

    fireEvent.click(screen.getByText('완료'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '매칭 결과 보기' })).toBeInTheDocument(),
    );
  });

  it('"매칭 결과 보기" 클릭 시 /requests/detail로 이동', async () => {
    mockGetHistory.mockImplementation((status) => {
      if (status === 'APPROVED')
        return Promise.resolve({ result: 'SUCCESS', data: [makeApproved()], error: null });
      return Promise.resolve({ result: 'SUCCESS', data: [], error: null });
    });
    renderWithProviders(<RequestsPage />);
    await waitFor(() => expect(screen.getByText('대기중인 신청이 없어요')).toBeInTheDocument());

    fireEvent.click(screen.getByText('완료'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '매칭 결과 보기' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: '매칭 결과 보기' }));
    expect(mockNavigate).toHaveBeenCalledWith('/requests/detail', { state: { applicationId: 2 } });
  });

  it('API 에러 시 재시도 UI 표시', async () => {
    mockGetHistory.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<RequestsPage />);
    await waitFor(() => {
      expect(screen.getByText('내역을 불러오지 못했습니다')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });

  it('"다시 시도" 클릭 시 API 재호출', async () => {
    mockGetHistory
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ result: 'SUCCESS', data: [], error: null });
    renderWithProviders(<RequestsPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledTimes(2));
  });

  it('탭 클릭 시 해당 상태로 API 재호출', async () => {
    renderWithProviders(<RequestsPage />);
    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledWith('PENDING'));

    fireEvent.click(screen.getByText('완료'));
    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledWith('APPROVED'));

    fireEvent.click(screen.getByText('거절'));
    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledWith('REJECTED'));
  });

  describe('취소 시트', () => {
    beforeEach(() => {
      mockGetHistory.mockResolvedValue({ result: 'SUCCESS', data: [makePending()], error: null });
    });

    it('"취소하기" 클릭 시 바텀 시트 열림', async () => {
      renderWithProviders(<RequestsPage />);
      await waitFor(() => expect(screen.getByText('취소하기')).toBeInTheDocument());
      fireEvent.click(screen.getByText('취소하기'));
      expect(screen.getByText('신청 취소')).toBeInTheDocument();
    });

    it('취소 사유 미선택 시 "취소 확인" 버튼 비활성화', async () => {
      renderWithProviders(<RequestsPage />);
      await waitFor(() => expect(screen.getByText('취소하기')).toBeInTheDocument());
      fireEvent.click(screen.getByText('취소하기'));
      expect(screen.getByRole('button', { name: '취소 확인' })).toBeDisabled();
    });

    it('취소 사유 선택 시 "취소 확인" 버튼 활성화', async () => {
      renderWithProviders(<RequestsPage />);
      await waitFor(() => expect(screen.getByText('취소하기')).toBeInTheDocument());
      fireEvent.click(screen.getByText('취소하기'));
      fireEvent.click(screen.getByText('실수로 신청했어요'));
      expect(screen.getByRole('button', { name: '취소 확인' })).not.toBeDisabled();
    });

    it('"취소 확인" 클릭 시 withdrawMatching(id) 호출', async () => {
      renderWithProviders(<RequestsPage />);
      await waitFor(() => expect(screen.getByText('취소하기')).toBeInTheDocument());
      fireEvent.click(screen.getByText('취소하기'));
      fireEvent.click(screen.getByText('실수로 신청했어요'));
      fireEvent.click(screen.getByRole('button', { name: '취소 확인' }));
      await waitFor(() => expect(mockWithdraw).toHaveBeenCalledWith(1));
    });

    it('취소 성공 시 해당 아이템 목록에서 제거', async () => {
      renderWithProviders(<RequestsPage />);
      await waitFor(() => expect(screen.getByText('취소하기')).toBeInTheDocument());
      fireEvent.click(screen.getByText('취소하기'));
      fireEvent.click(screen.getByText('실수로 신청했어요'));
      fireEvent.click(screen.getByRole('button', { name: '취소 확인' }));
      await waitFor(() =>
        expect(screen.queryByText('관리자 승인 대기중')).not.toBeInTheDocument(),
      );
    });

    it('취소 실패 시 에러 토스트 표시', async () => {
      mockWithdraw.mockRejectedValue(new Error('Failed'));
      renderWithProviders(<RequestsPage />);
      await waitFor(() => expect(screen.getByText('취소하기')).toBeInTheDocument());
      fireEvent.click(screen.getByText('취소하기'));
      fireEvent.click(screen.getByText('실수로 신청했어요'));
      fireEvent.click(screen.getByRole('button', { name: '취소 확인' }));
      await waitFor(() =>
        expect(
          screen.getByText('신청 취소에 실패했습니다. 다시 시도해주세요.'),
        ).toBeInTheDocument(),
      );
    });
  });
});
