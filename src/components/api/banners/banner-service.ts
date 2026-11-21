import request from "../../utils/request";
import type { BackendResponse } from "../../types/product.type";
import type { Banner, BannerFilterParams } from "../../types/banner.type";

export const bannerService = {
  getBanners: (params?: BannerFilterParams) => {
    return request.get<BackendResponse<Banner[]>>("/banners", params);
  },
  getBannerById: (id: string) => {
    return request.get<BackendResponse<Banner>>(`/banners/${id}`);
  },
};
