export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  image: string;
  images?: string[];
  categoryId: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  sold?: number;
  rating?: number;
  ratingCount?: number;
  isFeatured?: boolean;
  status?: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;

  // Compatibility fields for legacy components if needed
  id?: string;
  title?: string;
  thumbnail?: string;
  discountPercentage?: number;
}

export interface PaginationMeta {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
}

export interface CreateProduct {
  name: string;
  description?: string;
  image: string;
  images?: string[];
  categoryId: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
}

export interface UpdateProduct extends Partial<CreateProduct> {
  isActive?: boolean;
}
