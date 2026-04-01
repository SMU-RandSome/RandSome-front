import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('label 텍스트를 렌더링함', () => {
    render(<Input label="이메일" />);
    expect(screen.getByText('이메일')).toBeInTheDocument();
  });

  it('label과 input이 htmlFor로 연결됨 (getByLabelText)', () => {
    render(<Input label="이메일" />);
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
  });

  it('label 없을 때 label 엘리먼트 렌더링 안 함', () => {
    render(<Input />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('error prop이 있으면 에러 메시지 표시', () => {
    render(<Input error="필수 항목입니다." />);
    expect(screen.getByText('필수 항목입니다.')).toBeInTheDocument();
  });

  it('error prop이 있으면 border-red-400 클래스 적용', () => {
    render(<Input error="오류" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-400');
  });

  it('error prop이 있으면 helperText 표시 안 함', () => {
    render(<Input error="오류" helperText="도움말" />);
    expect(screen.queryByText('도움말')).not.toBeInTheDocument();
  });

  it('helperText는 error 없을 때만 표시됨', () => {
    render(<Input helperText="입력 도움말" />);
    expect(screen.getByText('입력 도움말')).toBeInTheDocument();
  });

  it('사용자 타이핑 시 onChange 핸들러 호출됨', async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), '안녕');
    expect(onChange).toHaveBeenCalled();
  });

  it('커스텀 id prop이 input에 적용됨', () => {
    render(<Input id="custom-input" label="레이블" />);
    expect(screen.getByLabelText('레이블')).toHaveAttribute('id', 'custom-input');
  });

  it('id prop 미전달 시 label과 input이 자동으로 연결됨 (React.useId)', () => {
    render(<Input label="학교 이메일" />);
    const input = screen.getByLabelText('학교 이메일');
    expect(input).toHaveAttribute('id'); // React.useId() 생성 — 구체적 형식은 검사하지 않음
  });

  it('type=password prop이 전달됨', () => {
    render(<Input type="password" label="비밀번호" />);
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
  });

  it('placeholder prop이 전달됨', () => {
    render(<Input placeholder="입력해주세요" />);
    expect(screen.getByPlaceholderText('입력해주세요')).toBeInTheDocument();
  });
});
