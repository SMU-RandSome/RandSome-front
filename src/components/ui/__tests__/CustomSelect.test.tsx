import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomSelect } from '@/components/ui/CustomSelect';

const OPTIONS = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'cherry', label: '체리' },
];

describe('CustomSelect', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('placeholder를 렌더링함', () => {
    render(<CustomSelect options={OPTIONS} value="" onChange={mockOnChange} placeholder="과일 선택" />);
    expect(screen.getByText('과일 선택')).toBeInTheDocument();
  });

  it('선택된 값이 있으면 해당 라벨을 표시함', () => {
    render(<CustomSelect options={OPTIONS} value="banana" onChange={mockOnChange} />);
    expect(screen.getByText('바나나')).toBeInTheDocument();
  });

  it('클릭하면 드롭다운이 열림', async () => {
    render(<CustomSelect options={OPTIONS} value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('사과')).toBeInTheDocument();
      expect(screen.getByText('바나나')).toBeInTheDocument();
      expect(screen.getByText('체리')).toBeInTheDocument();
    });
  });

  it('드롭다운 portal의 z-index가 80임', async () => {
    render(<CustomSelect options={OPTIONS} value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      const dropdown = document.querySelector('[data-custom-select-dropdown]') as HTMLElement;
      expect(dropdown).toBeTruthy();
      expect(dropdown.style.zIndex).toBe('80');
    });
  });

  it('옵션 클릭 시 onChange 호출됨', async () => {
    render(<CustomSelect options={OPTIONS} value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('체리')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('체리'));
    expect(mockOnChange).toHaveBeenCalledWith('cherry');
  });

  it('옵션 선택 후 드롭다운이 닫힘', async () => {
    render(<CustomSelect options={OPTIONS} value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('사과')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('사과'));
    await waitFor(() => {
      expect(document.querySelector('[data-custom-select-dropdown]')).toBeNull();
    });
  });

  it('error prop이 있으면 에러 메시지를 표시함', () => {
    render(<CustomSelect options={OPTIONS} value="" onChange={mockOnChange} error="필수입니다" />);
    expect(screen.getByText('필수입니다')).toBeInTheDocument();
  });

  it('label prop이 있으면 라벨을 표시함', () => {
    render(<CustomSelect options={OPTIONS} value="" onChange={mockOnChange} label="과일" />);
    expect(screen.getByText('과일')).toBeInTheDocument();
  });

  it('선택된 옵션에 체크 아이콘이 표시됨', async () => {
    render(<CustomSelect options={OPTIONS} value="apple" onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      const selected = screen.getByRole('option', { selected: true });
      expect(selected).toHaveTextContent('사과');
    });
  });
});
