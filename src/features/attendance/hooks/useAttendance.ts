import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '../api';
import type { AttendanceResponse } from '@/types';

export const useAttendance = (): {
  attendance: AttendanceResponse | null;
  isLoading: boolean;
} => {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async (): Promise<AttendanceResponse | null> => {
      const res = await getAttendance();
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
  });

  return { attendance: data ?? null, isLoading };
};
