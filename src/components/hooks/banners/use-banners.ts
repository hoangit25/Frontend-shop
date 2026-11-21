import { useQuery } from '@tanstack/react-query';
import { bannerService } from '../../api/banners/banner-service';
import { bannerKeys } from './banner.keys';
import type { Banner, BannerFilterParams } from '../../types/banner.type';
import type { BackendResponse } from '../../types/product.type';

export function useBanners(params?: BannerFilterParams) {
  const query = useQuery<BackendResponse<Banner[]>>({
    queryKey: bannerKeys.list(params),
    queryFn: () => bannerService.getBanners(params),
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  const banners = (query.data?.data || []).filter(
    (b) => b.isActive !== false
  );

  return {
    ...query,
    banners,
  };
}
