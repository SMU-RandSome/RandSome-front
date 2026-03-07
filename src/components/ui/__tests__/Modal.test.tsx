import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

vi.mock('motion/react');

describe('Modal', () => {
  it('isOpen=false 시 아무것도 렌더링 안 함', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="제목">내용</Modal>);
    expect(screen.queryByText('제목')).not.toBeInTheDocument();
    expect(screen.queryByText('내용')).not.toBeInTheDocument();
  });

  it('isOpen=true 시 title 렌더링', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="모달 제목">내용</Modal>);
    expect(screen.getByText('모달 제목')).toBeInTheDocument();
  });

  it('isOpen=true 시 children 렌더링', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="제목">모달 내용</Modal>);
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose 호출됨', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="제목">내용</Modal>);
    await userEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('백드롭 클릭 시 onClose 호출됨', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="제목">내용</Modal>,
    );
    // motion.div가 mock되어 div로 렌더링됨 — 첫 번째 div가 백드롭
    const backdrop = container.querySelector('div[class*="inset-0"]') ??
      container.querySelector('div:first-child');
    if (backdrop) await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('children에 React 노드도 렌더링 가능', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="제목">
        <p>단락 내용</p>
        <span>스팬 내용</span>
      </Modal>,
    );
    expect(screen.getByText('단락 내용')).toBeInTheDocument();
    expect(screen.getByText('스팬 내용')).toBeInTheDocument();
  });
});
