import { apiClient } from '@/lib/axios';
import {
  getAdminCouponEvents,
  createAdminCouponEvent,
  updateAdminCouponEvent,
  deleteAdminCouponEvent,
  activateAdminCouponEvent,
  deactivateAdminCouponEvent,
} from '@/features/admin/api';
import type { CouponEventPreviewItem, PageResponse } from '@/types';

vi.mock('@/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);
const mockPatch = vi.mocked(apiClient.patch);

const makeEvent = (id = 1): CouponEventPreviewItem => ({
  id,
  name: '테스트 이벤트',
  eventType: 'HAPPY_HOUR',
  status: 'DRAFT',
  totalQuantity: 10,
});

const pageOf = (items: CouponEventPreviewItem[]): PageResponse<CouponEventPreviewItem> => ({
  content: items,
  currentPage: 0,
  totalPages: 1,
  totalElements: items.length,
  hasNext: false,
  hasPrevious: false,
});

describe('Admin Coupon Event API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAdminCouponEvents — GET /v1/admin/coupon-events 호출', async () => {
    const data = pageOf([makeEvent()]);
    mockGet.mockResolvedValue({ data: { result: 'SUCCESS', data, error: null } });

    const res = await getAdminCouponEvents({ page: 0, size: 5 });

    expect(mockGet).toHaveBeenCalledWith('/v1/admin/coupon-events', { params: { page: 0, size: 5 } });
    expect(res.data).toEqual(data);
  });

  it('createAdminCouponEvent — POST /v1/admin/coupon-events 호출', async () => {
    const body = {
      name: '새 이벤트',
      description: '설명',
      type: 'HAPPY_HOUR' as const,
      rewardTicketType: 'RANDOM' as const,
      rewardAmount: 1,
      startsAt: '2026-05-01T00:00:00Z',
      expiresAt: '2026-05-02T00:00:00Z',
      couponExpiresAt: '2026-05-10T00:00:00Z',
    };
    mockPost.mockResolvedValue({ data: { result: 'SUCCESS', data: 1, error: null } });

    const res = await createAdminCouponEvent(body);

    expect(mockPost).toHaveBeenCalledWith('/v1/admin/coupon-events', body);
    expect(res.data).toBe(1);
  });

  it('updateAdminCouponEvent — PATCH /v1/admin/coupon-events/:id 호출', async () => {
    const body = {
      name: '수정',
      description: '수정 설명',
      type: 'SECRET_CODE' as const,
      rewardTicketType: 'IDEAL' as const,
      rewardAmount: 3,
      startsAt: '2026-05-01T00:00:00Z',
      expiresAt: '2026-05-02T00:00:00Z',
      couponExpiresAt: '2026-05-10T00:00:00Z',
    };
    mockPatch.mockResolvedValue({ data: { result: 'SUCCESS', data: null, error: null } });

    await updateAdminCouponEvent(5, body);

    expect(mockPatch).toHaveBeenCalledWith('/v1/admin/coupon-events/5', body);
  });

  it('deleteAdminCouponEvent — DELETE /v1/admin/coupon-events/:id 호출', async () => {
    mockDelete.mockResolvedValue({ data: { result: 'SUCCESS', data: null, error: null } });

    await deleteAdminCouponEvent(3);

    expect(mockDelete).toHaveBeenCalledWith('/v1/admin/coupon-events/3');
  });

  it('activateAdminCouponEvent — POST /v1/admin/coupon-events/:id/activate 호출', async () => {
    mockPost.mockResolvedValue({ data: { result: 'SUCCESS', data: null, error: null } });

    await activateAdminCouponEvent(7);

    expect(mockPost).toHaveBeenCalledWith('/v1/admin/coupon-events/7/activate');
  });

  it('deactivateAdminCouponEvent — POST /v1/admin/coupon-events/:id/deactivate 호출', async () => {
    mockPost.mockResolvedValue({ data: { result: 'SUCCESS', data: null, error: null } });

    await deactivateAdminCouponEvent(7);

    expect(mockPost).toHaveBeenCalledWith('/v1/admin/coupon-events/7/deactivate');
  });
});
