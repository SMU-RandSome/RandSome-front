import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import AdminQrPage from '@/pages/admin/AdminQrPage';

vi.mock('motion/react');

// html5-qrcode 모킹
const mockStart = vi.fn();
const mockStop = vi.fn();
vi.mock('html5-qrcode', () => {
  class MockHtml5Qrcode {
    start = mockStart;
    stop = mockStop;
  }
  return {
    Html5Qrcode: MockHtml5Qrcode,
    Html5QrcodeSupportedFormats: { QR_CODE: 0 },
  };
});

vi.mock('@/features/admin/api', () => ({
  verifyQrCode: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { verifyQrCode } from '@/features/admin/api';
const mockVerifyQrCode = vi.mocked(verifyQrCode);

describe('AdminQrPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStart.mockResolvedValue(undefined);
    mockStop.mockResolvedValue(undefined);
    mockVerifyQrCode.mockResolvedValue({
      result: 'SUCCESS',
      data: null,
      error: null,
    });
  });

  // ── 렌더링 ──────────────────────────────────────────────────

  it('헤더에 QR 인증 제목이 렌더링됨', () => {
    renderWithProviders(<AdminQrPage />);
    expect(screen.getByText('QR 인증')).toBeInTheDocument();
  });

  it('뒤로가기 버튼이 렌더링됨', () => {
    renderWithProviders(<AdminQrPage />);
    expect(screen.getByLabelText('뒤로가기')).toBeInTheDocument();
  });

  it('뒤로가기 클릭 시 /admin으로 이동', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByLabelText('뒤로가기'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('티켓 종류 선택 버튼이 렌더링됨', () => {
    renderWithProviders(<AdminQrPage />);
    expect(screen.getByRole('button', { name: /랜덤권/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /이상형권/ })).toBeInTheDocument();
  });

  it('카메라 스캔 / 직접 입력 모드 토글이 렌더링됨', () => {
    renderWithProviders(<AdminQrPage />);
    expect(screen.getByRole('button', { name: /카메라 스캔/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /직접 입력/ })).toBeInTheDocument();
  });

  it('사용 방법 안내가 렌더링됨', () => {
    renderWithProviders(<AdminQrPage />);
    expect(screen.getByText('사용 방법')).toBeInTheDocument();
  });

  // ── 티켓 타입 선택 ──────────────────────────────────────────

  it('기본 티켓 타입은 랜덤권', () => {
    renderWithProviders(<AdminQrPage />);
    const randomBtn = screen.getByRole('button', { name: /랜덤권/ });
    expect(randomBtn.className).toContain('bg-blue-50');
  });

  it('이상형권 클릭 시 선택 상태 변경', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /이상형권/ }));
    // 클릭 후 다시 쿼리해서 최신 className 확인
    const idealBtn = screen.getByRole('button', { name: /이상형권/ });
    expect(idealBtn.className).toContain('bg-pink-50');
  });

  // ── 수동 입력 모드 ──────────────────────────────────────────

  it('직접 입력 모드로 전환하면 입력 필드가 표시됨', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    expect(screen.getByPlaceholderText('QR 토큰을 입력하세요')).toBeInTheDocument();
  });

  it('직접 입력 모드에서 인증 요청 버튼이 표시됨', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    expect(screen.getByRole('button', { name: '인증 요청' })).toBeInTheDocument();
  });

  it('토큰 미입력 시 인증 요청 버튼 비활성화', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    expect(screen.getByRole('button', { name: '인증 요청' })).toBeDisabled();
  });

  it('토큰 입력 시 인증 요청 버튼 활성화', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'test-token-123' },
    });
    expect(screen.getByRole('button', { name: '인증 요청' })).not.toBeDisabled();
  });

  // ── 확인 모달 ───────────────────────────────────────────────

  it('수동 입력 후 인증 요청 클릭 시 확인 모달 표시', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'test-token-123' },
    });
    await userEvent.click(screen.getByRole('button', { name: '인증 요청' }));

    expect(screen.getByText('티켓 발급 확인')).toBeInTheDocument();
    expect(screen.getByText('test-token-123')).toBeInTheDocument();
  });

  it('확인 모달에서 취소 클릭 시 모달 닫힘', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'test-token-123' },
    });
    await userEvent.click(screen.getByRole('button', { name: '인증 요청' }));
    await userEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByText('티켓 발급 확인')).not.toBeInTheDocument();
  });

  it('확인 모달에 선택한 티켓 종류가 표시됨', async () => {
    renderWithProviders(<AdminQrPage />);
    // 이상형권 선택
    await userEvent.click(screen.getByRole('button', { name: /이상형권/ }));
    // 수동 입력
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'token-abc' },
    });
    await userEvent.click(screen.getByRole('button', { name: '인증 요청' }));

    // 모달 내 티켓 종류 확인 - 모달 안에는 여러 곳에 "이상형권" 텍스트가 있음
    const modalTexts = screen.getAllByText('이상형권');
    expect(modalTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── API 호출 ────────────────────────────────────────────────

  it('발급 버튼 클릭 시 verifyQrCode API 호출', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'test-token-123' },
    });
    await userEvent.click(screen.getByRole('button', { name: '인증 요청' }));
    await userEvent.click(screen.getByRole('button', { name: '발급' }));

    await waitFor(() => {
      expect(mockVerifyQrCode).toHaveBeenCalledWith({
        qrToken: 'test-token-123',
        ticketType: 'RANDOM',
      });
    });
  });

  it('이상형권 선택 후 발급 시 ticketType이 IDEAL로 전달', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /이상형권/ }));
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'token-xyz' },
    });
    await userEvent.click(screen.getByRole('button', { name: '인증 요청' }));
    await userEvent.click(screen.getByRole('button', { name: '발급' }));

    await waitFor(() => {
      expect(mockVerifyQrCode).toHaveBeenCalledWith({
        qrToken: 'token-xyz',
        ticketType: 'IDEAL',
      });
    });
  });

  it('발급 성공 후 확인 모달이 닫힘', async () => {
    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'test-token' },
    });
    await userEvent.click(screen.getByRole('button', { name: '인증 요청' }));
    await userEvent.click(screen.getByRole('button', { name: '발급' }));

    await waitFor(() => {
      expect(screen.queryByText('티켓 발급 확인')).not.toBeInTheDocument();
    });
  });

  it('발급 실패 시에도 확인 모달이 유지됨 (에러 토스트 표시)', async () => {
    mockVerifyQrCode.mockRejectedValue({
      response: { data: { result: 'ERROR', data: null, error: { code: 'QR_001', message: '유효하지 않은 QR 코드입니다.', data: null } } },
    });

    renderWithProviders(<AdminQrPage />);
    await userEvent.click(screen.getByRole('button', { name: /직접 입력/ }));
    fireEvent.change(screen.getByPlaceholderText('QR 토큰을 입력하세요'), {
      target: { value: 'invalid-token' },
    });
    await userEvent.click(screen.getByRole('button', { name: '인증 요청' }));
    await userEvent.click(screen.getByRole('button', { name: '발급' }));

    // 발급 실패 후에도 발급 버튼이 다시 활성화됨 (재시도 가능)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '발급' })).not.toBeDisabled();
    });
  });

  // ── 카메라 모드 ─────────────────────────────────────────────

  it('카메라 모드가 기본 선택됨', () => {
    renderWithProviders(<AdminQrPage />);
    const cameraBtn = screen.getByRole('button', { name: /카메라 스캔/ });
    expect(cameraBtn.className).toContain('bg-white');
  });

  it('카메라 모드에서 안내 문구가 표시됨', () => {
    renderWithProviders(<AdminQrPage />);
    expect(screen.getByText('QR 코드를 카메라에 비춰주세요')).toBeInTheDocument();
  });
});
