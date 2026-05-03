import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useDisplayMode } from '@/store/displayModeStore';

vi.mock('@/store/displayModeStore', () => ({
  useDisplayMode: vi.fn(),
}));

const mockUseDisplayMode = vi.mocked(useDisplayMode);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PullToRefresh', () => {
  it('standalone이 아닐 때 children만 렌더링함', () => {
    mockUseDisplayMode.mockReturnValue({ isStandalone: false, isPWA: false });
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullToRefresh>
          <div>콘텐츠</div>
        </PullToRefresh>
      </Wrapper>,
    );
    expect(screen.getByText('콘텐츠')).toBeInTheDocument();
    // indicator 컨테이너가 없어야 함
    expect(document.querySelector('[style*="will-change"]')).toBeNull();
  });

  it('standalone일 때 indicator와 content 영역을 렌더링함', () => {
    mockUseDisplayMode.mockReturnValue({ isStandalone: true, isPWA: true });
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullToRefresh>
          <div>콘텐츠</div>
        </PullToRefresh>
      </Wrapper>,
    );
    expect(screen.getByText('콘텐츠')).toBeInTheDocument();
    // indicator가 willChange 스타일을 가진 요소로 렌더링됨
    expect(document.querySelector('[style*="will-change"]')).toBeTruthy();
  });

  it('children을 올바르게 전달함', () => {
    mockUseDisplayMode.mockReturnValue({ isStandalone: false, isPWA: false });
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullToRefresh>
          <div data-testid="child-1">첫 번째</div>
          <div data-testid="child-2">두 번째</div>
        </PullToRefresh>
      </Wrapper>,
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
