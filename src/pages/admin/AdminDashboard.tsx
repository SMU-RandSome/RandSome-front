import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { Check, X, ChevronRight, Search, ChevronLeft } from 'lucide-react';

type AdminTab = 'candidates' | 'matches' | 'payments' | 'members';

const ITEMS_PER_PAGE = 10;

interface CandidateItem {
  id: number;
  nickname: string;
  time: string;
  amount: number;
  status: 'waiting' | 'approved' | 'rejected';
}

interface MatchItem {
  id: number;
  nickname: string;
  type: 'random' | 'ideal';
  count: number;
  amount: number;
  time: string;
  status: 'waiting' | 'approved' | 'rejected';
}

interface PaymentItem {
  id: number;
  realName: string;
  type: 'register' | 'match_random' | 'match_ideal';
  amount: number;
  time: string;
  status: 'waiting' | 'confirmed' | 'failed';
  relatedId: number; // 연관된 후보(register) 또는 매칭(match_*) ID
}

interface MemberItem {
  id: number;
  realName: string;
  nickname: string;
  email: string;
  gender: 'male' | 'female';
  mbti: string;
  intro: string;
  idealType?: string;
  instagramId?: string;
  joined: string;
  role: 'member' | 'candidate';
}


const DUMMY_CANDIDATES: CandidateItem[] = [
  { id: 1, nickname: '즐거운 사자', time: '10:30', amount: 3000, status: 'waiting' },
  { id: 2, nickname: '신나는 토끼', time: '10:35', amount: 3000, status: 'waiting' },
  { id: 3, nickname: '온순한 기린', time: '09:20', amount: 3000, status: 'approved' },
  { id: 4, nickname: '빠른 거북이', time: '09:15', amount: 3000, status: 'approved' },
  { id: 5, nickname: '용맹한 사슴', time: '09:10', amount: 3000, status: 'approved' },
  { id: 6, nickname: '지혜로운 올빼미', time: '09:05', amount: 3000, status: 'approved' },
  { id: 7, nickname: '귀여운 판다', time: '09:00', amount: 3000, status: 'approved' },
  { id: 8, nickname: '날쌘 다람쥐', time: '08:55', amount: 3000, status: 'approved' },
  { id: 9, nickname: '커다란 코끼리', time: '08:50', amount: 3000, status: 'approved' },
  { id: 10, nickname: '느긋한 나무늘보', time: '08:45', amount: 3000, status: 'approved' },
  { id: 11, nickname: '화려한 공작', time: '08:40', amount: 3000, status: 'approved' },
  { id: 12, nickname: '듬직한 곰', time: '08:35', amount: 3000, status: 'approved' },
  { id: 13, nickname: '깜찍한 펭귄', time: '08:30', amount: 3000, status: 'approved' },
  { id: 14, nickname: '도도한 고양이', time: '08:25', amount: 3000, status: 'approved' },
  { id: 15, nickname: '충직한 강아지', time: '08:20', amount: 3000, status: 'approved' },
];

const DUMMY_MATCHES: MatchItem[] = [
  { id: 1, nickname: '행복한 쿼카', type: 'random', count: 2, amount: 2000, time: '10:40', status: 'waiting' },
  { id: 2, nickname: '멋진 호랑이', type: 'ideal', count: 1, amount: 1500, time: '10:42', status: 'waiting' },
  { id: 3, nickname: '발랄한 펭귄', type: 'random', count: 1, amount: 1000, time: '08:50', status: 'rejected' },
  { id: 4, nickname: '상냥한 고래', type: 'random', count: 1, amount: 1000, time: '08:45', status: 'rejected' },
  { id: 5, nickname: '씩씩한 거북이', type: 'ideal', count: 2, amount: 3000, time: '08:40', status: 'approved' },
  { id: 6, nickname: '깔끔한 여우', type: 'random', count: 1, amount: 1000, time: '08:35', status: 'approved' },
  { id: 7, nickname: '수줍은 너구리', type: 'ideal', count: 3, amount: 4500, time: '08:30', status: 'approved' },
  { id: 8, nickname: '활기찬 돌고래', type: 'random', count: 5, amount: 5000, time: '08:25', status: 'approved' },
  { id: 9, nickname: '푸근한 불곰', type: 'ideal', count: 1, amount: 1500, time: '08:20', status: 'approved' },
  { id: 10, nickname: '영리한 까치', type: 'random', count: 2, amount: 2000, time: '08:15', status: 'approved' },
  { id: 11, nickname: '정겨운 비둘기', type: 'random', count: 1, amount: 1000, time: '08:10', status: 'approved' },
  { id: 12, nickname: '우직한 황소', type: 'ideal', count: 1, amount: 1500, time: '08:05', status: 'approved' },
  { id: 13, nickname: '민첩한 치타', type: 'random', count: 3, amount: 3000, time: '08:00', status: 'approved' },
  { id: 14, nickname: '강인한 늑대', type: 'ideal', count: 1, amount: 1500, time: '07:55', status: 'approved' },
  { id: 15, nickname: '영롱한 사슴', type: 'random', count: 1, amount: 1000, time: '07:50', status: 'approved' },
];

