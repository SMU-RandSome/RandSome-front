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
    staleTime: 0,
  });

  return { announcements: data ?? [], isLoading };
};
