import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import SignupPage from '@/pages/SignupPage';

vi.mock('motion/react');

vi.mock('@/features/auth/api', () => ({
  sendEmailVerificationCode: vi.fn(),
  verifyEmailCode: vi.fn(),
  login: vi.fn(),
}));
vi.mock('@/features/member/api', () => ({
  getMyProfile: vi.fn(),
}));
vi.mock('@/lib/axios', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { sendEmailVerificationCode, verifyEmailCode } from '@/features/auth/api';
const mockSendCode = vi.mocked(sendEmailVerificationCode);
const mockVerifyCode = vi.mocked(verifyEmailCode);

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendCode.mockResolvedValue({ result: 'SUCCESS', data: null, error: null });
    mockVerifyCode.mockResolvedValue({
      result: 'SUCCESS',
      data: { emailVerificationToken: 'tok-abc' },
      error: null,
    });
  });

  it('"회원가입" 제목과 "Step 1 / 3" 표시', () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByText('회원가입')).toBeInTheDocument();
    expect(screen.getByText('Step 1 / 3')).toBeInTheDocument();
  });

  it('이메일 입력 필드와 @sangmyung.kr suffix 렌더링', () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByPlaceholderText('이메일 아이디')).toBeInTheDocument();
    expect(screen.getByText('@sangmyung.kr')).toBeInTheDocument();
  });

  it('이메일 미입력 시 "인증" 버튼 비활성화', () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByRole('button', { name: '인증' })).toBeDisabled();
  });

  it('이메일 입력 시 "인증" 버튼 활성화', async () => {
    renderWithProviders(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText('이메일 아이디'), {
      target: { value: 'testuser' },
    });
    expect(screen.getByRole('button', { name: '인증' })).not.toBeDisabled();
  });

  it('"인증" 클릭 시 @sangmyung.kr 붙여서 sendEmailVerificationCode 호출', async () => {
    renderWithProviders(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText('이메일 아이디'), {
      target: { value: 'testuser' },
    });
    fireEvent.click(screen.getByRole('button', { name: '인증' }));
    await waitFor(() =>
      expect(mockSendCode).toHaveBeenCalledWith({ email: 'testuser@sangmyung.kr' }),
    );
  });

  it('인증 코드 발송 후 코드 입력 필드 표시', async () => {
    renderWithProviders(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText('이메일 아이디'), {
      target: { value: 'testuser' },
    });
    fireEvent.click(screen.getByRole('button', { name: '인증' }));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('인증코드 입력')).toBeInTheDocument(),
    );
  });

  it('비밀번호 확인 불일치 시 경고 메시지 표시', async () => {
    renderWithProviders(<SignupPage />);
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'different456' },
    });
    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
  });

  it('비밀번호 일치 시 확인 메시지 표시', async () => {
    renderWithProviders(<SignupPage />);
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'password123' },
    });
    expect(screen.getByText('비밀번호가 일치합니다.')).toBeInTheDocument();
  });

  it('초기 상태에서 "다음 단계" 버튼 비활성화', () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByRole('button', { name: '다음 단계' })).toBeDisabled();
  });

  it('이메일 인증 완료 후 인증 완료 메시지 표시', async () => {
    renderWithProviders(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText('이메일 아이디'), {
      target: { value: 'testuser' },
    });
    fireEvent.click(screen.getByRole('button', { name: '인증' }));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('인증코드 입력')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByPlaceholderText('인증코드 입력'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    await waitFor(() =>
      expect(screen.getByText('인증이 완료되었습니다.')).toBeInTheDocument(),
    );
  });
});
