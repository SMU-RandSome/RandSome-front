import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRequests } from '@/store/requestStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { MatchRequest } from '@/types';
import { Heart, User, ChevronRight, Dice5, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'pending' | 'approved' | 'rejected';

const TYPE_LABEL: Record<string, string> = {
  register: '매칭 후보 등록',
  match_random: '무작위 매칭',
  match_ideal: '이상형 매칭',
};

const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { requests } = useRequests();
  const { isPWA } = useDisplayMode();
  const [currentTab, setCurrentTab] = useState<TabType>('pending');

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  const handleMatchClick = (request: MatchRequest): void => {
    navigate('/requests/detail', { state: { request } });
  };

  const TABS: { id: TabType; label: string; count: number }[] = [
    { id: 'pending', label: '대기중', count: pendingRequests.length },
    { id: 'approved', label: '완료', count: approvedRequests.length },
    { id: 'rejected', label: '거절', count: rejectedRequests.length },
  ];

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-bold text-slate-900">내 신청 내역</h1>
        </header>
      )}

      <div className={`sticky z-40 bg-white border-b border-slate-200 flex ${isPWA ? 'top-14' : 'top-0'}`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              currentTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className={`flex-1 overflow-y-auto p-4 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        <AnimatePresence mode="wait">
          {currentTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {pendingRequests.length === 0 ? (
                <EmptyState
                  icon={<span>⏳</span>}
                  title="대기중인 신청이 없어요"
                  description="새로운 매칭을 신청해보세요!"
                />
              ) : (
                pendingRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          req.type === 'register'
                            ? 'bg-blue-50 text-blue-500'
                            : req.type === 'match_random'
                              ? 'bg-indigo-50 text-indigo-500'
                              : 'bg-pink-50 text-pink-500'
                        }`}
                      >
                        {req.type === 'register' ? (
                          <User size={20} />
                        ) : req.type === 'match_random' ? (
                          <Dice5 size={20} />
                        ) : (
                          <Heart size={20} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-900 text-sm truncate pr-2">
                            {TYPE_LABEL[req.type]}
                          </h3>
                          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md">
                            <Calendar size={10} /> {req.createdAt.split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            승인 대기중
                          </span>
                          {req.count && (
                            <span className="text-xs text-slate-400">{req.count}명 신청</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {currentTab === 'approved' && (
            <motion.div
              key="approved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {approvedRequests.length === 0 ? (
                <EmptyState
                  icon={<span>💌</span>}
                  title="완료된 신청이 없어요"
                  description="설레는 인연이 곧 찾아올 거예요!"
                />
              ) : (
                approvedRequests.map((req) => {
                  const isRegister = req.type === 'register';
                  return (
                    <motion.div
                      key={req.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={isRegister ? undefined : () => handleMatchClick(req)}
                      className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden ${
                        !isRegister ? 'group cursor-pointer' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                            isRegister
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                              : req.type === 'match_random'
                                ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white'
                                : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                          }`}
                        >
                          {isRegister ? (
                            <CheckCircle2 size={20} />
                          ) : req.type === 'match_random' ? (
                            <Dice5 size={20} />
                          ) : (
                            <Heart size={20} fill="currentColor" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-slate-900 text-sm">
                              {isRegister ? '후보 등록 승인' : `${TYPE_LABEL[req.type]} 성공`}
                            </h3>
                            <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                              {req.createdAt.split(' ')[0]}
                            </span>
                          </div>

                          {isRegister ? (
                            <p className="text-xs text-blue-600 font-medium">
                              이제 매칭 후보 리스트에 등록되었어요!
                            </p>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2 overflow-hidden py-1">
                                {req.matches?.slice(0, 3).map((match, idx) => (
                                  <div
                                    key={idx}
                                    className={`inline-block h-6 w-6 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[8px] font-bold shadow-sm ${
                                      match.partnerProfile.gender === 'male'
                                        ? 'bg-blue-500'
                                        : 'bg-pink-500'
                                    }`}
                                  >
                                    {match.partnerProfile.nickname[0]}
                                  </div>
                                ))}
                                {(req.matches?.length ?? 0) > 3 && (
                                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-slate-500 text-[8px] font-bold">
                                    +{(req.matches?.length ?? 0) - 3}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                {req.matches?.length}명 확인 <ChevronRight size={14} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {currentTab === 'rejected' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {rejectedRequests.length === 0 ? (
                <EmptyState
                  icon={<span>✅</span>}
                  title="거절된 신청이 없어요"
                  description="모든 신청이 순조롭게 진행되고 있어요!"
                />
              ) : (
                rejectedRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 relative overflow-hidden opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-red-50 text-red-400">
                        <XCircle size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-700 text-sm truncate pr-2">
                            {TYPE_LABEL[req.type]}
                          </h3>
                          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md">
                            <Calendar size={10} /> {req.createdAt.split(' ')[0]}
                          </span>
                        </div>
                        {req.rejectionReason && (
                          <p className="text-xs text-red-500 font-medium mb-1">
                            거절 사유: {req.rejectionReason}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          결제 금액은 환불 처리됩니다.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default RequestsPage;
