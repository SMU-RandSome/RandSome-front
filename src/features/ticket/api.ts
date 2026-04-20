import { apiClient } from '@/lib/axios';
import type { ApiResponse, CursorPageResponse, TicketBalanceResponse, TicketHistoryItem } from '@/types';

export const getTicketBalance = (): Promise<ApiResponse<TicketBalanceResponse>> =>
  apiClient.get<ApiResponse<TicketBalanceResponse>>('/v1/tickets/balance').then((r) => r.data);

export const getTicketHistory = (cursor?: string, limit = 20): Promise<ApiResponse<CursorPageResponse<TicketHistoryItem>>> =>
  apiClient
    .get<ApiResponse<CursorPageResponse<TicketHistoryItem>>>('/v1/tickets/history', {
      params: { cursor, limit },
    })
    .then((r) => r.data);