const DUMMY_PAYMENTS: PaymentItem[] = [
  { id: 1, realName: '김민수', type: 'register', amount: 3000, time: '10:29', status: 'waiting', relatedId: 1 },
  { id: 2, realName: '이지은', type: 'register', amount: 3000, time: '10:34', status: 'waiting', relatedId: 2 },
  { id: 3, realName: '박준혁', type: 'match_random', amount: 2000, time: '10:39', status: 'waiting', relatedId: 1 },
  { id: 4, realName: '최서연', type: 'match_ideal', amount: 3000, time: '09:15', status: 'confirmed', relatedId: 2 },
  { id: 5, realName: '정다은', type: 'register', amount: 3000, time: '09:00', status: 'failed', relatedId: 3 },
  { id: 6, realName: '임수호', type: 'register', amount: 3000, time: '08:55', status: 'confirmed', relatedId: 4 },
  { id: 7, realName: '윤아름', type: 'match_random', amount: 1000, time: '08:50', status: 'confirmed', relatedId: 6 },
  { id: 8, realName: '강태풍', type: 'match_ideal', amount: 1500, time: '08:45', status: 'confirmed', relatedId: 7 },
  { id: 9, realName: '한바다', type: 'register', amount: 3000, time: '08:40', status: 'confirmed', relatedId: 5 },
  { id: 10, realName: '오햇살', type: 'match_random', amount: 5000, time: '08:35', status: 'confirmed', relatedId: 8 },
  { id: 11, realName: '신비함', type: 'register', amount: 3000, time: '08:30', status: 'confirmed', relatedId: 6 },
  { id: 12, realName: '성실한', type: 'match_ideal', amount: 4500, time: '08:25', status: 'confirmed', relatedId: 9 },
  { id: 13, realName: '고독한', type: 'register', amount: 3000, time: '08:20', status: 'confirmed', relatedId: 7 },
  { id: 14, realName: '용감한', type: 'match_random', amount: 2000, time: '08:15', status: 'confirmed', relatedId: 10 },
  { id: 15, realName: '명랑한', type: 'register', amount: 3000, time: '08:10', status: 'confirmed', relatedId: 8 },
];

