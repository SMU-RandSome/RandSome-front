import { useQuery } from '@tanstack/react-query';
import type { FeedItem } from '@/types';
import { getFeed } from '@/features/feed/api';

const POLL_INTERVAL = 10_000;

export const useFeed = (): { feed: FeedItem[]; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: async (): Promise<FeedItem[]> => {
      const res = await getFeed();
      return res.data ?? [];
    },
    refetchInterval: POLL_INTERVAL,
    // 탭이 숨겨지면 폴링 자동 중단, 포커스 복귀 시 재개
    refetchIntervalInBackground: false,
    // 포커스 복귀 시 인터벌 직전 중복 요청 방지
    staleTime: POLL_INTERVAL,
  });

  return { feed: data ?? [], isLoading };
};
