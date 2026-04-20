import { apiClient } from '@/lib/axios';

export const getQrCode = (): Promise<Blob> =>
  apiClient.get('/v1/qr', { responseType: 'blob' }).then((r) => r.data as Blob);
