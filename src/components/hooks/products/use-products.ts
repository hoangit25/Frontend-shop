import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { productService } from '../../api/products/product-service';
import type { ProductOption, ProductVariant, StockAdjustmentPayload } from '../../api/products/product-service';
import { categoryService } from '../../api/categories/category-service';
import type { Category } from '../../api/categories/category-service';
import { productKeys, categoryKeys } from './product.keys';
import type {
  Product,
  BackendResponse,
  ProductListParams,
  CreateProduct,
  UpdateProduct,
} from '../../types/product.type';

// ── 1. QUERY: Lấy danh sách Product (hỗ trợ phân trang + keepPreviousData) ──
export function useProducts(params?: ProductListParams) {
  return useQuery<BackendResponse<Product[]>>({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    placeholderData: keepPreviousData,
  });
}

// ── 2. QUERY: Lấy Product Detail ──
export type ProductDetailData = Product & {
  options: ProductOption[];
  variants: ProductVariant[];
};

export function useProductDetail(idOrSlug: string) {
  return useQuery<BackendResponse<ProductDetailData>>({
    queryKey: productKeys.detail(idOrSlug),
    queryFn: () => productService.getProductDetail(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

// ── 3. QUERY: Lấy Category ──
export function useCategories() {
  return useQuery<BackendResponse<Category[]>>({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryService.getAllCategories(),
  });
}

// ── 4. QUERY: Lấy Brand ──
export function useBrands() {
  return useQuery<string[]>({
    queryKey: productKeys.brands(),
    queryFn: () => productService.getBrands(),
  });
}

// ── 5. QUERY: Lấy Product Options ──
export function useProductOptions(productId: string) {
  return useQuery<BackendResponse<ProductOption[]>>({
    queryKey: productKeys.options(productId),
    queryFn: () => productService.getProductOptions(productId),
    enabled: Boolean(productId),
  });
}

// ── 6. QUERY: Lấy Product Variants ──
export function useProductVariants(productId: string) {
  return useQuery<BackendResponse<ProductVariant[]>>({
    queryKey: productKeys.variants(productId),
    queryFn: () => productService.getProductVariants(productId),
    enabled: Boolean(productId),
  });
}

// ── 7. MUTATION: Tạo Product ──
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProduct) => productService.createProduct(data),
    onSuccess: () => {
      // Invalidate toàn bộ cache danh sách sản phẩm để fetch lại dữ liệu mới
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ── 8. MUTATION: Cập nhật Product ──
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProduct }) =>
      productService.updateProduct({ id, data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
}

// ── 9. MUTATION: Xóa Product ──
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ── 10. MUTATION: Cập nhật tồn kho (Inventory) ──
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockAdjustmentPayload) => productService.adjustStock(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