const DUMMY_MEMBERS: MemberItem[] = [
  {
    id: 1,
    realName: '박준혁',
    nickname: '행복한 쿼카',
    email: 'junhyeok@sangmyung.kr',
    gender: 'male',
    mbti: 'ENFP',
    intro: '안녕하세요! 새로운 인연을 찾고 있어요. 축제 같이 즐겨봐요!',
    idealType: '유머러스하고 대화가 잘 통하는 분',
    instagramId: 'happy_quokka',
    joined: '2026.05.20',
    role: 'member',
  },
  {
    id: 2,
    realName: '김민수',
    nickname: '즐거운 사자',
    email: 'minsu@sangmyung.kr',
    gender: 'male',
    mbti: 'ISTJ',
    intro: '조용하지만 친해지면 재밌어요. 잘 부탁드려요.',
    joined: '2026.05.20',
    role: 'candidate',
  },
  {
    id: 3,
    realName: '이지은',
    nickname: '신나는 토끼',
    email: 'jieun@sangmyung.kr',
    gender: 'female',
    mbti: 'ISFP',
    intro: '음악이랑 카페 좋아해요. 편하게 연락 주세요!',
    idealType: '차분하고 배려심 있는 분',
    instagramId: 'jieun_life',
    joined: '2026.05.20',
    role: 'candidate',
  },
  { id: 4, realName: '최서연', nickname: '우아한 백조', email: 'seoyeon@sangmyung.kr', gender: 'female', mbti: 'INFJ', intro: '반가워요!', joined: '2026.05.21', role: 'member' },
  { id: 5, realName: '정다은', nickname: '귀여운 판다', email: 'daeun@sangmyung.kr', gender: 'female', mbti: 'ESFJ', intro: '함께 놀아요!', joined: '2026.05.21', role: 'member' },
  { id: 6, realName: '임수호', nickname: '듬직한 곰', email: 'suho@sangmyung.kr', gender: 'male', mbti: 'ENTJ', intro: '멋진 인연 기다립니다.', joined: '2026.05.22', role: 'member' },
  { id: 7, realName: '윤아름', nickname: '도도한 고양이', email: 'areum@sangmyung.kr', gender: 'female', mbti: 'INTJ', intro: '커피 한잔 어때요?', joined: '2026.05.22', role: 'member' },
  { id: 8, realName: '강태풍', nickname: '용맹한 사자', email: 'taepung@sangmyung.kr', gender: 'male', mbti: 'ESTP', intro: '운동 좋아하시는 분!', joined: '2026.05.23', role: 'member' },
  { id: 9, realName: '한바다', nickname: '푸른 돌고래', email: 'bada@sangmyung.kr', gender: 'male', mbti: 'INFP', intro: '바다 보러 가고 싶네요.', joined: '2026.05.23', role: 'member' },
  { id: 10, realName: '오햇살', nickname: '밝은 해바라기', email: 'sunshine@sangmyung.kr', gender: 'female', mbti: 'ENFJ', intro: '항상 밝게!', joined: '2026.05.24', role: 'member' },
  { id: 11, realName: '신비함', nickname: '보랏빛 나비', email: 'mystic@sangmyung.kr', gender: 'female', mbti: 'ISFJ', intro: '수줍음이 많아요.', joined: '2026.05.24', role: 'member' },
  { id: 12, realName: '성실한', nickname: '부지런한 개미', email: 'hardwork@sangmyung.kr', gender: 'male', mbti: 'ISTP', intro: '성실함이 무기입니다.', joined: '2026.05.25', role: 'member' },
  { id: 13, realName: '고독한', nickname: '사막의 늑대', email: 'lonely@sangmyung.kr', gender: 'male', mbti: 'INTP', intro: '혼자 있는 것도 좋지만...', joined: '2026.05.25', role: 'member' },
  { id: 14, realName: '용감한', nickname: '날쌘 호랑이', email: 'brave@sangmyung.kr', gender: 'male', mbti: 'ENTP', intro: '도전적인 삶!', joined: '2026.05.26', role: 'member' },
  { id: 15, realName: '명랑한', nickname: '노란 병아리', email: 'cheerful@sangmyung.kr', gender: 'female', mbti: 'ESFP', intro: '신나게 놀아봐요!', joined: '2026.05.26', role: 'member' },
];

