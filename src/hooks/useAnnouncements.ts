import { useQuery } from '@tanstack/react-query';
import type { Announcement } from '@/types';
import { getAnnouncements } from '@/features/announcement/api';

const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const res = await getAnnouncements();
  return res.data ?? [];
};

export const useAnnouncements = (): { announcements: Announcement[]; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    // staleTime은 App.tsx QueryClient 전역 기본값(5분) 상속
  });

  return { announcements: data ?? [], isLoading };
};
