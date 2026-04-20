import { apiClient } from '@/lib/axios';
import type { ApiResponse, FeedItem } from '@/types';

export const getFeed = (params?: { lastId?: number }): Promise<ApiResponse<FeedItem[]>> =>
  apiClient.get<ApiResponse<FeedItem[]>>('/v1/feed', { params }).then((r) => r.data);
