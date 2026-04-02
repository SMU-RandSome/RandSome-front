import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './Toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  accountNumber?: string;
  bankName?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  accountNumber = '1002-123-456789',
  bankName = '우리은행',
}) => {
  const { toast } = useToast();

  const handleCopy = (): void => {
    navigator.clipboard.writeText(`${bankName} ${accountNumber}`).then(() => {
      toast('계좌번호가 복사되었습니다.', 'success');
    }).catch(() => {
      toast('복사에 실패했습니다. 직접 입력해주세요.', 'error');
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl p-6 w-[calc(100%-2rem)] max-w-[430px] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">송금 안내</h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
                aria-label="닫기"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">입금하실 금액</p>
                <p className="text-2xl font-bold text-blue-700">{amount.toLocaleString()}원</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{bankName}</p>
                  <p className="text-lg font-bold text-slate-900 font-mono tracking-wide">
                    {accountNumber}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
                  aria-label="계좌번호 복사"
                >
                  <Copy size={20} />
                </button>
              </div>

              <ul className="space-y-2">
                {([
                  <>결제는 계좌 이체 후 <strong>관리자가 직접 확인</strong>합니다.</>,
                  <>정확한 금액을 <strong>한 번에 입금</strong>해주세요. (분할 송금 불가)</>,
                  <>신청자 이름과 입금자명이 <strong>동일</strong>해야 합니다.</>,
                  <>승인까지 <strong>최대 약 10분</strong> 소요됩니다.</>,
                ] as React.ReactNode[]).map((node, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="mt-0.5 text-blue-500 shrink-0" />
                    <p>{node}</p>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-red-500">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>
                    송금 후 <strong>환불은 불가능</strong>합니다.
                  </p>
                </li>
              </ul>
            </div>

            <Button fullWidth size="lg" onClick={onConfirm}>
              송금 완료했습니다
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
