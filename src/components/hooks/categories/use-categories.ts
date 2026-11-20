import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../api/categories/category-service';
import type { Category } from '../../api/categories/category-service';
import { categoryKeys } from './category.keys';
import type { BackendResponse } from '../../types/product.type';

// ── 1. QUERY: Lấy danh sách toàn bộ Category ──
export function useCategories() {
  const query = useQuery<BackendResponse<Category[]>>({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  const categories = (query.data?.data || []).filter(
    (cat) => cat.isActive !== false
  );

  return {
    ...query,
    categories,
  };
}

// ── 2. QUERY: Lấy chi tiết Category theo ID ──
export function useCategoryDetail(id: string) {
  return useQuery<BackendResponse<Category>>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