const TYPE_LABEL: Record<string, string> = {
  register: '후보 등록',
  match_random: '무작위 매칭',
  match_ideal: '이상형 매칭',
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-slate-600 px-2">
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();

  const [activeTab, setActiveTab] = useState<AdminTab>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [candidates, setCandidates] = useState<CandidateItem[]>(DUMMY_CANDIDATES);
  const [matches, setMatches] = useState<MatchItem[]>(DUMMY_MATCHES);
  const [payments, setPayments] = useState<PaymentItem[]>(DUMMY_PAYMENTS);
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [failModal, setFailModal] = useState<{ id: number; realName: string } | null>(null);
  const [failReason, setFailReason] = useState('');

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab: AdminTab): void => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const confirmPayment = (id: number): void => {
    const payment = payments.find((p) => p.id === id);
    if (!payment) return;
    setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: 'confirmed' as const } : p));
    if (payment.type === 'register') {
      setCandidates((prev) => prev.map((c) => c.id === payment.relatedId ? { ...c, status: 'approved' } : c));
    } else {
      setMatches((prev) => prev.map((m) => m.id === payment.relatedId ? { ...m, status: 'approved' } : m));
    }
    toast('입금 확인 및 신청이 자동 승인되었습니다.', 'success');
  };

  const openFailModal = (id: number, realName: string): void => {
    setFailReason('');
    setFailModal({ id, realName });
  };

  const closeFailModal = (): void => {
    setFailModal(null);
    setFailReason('');
  };

  const submitFail = (): void => {
    if (!failModal || !failReason.trim()) return;
    const payment = payments.find((p) => p.id === failModal.id);
    if (!payment) return;
    setPayments((prev) => prev.map((p) => p.id === failModal.id ? { ...p, status: 'failed' as const } : p));
    if (payment.type === 'register') {
      setCandidates((prev) => prev.map((c) => c.id === payment.relatedId ? { ...c, status: 'rejected' } : c));
    } else {
      setMatches((prev) => prev.map((m) => m.id === payment.relatedId ? { ...m, status: 'rejected' } : m));
    }
    toast('미입금 처리 및 신청이 자동 거절되었습니다.', 'info');
    closeFailModal();
  };

  const togglePaymentStatus = (id: number, currentStatus: 'confirmed' | 'failed'): void => {
    const newStatus = currentStatus === 'confirmed' ? 'failed' : 'confirmed';
    const payment = payments.find((p) => p.id === id);
    if (!payment) return;
    setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    const relatedStatus = newStatus === 'confirmed' ? 'approved' : 'rejected';
    if (payment.type === 'register') {
      setCandidates((prev) => prev.map((c) => c.id === payment.relatedId ? { ...c, status: relatedStatus } : c));
    } else {
      setMatches((prev) => prev.map((m) => m.id === payment.relatedId ? { ...m, status: relatedStatus } : m));
    }
    toast(`입금 상태를 ${newStatus === 'confirmed' ? '확인' : '실패'}로 변경했습니다.`, 'info');
  };

  const renderCandidates = (): React.ReactNode => {
    const filteredCandidates = candidates.filter((c) =>
      c.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const waitingItems = filteredCandidates.filter((c) => c.status === 'waiting');
    const processedItems = filteredCandidates.filter((c) => c.status !== 'waiting');

    const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
    const paginated = filteredCandidates.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-400 pb-2">
          결제 탭에서 입금 확인 시 자동으로 승인/거절됩니다.
        </p>
        {waitingItems.length === 0 && processedItems.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">
            {searchTerm ? '검색 결과가 없습니다.' : '신청 내역이 없습니다.'}
          </p>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {paginated.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.nickname}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.time} · {item.amount.toLocaleString()}원
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    item.status === 'approved'
                      ? 'bg-green-50 text-green-600'
                      : item.status === 'rejected'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-500'
                  }`}>
                    {item.status === 'approved' ? '승인됨' : item.status === 'rejected' ? '거절됨' : '대기중'}
                  </span>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    );
  };

  const renderMatches = (): React.ReactNode => {
    const filteredMatches = matches.filter((m) =>
      m.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
    const paginated = filteredMatches.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-400 pb-2">
          결제 탭에서 입금 확인 시 자동으로 승인/거절됩니다.
        </p>
        {filteredMatches.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">
            {searchTerm ? '검색 결과가 없습니다.' : '신청 내역이 없습니다.'}
          </p>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {paginated.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.nickname}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.time} · {item.type === 'random' ? '무작위' : '이상형'} {item.count}명 · {item.amount.toLocaleString()}원
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    item.status === 'approved'
                      ? 'bg-green-50 text-green-600'
                      : item.status === 'rejected'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-500'
                  }`}>
                    {item.status === 'approved' ? '승인됨' : item.status === 'rejected' ? '거절됨' : '대기중'}
                  </span>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    );
  };

  const renderPayments = (): React.ReactNode => {
    const filteredPayments = payments.filter((p) =>
      p.realName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const waitingPayments = filteredPayments.filter((p) => p.status === 'waiting');
    const processedPayments = filteredPayments.filter((p) => p.status !== 'waiting');

    const totalPages = Math.ceil(processedPayments.length / ITEMS_PER_PAGE);
    const paginatedProcessed = processedPayments.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">
            확인 대기 ({waitingPayments.length})
          </p>
          {waitingPayments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              {searchTerm ? '검색 결과가 없습니다.' : '대기 중인 입금이 없습니다.'}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {waitingPayments.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{item.realName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.time} · {TYPE_LABEL[item.type]} · {item.amount.toLocaleString()}원
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openFailModal(item.id, item.realName)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50"
                    >
                      <X size={13} /> 미입금
                    </button>
                    <button
                      onClick={() => confirmPayment(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700"
                    >
                      <Check size={13} /> 확인
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {processedPayments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">
              처리 완료 ({processedPayments.length})
            </p>
            <div className="divide-y divide-slate-100">
              {paginatedProcessed.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{item.realName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.time} · {TYPE_LABEL[item.type]} · {item.amount.toLocaleString()}원
                    </p>
                  </div>
                  <button
                    onClick={() => togglePaymentStatus(item.id, item.status as 'confirmed' | 'failed')}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                      item.status === 'confirmed' 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    {item.status === 'confirmed' ? '확인됨' : '실패함'}
                  </button>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    );
  };

  const renderMembers = (): React.ReactNode => {
    const filteredMembers = DUMMY_MEMBERS.filter(
      (m) =>
        m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const paginatedMembers = filteredMembers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="flex flex-col h-full">
        <div className="divide-y divide-slate-100">
          {paginatedMembers.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-16">
              {searchTerm ? '검색 결과가 없습니다.' : '회원이 없습니다.'}
            </p>
          ) : (
            paginatedMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="w-full py-3 flex items-center gap-3 text-left hover:bg-slate-50 -mx-5 px-5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{member.nickname}</p>
                    {member.role === 'candidate' ? (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                        후보자
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
                        일반
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {member.realName} · {member.gender === 'male' ? '남' : '여'} · {member.mbti}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            ))
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  const TABS: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'candidates', label: '후보 승인', count: candidates.filter((c) => c.status === 'waiting').length },
    { id: 'matches', label: '매칭 승인', count: matches.filter((m) => m.status === 'waiting').length },
    { id: 'payments', label: '결제', count: payments.filter((p) => p.status === 'waiting').length },
    { id: 'members', label: '회원' },
  ];

  return (
    <MobileLayout className="bg-white">
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-lg" />
            <span className="font-bold text-slate-900 text-sm">관리자</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-slate-700 font-medium"
          >
            로그아웃
          </button>
        </header>
      )}

      <div
        className={`sticky z-40 bg-white border-b border-slate-100 flex ${isPWA ? 'top-14' : 'top-0'}`}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 검색 바 */}
      <div
        className={`px-5 py-3 bg-white border-b border-slate-50 sticky z-30 ${isPWA ? 'top-[102px]' : 'top-[44px]'}`}
      >
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full h-10 pl-10 pr-10 bg-slate-50 border-none rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            placeholder={
              activeTab === 'members'
                ? '닉네임, 실명, 이메일 검색'
                : activeTab === 'payments'
                  ? '실명으로 검색'
                  : '닉네임으로 검색'
            }
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {activeTab === 'candidates' && renderCandidates()}
        {activeTab === 'matches' && renderMatches()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'members' && renderMembers()}
      </div>

      {/* 미입금 거절 사유 모달 */}
      {failModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={closeFailModal} />
          <div className="relative w-full max-w-[390px] bg-white rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 text-base mb-1">미입금 처리</h3>
            <p className="text-xs text-slate-400 mb-4">
              <span className="font-semibold text-slate-600">{failModal.realName}</span> 님의 거절 사유를 입력해주세요.
            </p>
            <textarea
              className="w-full h-28 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-slate-400"
              placeholder="예) 입금자명이 신청자 이름과 일치하지 않습니다."
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeFailModal}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={submitFail}
                disabled={!failReason.trim()}
                className="flex-[2] h-12 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                미입금 처리
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원 상세 모달 */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedMember(null)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-base">{selectedMember.nickname}</h3>
                  {selectedMember.role === 'candidate' ? (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                      후보자
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
                      일반
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{selectedMember.joined} 가입</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <Row label="실명" value={selectedMember.realName} />
              <Row label="이메일" value={selectedMember.email} />
              <Row label="성별" value={selectedMember.gender === 'male' ? '남성' : '여성'} />
              <Row label="MBTI" value={selectedMember.mbti} />
              {selectedMember.instagramId && (
                <Row label="인스타그램" value={`@${selectedMember.instagramId}`} />
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 mb-1.5">자기소개</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedMember.intro}</p>
              </div>
              {selectedMember.idealType && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5">이상형</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedMember.idealType}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100">
    <span className="text-xs text-slate-400 font-medium">{label}</span>
    <span className="text-sm text-slate-800 font-medium">{value}</span>
  </div>
);

export default AdminDashboard;
