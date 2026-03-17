import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/Toast';

vi.mock('motion/react');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ToastProvider 외부에서 useToast 호출 시 에러', () => {
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within a ToastProvider',
    );
  });

  it('toast 호출 시 메시지가 화면에 표시됨', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.toast('테스트 메시지');
    });

    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
  });

  it('success 타입 토스트가 표시됨', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.toast('성공 메시지', 'success');
    });

    expect(screen.getByText('성공 메시지')).toBeInTheDocument();
    expect(document.querySelector('.bg-green-100')).toBeInTheDocument();
  });

  it('error 타입 토스트가 표시됨', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.toast('에러 메시지', 'error');
    });

    expect(screen.getByText('에러 메시지')).toBeInTheDocument();
    expect(document.querySelector('.bg-red-100')).toBeInTheDocument();
  });

  it('info 타입 토스트가 표시됨 (기본값)', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.toast('안내 메시지', 'info');
    });

    expect(screen.getByText('안내 메시지')).toBeInTheDocument();
    expect(document.querySelector('.bg-blue-100')).toBeInTheDocument();
  });

  it('3초 후 토스트 자동 제거', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.toast('사라질 메시지');
    });

    expect(screen.getByText('사라질 메시지')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('사라질 메시지')).not.toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 즉시 제거', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.toast('닫을 메시지');
    });

    expect(screen.getByText('닫을 메시지')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByLabelText('닫기'));
    });

    expect(screen.queryByText('닫을 메시지')).not.toBeInTheDocument();
  });

  it('여러 토스트가 동시에 표시됨', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.toast('첫 번째');
      result.current.toast('두 번째');
    });

    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();
  });
});
