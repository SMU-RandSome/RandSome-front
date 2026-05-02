import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

vi.mock('motion/react');
vi.mock('@/hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

const OPTIONS = [
  { value: 'a', label: '옵션A' },
  { value: 'b', label: '옵션B' },
  { value: 'c', label: '옵션C' },
];

describe('SearchableSelect', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('placeholder 텍스트를 렌더링함', () => {
    render(
      <SearchableSelect options={OPTIONS} value="" onChange={mockOnChange} placeholder="선택해주세요" />,
    );
    expect(screen.getByText('선택해주세요')).toBeInTheDocument();
  });

  it('선택된 값이 있으면 해당 라벨을 표시함', () => {
    render(
      <SearchableSelect options={OPTIONS} value="b" onChange={mockOnChange} />,
    );
    expect(screen.getByText('옵션B')).toBeInTheDocument();
  });

  it('버튼 클릭 시 바텀시트가 열림', async () => {
    render(
      <SearchableSelect options={OPTIONS} value="" onChange={mockOnChange} label="학과" />,
    );
    fireEvent.click(screen.getByRole('button', { name: /학과|선택/ }));
    await waitFor(() => {
      expect(screen.getByText('옵션A')).toBeInTheDocument();
    });
  });

  it('옵션 선택 시 onChange 호출 및 시트 닫힘', async () => {
    render(
      <SearchableSelect options={OPTIONS} value="" onChange={mockOnChange} label="테스트" />,
    );
    fireEvent.click(screen.getByRole('button', { name: /테스트|선택/ }));
    await waitFor(() => {
      expect(screen.getByText('옵션A')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('옵션A'));
    expect(mockOnChange).toHaveBeenCalledWith('a');
  });

  it('열린 상태에서 useScrollLock이 호출됨', async () => {
    const { useScrollLock } = await import('@/hooks/useScrollLock');
    const mockScrollLock = vi.mocked(useScrollLock);

    render(
      <SearchableSelect options={OPTIONS} value="" onChange={mockOnChange} />,
    );
    // 닫힌 상태: useScrollLock(false)
    expect(mockScrollLock).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button'));
    // 열린 상태: useScrollLock(true)
    await waitFor(() => {
      expect(mockScrollLock).toHaveBeenCalledWith(true);
    });
  });

  it('검색으로 옵션 필터링됨', async () => {
    render(
      <SearchableSelect options={OPTIONS} value="" onChange={mockOnChange} />,
    );
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('검색...'), { target: { value: 'C' } });
    await waitFor(() => {
      expect(screen.getByText('옵션C')).toBeInTheDocument();
      expect(screen.queryByText('옵션A')).not.toBeInTheDocument();
    });
  });

  it('error prop이 있으면 에러 메시지를 표시함', () => {
    render(
      <SearchableSelect options={OPTIONS} value="" onChange={mockOnChange} error="필수 항목입니다" />,
    );
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
  });

  it('visualViewport 이벤트 리스너가 열릴 때 등록되고 닫힐 때 해제됨', async () => {
    const addSpy = vi.fn();
    const removeSpy = vi.fn();
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      value: {
        height: 800,
        offsetTop: 0,
        addEventListener: addSpy,
        removeEventListener: removeSpy,
      },
    });

    const { unmount } = render(
      <SearchableSelect options={OPTIONS} value="" onChange={mockOnChange} />,
    );
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
