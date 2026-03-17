import { useState, useEffect, useRef } from 'react';
import type { FeedItem } from '@/types';
import { getFeed } from '@/features/feed/api';

const POLL_INTERVAL = 10_000;

export const useFeed = (): { feed: FeedItem[]; isLoading: boolean } => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchFeed = (): void => {
      getFeed({ size: 20 })
        .then((res) => {
          if (res.data) setFeed(res.data);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    };

    fetchFeed();
    timerRef.current = setInterval(fetchFeed, POLL_INTERVAL);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  return { feed, isLoading };
};
