import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import LoginPage from '@/pages/LoginPage';

vi.mock('motion/react');

vi.mock('@/features/auth/api', () => ({
  login: vi.fn(),
}));
vi.mock('@/features/member/api', () => ({
  getMyProfile: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { login as loginApi } from '@/features/auth/api';
import { getMyProfile } from '@/features/member/api';
const mockLogin = vi.mocked(loginApi);
const mockGetMyProfile = vi.mocked(getMyProfile);

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin.mockResolvedValue({
      result: 'SUCCESS',
      data: { accessToken: 'acc', refreshToken: 'ref' },
      error: null,
    });
    mockGetMyProfile.mockResolvedValue({
      result: 'SUCCESS',
      data: {
        id: 1, email: 'test@sangmyung.kr', nickname: '행복한 쿼카',
        legalName: '홍길동', gender: 'MALE', mbti: 'ENFP', role: 'ROLE_MEMBER',
      },
      error: null,
    });
  });

  it('이메일, 비밀번호 입력창이 렌더링됨', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText('학교 이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('로그인 버튼이 렌더링됨', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeInTheDocument();
  });

  it('초기 상태에서 로그인 버튼이 비활성화됨', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();
  });

  it('이메일만 입력 시 버튼 비활성화 유지', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'testuser');
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();
  });

  it('비밀번호만 입력 시 버튼 비활성화 유지', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();
  });

  it('이메일 + 비밀번호 모두 입력 시 버튼 활성화', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'testuser');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
    expect(screen.getByRole('button', { name: '로그인하기' })).not.toBeDisabled();
  });

  it('폼 제출 시 @sangmyung.kr 붙여서 loginApi 호출', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'testuser');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인하기' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'testuser@sangmyung.kr',
        password: 'password123',
      });
    });
  });

  it('일반 회원 로그인 성공 시 /home으로 이동', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'testuser');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인하기' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('관리자 로그인 성공 시 /admin으로 이동', async () => {
    mockGetMyProfile.mockResolvedValue({
      result: 'SUCCESS',
      data: {
        id: 2, email: 'admin@sangmyung.kr', nickname: '관리자',
        legalName: '관리자', gender: 'MALE', mbti: 'ENTJ', role: 'ROLE_ADMIN',
      },
      error: null,
    });

    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'admin');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'adminpass');
    await userEvent.click(screen.getByRole('button', { name: '로그인하기' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('회원가입 링크가 렌더링됨', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
  });

  it('회원가입 클릭 시 /signup으로 이동', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});
