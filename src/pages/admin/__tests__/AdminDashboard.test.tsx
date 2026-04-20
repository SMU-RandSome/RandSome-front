import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import AdminDashboard from '@/pages/admin/AdminDashboard';

vi.mock('motion/react');

vi.mock('@/features/admin/api', () => ({
  getAdminMembers: vi.fn().mockResolvedValue({ data: { content: [], totalPages: 1 } }),
  getAdminMemberDetail: vi.fn(),
  getCandidateGenderCount: vi.fn().mockResolvedValue({ data: { maleCount: 5, femaleCount: 3 } }),
  registerAnnouncement: vi.fn(),
  getAdminMatchingApplications: vi.fn().mockResolvedValue({ data: { content: [], totalPages: 1 } }),
}));

vi.mock('@/features/announcement/api', () => ({
  getAnnouncements: vi.fn().mockResolvedValue({ data: [] }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('AdminDashboard - QR 버튼', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('헤더에 QR 버튼이 렌더링됨', async () => {
    renderWithProviders(<AdminDashboard />);
    // 비동기 상태 업데이트 대기
    await waitFor(() => {
      expect(screen.getByLabelText('QR 인증')).toBeInTheDocument();
    });
  });

  it('QR 버튼 클릭 시 /admin/qr로 이동', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByLabelText('QR 인증')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByLabelText('QR 인증'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/qr');
  });
});
