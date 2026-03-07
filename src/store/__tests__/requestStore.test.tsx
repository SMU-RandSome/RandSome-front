import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { RequestProvider, useRequests } from '@/store/requestStore';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RequestProvider>{children}</RequestProvider>
);

describe('requestStore', () => {
  it('초기 더미 데이터가 존재함', () => {
    const { result } = renderHook(() => useRequests(), { wrapper });

    expect(result.current.requests.length).toBeGreaterThan(0);
  });

  it('addRequest로 새 신청이 맨 앞에 추가됨', () => {
    const { result } = renderHook(() => useRequests(), { wrapper });
    const initialLength = result.current.requests.length;

    act(() => {
      result.current.addRequest({ type: 'match_random', amount: 1000, count: 1 });
    });

    expect(result.current.requests.length).toBe(initialLength + 1);
    expect(result.current.requests[0].type).toBe('match_random');
  });

  it('addRequest로 추가된 신청은 status가 pending', () => {
    const { result } = renderHook(() => useRequests(), { wrapper });

    act(() => {
      result.current.addRequest({ type: 'register', amount: 3000 });
    });

    expect(result.current.requests[0].status).toBe('pending');
  });

  it('addRequest로 추가된 신청은 id가 자동 부여됨', () => {
    const { result } = renderHook(() => useRequests(), { wrapper });

    act(() => {
      result.current.addRequest({ type: 'match_ideal', amount: 1500, count: 1 });
    });

    expect(typeof result.current.requests[0].id).toBe('number');
  });

  it('addRequest로 추가된 신청은 createdAt이 존재함', () => {
    const { result } = renderHook(() => useRequests(), { wrapper });

    act(() => {
      result.current.addRequest({ type: 'match_random', amount: 2000, count: 2 });
    });

    expect(result.current.requests[0].createdAt).toBeTruthy();
  });

  it('RequestProvider 외부에서 useRequests 호출 시 에러', () => {
    expect(() => renderHook(() => useRequests())).toThrow(
      'useRequests must be used within a RequestProvider',
    );
  });
});
