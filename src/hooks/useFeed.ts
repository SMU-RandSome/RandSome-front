import { useState, useEffect } from 'react';

export interface FeedItem {
  id: number;
  type: 'register' | 'match';
  name: string;
  count?: number;
  time: string;
}

const INITIAL_FEED: FeedItem[] = [
  { id: 1, type: 'register', name: '김*수', time: '방금 전' },
  { id: 2, type: 'match', name: '이*영', count: 3, time: '1분 전' },
  { id: 3, type: 'register', name: '박*준', time: '3분 전' },
  { id: 4, type: 'match', name: '최*우', count: 1, time: '5분 전' },
  { id: 5, type: 'register', name: '정*민', time: '10분 전' },
];

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤'];
const GIVEN_NAMES = ['수', '민', '준', '영', '우', '현', '진'];

const randomName = (): string => {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const given = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  return `${surname}*${given}`;
};

export const useFeed = (): { feed: FeedItem[]; isLoading: boolean } => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFeed(INITIAL_FEED);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      const type = Math.random() > 0.5 ? 'register' : 'match';
      const count = Math.floor(Math.random() * 5) + 1;
      const newItem: FeedItem =
        type === 'register'
          ? { id: Date.now(), type: 'register', name: randomName(), time: '방금 전' }
          : { id: Date.now(), type: 'match', name: randomName(), count, time: '방금 전' };

      setFeed((prev) => [newItem, ...prev].slice(0, 20));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return { feed, isLoading };
};
