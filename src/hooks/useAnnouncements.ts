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
    staleTime: 1000 * 60 * 5, // 5분 — 공지사항은 자주 변경되지 않음
    gcTime: 1000 * 60 * 30, // 30분
  });

  return { announcements: data ?? [], isLoading };
};
