import { apiClient } from '@/lib/axios';
import type { ApiResponse, Announcement } from '@/types';

export const getAnnouncements = (): Promise<ApiResponse<Announcement[]>> =>
  apiClient
    .get<ApiResponse<Announcement[]>>('/v1/announcements')
    .then((r) => r.data);
