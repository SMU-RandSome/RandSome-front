import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import LoginPage from '@/pages/LoginPage';

vi.mock('motion/react');

// useNavigate mock
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
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
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'test@sangmyung.kr');
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();
  });

  it('비밀번호만 입력 시 버튼 비활성화 유지', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
    expect(screen.getByRole('button', { name: '로그인하기' })).toBeDisabled();
  });

  it('이메일 + 비밀번호 모두 입력 시 버튼 활성화', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'test@sangmyung.kr');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
    expect(screen.getByRole('button', { name: '로그인하기' })).not.toBeDisabled();
  });

  it('폼 제출 시 /home으로 이동', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('학교 이메일'), 'test@sangmyung.kr');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인하기' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
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

  it('숨겨진 관리자 버튼이 DOM에 존재함 (aria-label="Admin Access")', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText('Admin Access')).toBeInTheDocument();
  });

  it('관리자 버튼 클릭 시 /admin으로 이동', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.click(screen.getByLabelText('Admin Access'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });
});
