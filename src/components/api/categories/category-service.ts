import request from "../../utils/request";
import type { BackendResponse } from "../../types/product.type";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  position: number;
  isActive: boolean;
}

export const categoryService = {
  getAllCategories: () => {
    return request.get<BackendResponse<Category[]>>("/categories");
  },
  getCategoryById: (id: string) => {
    return request.get<BackendResponse<Category>>(`/categories/${id}`);
  },
};

