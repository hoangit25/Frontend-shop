import request from "../../utils/request";
import type {
  Product,
  BackendResponse,
  ProductListParams,
  CreateProduct,
  UpdateProduct,
} from "../../types/product.type";

export interface ProductOptionValue {
  _id?: string;
  name: string;
  code?: string;
  image?: string;
  priceAdjustment?: number;
  isDefault?: boolean;
}

export interface ProductOption {
  _id: string;
  productId: string;
  name: string;
  type: 'TEXT' | 'COLOR' | 'IMAGE' | 'DROPDOWN';
  isRequired: boolean;
  description?: string;
  values: ProductOptionValue[];
  position: number;
}

export interface ProductVariant {
  _id: string;
  productId: string;
  sku: string;
  barcode?: string;
  size?: string;
  color?: string;
  colorCode?: string;
  optionValues?: Record<string, string>;
  price: number;
  originalPrice?: number;
  stock: number;
  sold: number;
  image?: string;
}

export interface StockAdjustmentPayload {
  productId: string;
  variantId?: string;
  type: 'IMPORT' | 'EXPORT' | 'SALE' | 'RETURN' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  referenceId?: string;
}

export const productService = {
  // 1. Lấy danh sách Product
  getProducts: (params?: ProductListParams) => {
    return request.get<BackendResponse<Product[]>>("/products", params);
  },

  // 2. Lấy Product Detail (kèm Options và Variants)
  getProductDetail: (idOrSlug: string) => {
    return request.get<BackendResponse<Product & { options: ProductOption[]; variants: ProductVariant[] }>>(
      `/products/detail/${idOrSlug}`
    );
  },

  // 3. Lấy Brand (danh sách thương hiệu riêng biệt hoặc từ query)
  getBrands: async () => {
    // Trích xuất thương hiệu độc nhất từ danh sách sản phẩm hoặc endpoint chuyên biệt
    const res = await request.get<BackendResponse<Product[]>>("/products", { limit: 100 });
    const brands = Array.from(
      new Set(
        res.data
          .map((p) => p.brand)
          .filter((b): b is string => Boolean(b && b.trim()))
      )
    );
    return brands;
  },

  // 4. Lấy Product Options
  getProductOptions: (productId: string) => {
    return request.get<BackendResponse<ProductOption[]>>(`/products/${productId}/options`);
  },

  // 5. Lấy Product Variants
  getProductVariants: (productId: string) => {
    return request.get<BackendResponse<ProductVariant[]>>(`/products/${productId}/variants`);
  },

  // 6. Tạo Product
  createProduct: (data: CreateProduct) => {
    return request.post<BackendResponse<Product>, CreateProduct>("/products", data);
  },

  // 7. Cập nhật Product
  updateProduct: ({ id, data }: { id: string; data: UpdateProduct }) => {
    return request.put<BackendResponse<Product>, UpdateProduct>(`/products/${id}`, data);
  },

  // 8. Xóa Product
  deleteProduct: (id: string) => {
    return request.delete<BackendResponse<{ message: string }>>(`/products/${id}`);
  },

  // 9. Cập nhật tồn kho (Inventory)
  adjustStock: (payload: StockAdjustmentPayload) => {
    return request.post<BackendResponse<unknown>, StockAdjustmentPayload>("/inventory/adjust", payload);
  },
};
