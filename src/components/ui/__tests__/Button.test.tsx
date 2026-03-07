import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

vi.mock('motion/react');

describe('Button', () => {
  it('자식 텍스트를 렌더링함', () => {
    render(<Button>클릭하세요</Button>);
    expect(screen.getByRole('button', { name: '클릭하세요' })).toBeInTheDocument();
  });

  it('기본 variant는 primary (bg-blue-600 클래스)', () => {
    render(<Button>버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });

  it('variant=secondary 클래스 적용', () => {
    render(<Button variant="secondary">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-slate-100');
  });

  it('variant=outline 클래스 적용', () => {
    render(<Button variant="outline">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    expect(screen.getByRole('button')).toHaveClass('border-slate-300');
  });

  it('variant=ghost 클래스 적용', () => {
    render(<Button variant="ghost">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('size=sm 클래스 적용', () => {
    render(<Button size="sm">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
  });

  it('size=lg 클래스 적용', () => {
    render(<Button size="lg">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-13');
  });

  it('fullWidth=true 시 w-full 클래스 추가', () => {
    render(<Button fullWidth>버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('fullWidth=false(기본) 시 w-full 클래스 없음', () => {
    render(<Button>버튼</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('w-full');
  });

  it('onClick 핸들러가 호출됨', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>버튼</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled 상태에서 onClick 호출되지 않음', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>버튼</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled 상태에서 disabled:opacity-50 클래스 적용', () => {
    render(<Button disabled>버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
  });

  it('추가 className prop이 적용됨', () => {
    render(<Button className="custom-class">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('type prop이 전달됨', () => {
    render(<Button type="submit">제출</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
