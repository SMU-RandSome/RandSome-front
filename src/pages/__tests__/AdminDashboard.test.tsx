import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import type { AdminReportListItem, AdminReportDetailResponse, PageResponse, ApiResponse } from '@/types';

vi.mock('motion/react');

vi.mock('@/features/admin/api', () => ({
  getAdminMembers: vi.fn(),
  getAdminMemberDetail: vi.fn(),
  getCandidateGenderCount: vi.fn(),
  registerAnnouncement: vi.fn(),
  getAdminMatchingApplications: vi.fn(),
  getAdminReports: vi.fn(),
  getAdminReportDetail: vi.fn(),
  resolveAdminReport: vi.fn(),
  rejectAdminReport: vi.fn(),
  restoreAdminMember: vi.fn(),
}));

vi.mock('@/features/announcement/api', () => ({
  getAnnouncements: vi.fn(),
}));

vi.mock('@/hooks/useFcmToken', () => ({
  unregisterFcmToken: vi.fn().mockResolvedValue(undefined),
  clearFcmToken: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import {
  getAdminMembers,
  getCandidateGenderCount,
  getAdminMatchingApplications,
  getAdminReports,
  getAdminReportDetail,
  resolveAdminReport,
  rejectAdminReport,
  restoreAdminMember,
} from '@/features/admin/api';
import { getAnnouncements } from '@/features/announcement/api';

const mockGetAdminReports = vi.mocked(getAdminReports);
const mockGetAdminReportDetail = vi.mocked(getAdminReportDetail);
const mockResolveAdminReport = vi.mocked(resolveAdminReport);
const mockRejectAdminReport = vi.mocked(rejectAdminReport);
const mockRestoreAdminMember = vi.mocked(restoreAdminMember);

// ── 헬퍼 ──────────────────────────────────────────────────────
function pageOf<T>(content: T[]): ApiResponse<PageResponse<T>> {
  return {
    result: 'SUCCESS',
    data: {
      content,
      currentPage: 0,
      totalPages: 1,
      totalElements: content.length,
      hasNext: false,
      hasPrevious: false,
    },
    error: null,
  };
}

function reportList(items: AdminReportListItem[]): ApiResponse<AdminReportListItem[]> {
  return { result: 'SUCCESS', data: items, error: null };
}

const makeReport = (overrides: Partial<AdminReportListItem> = {}): AdminReportListItem => ({
  id: 1,
  reporterNickname: '신고자닉네임',
  reportedMemberNickname: '피신고자닉네임',
  targetType: 'MATCHING_RESULT',
  reason: 'HARASSMENT',
  reportStatus: 'PENDING',
  createdAt: '2024-04-20T12:00:00',
  ...overrides,
});

const makeReportDetail = (overrides: Partial<AdminReportDetailResponse> = {}): AdminReportDetailResponse => ({
  id: 1,
  reporterId: 10,
  reporterNickname: '신고자닉네임',
  reportedMemberId: 20,
  reportedMemberNickname: '피신고자닉네임',
  targetType: 'MATCHING_RESULT',
  targetId: 100,
  reason: 'HARASSMENT',
  description: '심한 욕설을 했습니다.',
  reportStatus: 'PENDING',
  activeReportCount: 0,
  createdAt: '2024-04-20T12:00:00',
  ...overrides,
});

const switchToReportsTab = () => fireEvent.click(screen.getByText('신고 관리'));

// ── 테스트 ────────────────────────────────────────────────────
describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminMembers).mockResolvedValue(pageOf([]));
    vi.mocked(getCandidateGenderCount).mockResolvedValue({
      result: 'SUCCESS',
      data: { maleCount: 5, femaleCount: 3 },
      error: null,
    });
    vi.mocked(getAdminMatchingApplications).mockResolvedValue(pageOf([]));
    vi.mocked(getAnnouncements).mockResolvedValue({ result: 'SUCCESS', data: [], error: null });
    mockGetAdminReports.mockResolvedValue(reportList([]));
    mockGetAdminReportDetail.mockResolvedValue({ result: 'SUCCESS', data: makeReportDetail(), error: null });
    mockResolveAdminReport.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
    mockRejectAdminReport.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
    mockRestoreAdminMember.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
  });

  describe('기본 UI', () => {
    it('탭 6개(회원 관리·후보 신청·매칭 신청·공지사항·쿠폰 이벤트·신고 관리)가 렌더링됨', () => {
      renderWithProviders(<AdminDashboard />);
      expect(screen.getAllByText('회원 관리').length).toBeGreaterThan(0);
      expect(screen.getAllByText('후보 신청').length).toBeGreaterThan(0);
      expect(screen.getAllByText('매칭 신청').length).toBeGreaterThan(0);
      expect(screen.getAllByText('공지사항').length).toBeGreaterThan(0);
      expect(screen.getAllByText('쿠폰 이벤트').length).toBeGreaterThan(0);
      expect(screen.getAllByText('신고 관리').length).toBeGreaterThan(0);
    });

    it('로그아웃 버튼이 렌더링됨', () => {
      renderWithProviders(<AdminDashboard />);
      expect(screen.getAllByText('로그아웃').length).toBeGreaterThan(0);
    });

    it('로그아웃 클릭 시 navigate("/") 호출', () => {
      renderWithProviders(<AdminDashboard />);
      fireEvent.click(screen.getAllByText('로그아웃')[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('신고 관리 탭 — 목록', () => {
    it('"신고 관리" 탭 클릭 시 getAdminReports가 호출됨', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(mockGetAdminReports).toHaveBeenCalledTimes(1));
    });

    it('상태 필터 칩 4개(전체·대기 중·검토 중·처리 완료)가 렌더링됨', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('전체')).toBeInTheDocument());
      expect(screen.getByText('대기 중')).toBeInTheDocument();
      expect(screen.getByText('검토 중')).toBeInTheDocument();
      expect(screen.getByText('처리 완료')).toBeInTheDocument();
    });

    it('신고가 없을 때 빈 상태 메시지 표시', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() =>
        expect(screen.getByText('신고 내역이 없습니다.')).toBeInTheDocument(),
      );
    });

    it('PENDING 신고가 사유 한글 레이블과 상태 뱃지로 렌더링됨', async () => {
      mockGetAdminReports.mockResolvedValue(reportList([makeReport({ reason: 'HARASSMENT', reportStatus: 'PENDING' })]));
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());
      // "대기 중"은 필터 칩(1)과 상태 뱃지(1) 양쪽에 표시됨
      expect(screen.getAllByText('대기 중')).toHaveLength(2);
    });

    it('RESOLVED 신고가 "처리됨" 뱃지로 렌더링됨', async () => {
      mockGetAdminReports.mockResolvedValue(reportList([makeReport({ reportStatus: 'RESOLVED' })]));
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());
      expect(screen.getByText('처리됨')).toBeInTheDocument();
    });

    it('REJECTED 신고가 "거절됨" 뱃지로 렌더링됨', async () => {
      mockGetAdminReports.mockResolvedValue(reportList([makeReport({ reportStatus: 'REJECTED' })]));
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());
      expect(screen.getByText('거절됨')).toBeInTheDocument();
    });

    it('다양한 신고 사유가 올바른 한글로 렌더링됨', async () => {
      mockGetAdminReports.mockResolvedValue(reportList([
        makeReport({ id: 1, reason: 'INAPPROPRIATE_CONTENT' }),
        makeReport({ id: 2, reason: 'FAKE_PROFILE' }),
        makeReport({ id: 3, reason: 'SCAM' }),
      ]));
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => {
        expect(screen.getByText('부적절한 내용')).toBeInTheDocument();
        expect(screen.getByText('허위 프로필')).toBeInTheDocument();
        expect(screen.getByText('사기')).toBeInTheDocument();
      });
    });
  });

  describe('신고 관리 탭 — 상태 필터', () => {
    it('"대기 중" 필터 클릭 시 statusFilter: PENDING 으로 재조회', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('대기 중')).toBeInTheDocument());

      fireEvent.click(screen.getByText('대기 중'));

      await waitFor(() =>
        expect(mockGetAdminReports).toHaveBeenCalledWith(
          expect.objectContaining({ statusFilter: 'PENDING' }),
        ),
      );
    });

    it('"검토 중" 필터 클릭 시 statusFilter: IN_REVIEW 로 재조회', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('검토 중')).toBeInTheDocument());

      fireEvent.click(screen.getByText('검토 중'));

      await waitFor(() =>
        expect(mockGetAdminReports).toHaveBeenCalledWith(
          expect.objectContaining({ statusFilter: 'IN_REVIEW' }),
        ),
      );
    });

    it('"처리 완료" 필터 클릭 시 statusFilter: COMPLETED 로 재조회', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('처리 완료')).toBeInTheDocument());

      fireEvent.click(screen.getByText('처리 완료'));

      await waitFor(() =>
        expect(mockGetAdminReports).toHaveBeenCalledWith(
          expect.objectContaining({ statusFilter: 'COMPLETED' }),
        ),
      );
    });

    it('"전체" 필터 클릭 시 statusFilter 파라미터 없이 재조회', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('대기 중')).toBeInTheDocument());

      // PENDING으로 변경 후 다시 전체로
      fireEvent.click(screen.getByText('대기 중'));
      await waitFor(() => expect(mockGetAdminReports).toHaveBeenCalledTimes(2));

      fireEvent.click(screen.getByText('전체'));
      await waitFor(() => expect(mockGetAdminReports).toHaveBeenCalledTimes(3));

      expect(mockGetAdminReports.mock.calls[2][0]).toBeUndefined();
    });
  });

  describe('신고 관리 탭 — 신고 상세 모달', () => {
    beforeEach(() => {
      mockGetAdminReports.mockResolvedValue(reportList([makeReport()]));
    });

    it('신고 아이템 클릭 시 getAdminReportDetail(id) 호출', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());

      fireEvent.click(screen.getByText('괴롭힘'));

      await waitFor(() => expect(mockGetAdminReportDetail).toHaveBeenCalledWith(1));
    });

    it('신고자·피신고자 닉네임이 모달에 표시됨', async () => {
      mockGetAdminReportDetail.mockResolvedValue({
        result: 'SUCCESS',
        data: makeReportDetail({ reporterNickname: '김철수', reportedMemberNickname: '이영희' }),
        error: null,
      });
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());

      fireEvent.click(screen.getByText('괴롭힘'));

      await waitFor(() => {
        expect(screen.getByText('김철수')).toBeInTheDocument();
        expect(screen.getByText('이영희')).toBeInTheDocument();
      });
    });

    it('신고 상세 내용이 모달에 표시됨', async () => {
      mockGetAdminReportDetail.mockResolvedValue({
        result: 'SUCCESS',
        data: makeReportDetail({ description: '폭력적인 언어를 사용했습니다.' }),
        error: null,
      });
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());

      fireEvent.click(screen.getByText('괴롭힘'));

      await waitFor(() =>
        expect(screen.getByText('폭력적인 언어를 사용했습니다.')).toBeInTheDocument(),
      );
    });

    it('활성 신고 건수가 1 이상이면 경고 뱃지 표시', async () => {
      mockGetAdminReportDetail.mockResolvedValue({
        result: 'SUCCESS',
        data: makeReportDetail({ activeReportCount: 3 }),
        error: null,
      });
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());

      fireEvent.click(screen.getByText('괴롭힘'));

      await waitFor(() =>
        expect(screen.getByText('활성 신고 3건')).toBeInTheDocument(),
      );
    });

    it('활성 신고 건수가 0이면 경고 뱃지 미표시', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());

      fireEvent.click(screen.getByText('괴롭힘'));

      await waitFor(() => expect(screen.getByText('신고자닉네임')).toBeInTheDocument());
      expect(screen.queryByText(/활성 신고/)).not.toBeInTheDocument();
    });

    it('X 버튼 클릭 시 모달이 닫힘', async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());
      fireEvent.click(screen.getByText('괴롭힘'));
      await waitFor(() => expect(screen.getByText('신고자닉네임')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '닫기' }));

      await waitFor(() =>
        expect(screen.queryByText('신고자닉네임')).not.toBeInTheDocument(),
      );
    });
  });

  describe('신고 관리 탭 — PENDING 신고 처리', () => {
    beforeEach(() => {
      mockGetAdminReports.mockResolvedValue(reportList([makeReport({ reportStatus: 'PENDING' })]));
      mockGetAdminReportDetail.mockResolvedValue({
        result: 'SUCCESS',
        data: makeReportDetail({ reportStatus: 'PENDING' }),
        error: null,
      });
    });

    const openPendingModal = async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());
      fireEvent.click(screen.getByText('괴롭힘'));
      await waitFor(() => expect(screen.getByText('신고자닉네임')).toBeInTheDocument());
    };

    it('PENDING 신고 모달에 "처리 (경고)" 버튼이 표시됨', async () => {
      await openPendingModal();
      expect(screen.getByRole('button', { name: '처리 (경고)' })).toBeInTheDocument();
    });

    it('PENDING 신고 모달에 "거절" 버튼이 표시됨', async () => {
      await openPendingModal();
      expect(screen.getByRole('button', { name: '거절' })).toBeInTheDocument();
    });

    it('"처리 (경고)" 클릭 시 resolveAdminReport(id) 호출', async () => {
      await openPendingModal();
      fireEvent.click(screen.getByRole('button', { name: '처리 (경고)' }));
      await waitFor(() => expect(mockResolveAdminReport).toHaveBeenCalledWith(1));
    });

    it('처리 성공 시 모달이 닫히고 신고 목록이 재조회됨', async () => {
      await openPendingModal();
      fireEvent.click(screen.getByRole('button', { name: '처리 (경고)' }));
      await waitFor(() => {
        expect(screen.queryByText('신고자닉네임')).not.toBeInTheDocument();
        expect(mockGetAdminReports).toHaveBeenCalledTimes(2);
      });
    });

    it('"거절" 클릭 시 rejectAdminReport(id) 호출', async () => {
      await openPendingModal();
      fireEvent.click(screen.getByRole('button', { name: '거절' }));
      await waitFor(() => expect(mockRejectAdminReport).toHaveBeenCalledWith(1));
    });

    it('거절 성공 시 모달이 닫히고 신고 목록이 재조회됨', async () => {
      await openPendingModal();
      fireEvent.click(screen.getByRole('button', { name: '거절' }));
      await waitFor(() => {
        expect(screen.queryByText('신고자닉네임')).not.toBeInTheDocument();
        expect(mockGetAdminReports).toHaveBeenCalledTimes(2);
      });
    });

    it('처리 중에는 버튼이 비활성화됨', async () => {
      // 처리 응답을 지연시켜 로딩 상태 확인
      mockResolveAdminReport.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ result: 'SUCCESS', data: null, error: null }), 200)),
      );
      await openPendingModal();
      fireEvent.click(screen.getByRole('button', { name: '처리 (경고)' }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled(),
      );
    });
  });

  describe('신고 관리 탭 — RESOLVED 신고 (회원 복구)', () => {
    beforeEach(() => {
      mockGetAdminReports.mockResolvedValue(reportList([makeReport({ reportStatus: 'RESOLVED' })]));
      mockGetAdminReportDetail.mockResolvedValue({
        result: 'SUCCESS',
        data: makeReportDetail({ reportStatus: 'RESOLVED' }),
        error: null,
      });
    });

    const openResolvedModal = async () => {
      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());
      fireEvent.click(screen.getByText('괴롭힘'));
      await waitFor(() => expect(screen.getByText('신고자닉네임')).toBeInTheDocument());
    };

    it('RESOLVED 신고 모달에 "회원 복구" 버튼이 표시됨', async () => {
      await openResolvedModal();
      expect(screen.getByRole('button', { name: '회원 복구' })).toBeInTheDocument();
    });

    it('RESOLVED 신고 모달에 처리·거절 버튼이 표시되지 않음', async () => {
      await openResolvedModal();
      expect(screen.queryByRole('button', { name: '처리 (경고)' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '거절' })).not.toBeInTheDocument();
    });

    it('"회원 복구" 클릭 시 restoreAdminMember(reportedMemberId) 호출', async () => {
      await openResolvedModal();
      fireEvent.click(screen.getByRole('button', { name: '회원 복구' }));
      await waitFor(() => expect(mockRestoreAdminMember).toHaveBeenCalledWith(20));
    });

    it('복구 성공 시 모달이 닫히고 신고 목록이 재조회됨', async () => {
      await openResolvedModal();
      fireEvent.click(screen.getByRole('button', { name: '회원 복구' }));
      await waitFor(() => {
        expect(screen.queryByText('신고자닉네임')).not.toBeInTheDocument();
        expect(mockGetAdminReports).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('신고 관리 탭 — REJECTED 신고', () => {
    it('REJECTED 신고 모달에 액션 버튼이 없음', async () => {
      mockGetAdminReports.mockResolvedValue(reportList([makeReport({ reportStatus: 'REJECTED' })]));
      mockGetAdminReportDetail.mockResolvedValue({
        result: 'SUCCESS',
        data: makeReportDetail({ reportStatus: 'REJECTED' }),
        error: null,
      });

      renderWithProviders(<AdminDashboard />);
      switchToReportsTab();
      await waitFor(() => expect(screen.getByText('괴롭힘')).toBeInTheDocument());
      fireEvent.click(screen.getByText('괴롭힘'));
      await waitFor(() => expect(screen.getByText('신고자닉네임')).toBeInTheDocument());

      expect(screen.queryByRole('button', { name: '처리 (경고)' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '거절' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '회원 복구' })).not.toBeInTheDocument();
    });
  });
});
