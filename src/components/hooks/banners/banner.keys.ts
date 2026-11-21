import type { BannerFilterParams } from '../../types/banner.type';

export const bannerKeys = {
  all: ['banners'] as const,
  lists: () => [...bannerKeys.all, 'list'] as const,
  list: (params?: BannerFilterParams) => [...bannerKeys.lists(), params] as const,
  detail: (id: string) => [...bannerKeys.all, 'detail', id] as const,
};
