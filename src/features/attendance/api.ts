import { apiClient } from '@/lib/axios';
import type { ApiResponse, AttendanceResponse } from '@/types';

export const getAttendance = (): Promise<ApiResponse<AttendanceResponse>> =>
  apiClient.get<ApiResponse<AttendanceResponse>>('/v1/attendances').then((r) => r.data);

export const checkAttendance = (): Promise<ApiResponse<AttendanceResponse>> =>
  apiClient.post<ApiResponse<AttendanceResponse>>('/v1/attendances').then((r) => r.data);
