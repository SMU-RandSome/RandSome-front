import { apiClient } from '@/lib/axios';
import type { ApiResponse, CursorSlice, TicketBalanceResponse, TicketHistoryItem, TicketType } from '@/types';

export const getTicketBalance = (): Promise<ApiResponse<TicketBalanceResponse>> =>
  apiClient.get<ApiResponse<TicketBalanceResponse>>('/v1/tickets/balance').then((r) => r.data);

export const getTicketHistory = (params?: {
  ticketType?: TicketType;
  sortType?: 'LATEST' | 'OLDEST';
  cursor?: number;
  size?: number;
}): Promise<ApiResponse<CursorSlice<TicketHistoryItem>>> =>
  apiClient
    .get<ApiResponse<CursorSlice<TicketHistoryItem>>>('/v1/tickets/history', { params })
    .then((r) => r.data);
