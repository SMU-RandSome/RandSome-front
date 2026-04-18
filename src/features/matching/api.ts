import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  MatchingApplicationRequest,
  MatchingApplicationResponse,
  MatchingHistoryItem,
  MatchingResultDetailItem,
} from '@/types';

export const applyMatching = (body: MatchingApplicationRequest): Promise<ApiResponse<MatchingApplicationResponse>> =>
  apiClient.post<ApiResponse<MatchingApplicationResponse>>('/v1/matchings', body).then((r) => r.data);

export const getMatchingHistory = (): Promise<ApiResponse<MatchingHistoryItem[]>> =>
  apiClient
    .get<ApiResponse<MatchingHistoryItem[]>>('/v1/matchings')
    .then((r) => r.data);

export const withdrawMatching = (applicationId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/matchings/applications/${applicationId}/cancel`)
    .then((r) => r.data);

export const getMatchingResult = (applicationId: number): Promise<ApiResponse<MatchingResultDetailItem[]>> =>
  apiClient
    .get<ApiResponse<MatchingResultDetailItem[]>>(`/v1/matchings/applications/${applicationId}`)
    .then((r) => r.data);
