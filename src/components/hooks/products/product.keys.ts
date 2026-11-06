import type { ProductListParams } from '../../types/product.type';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...productKeys.details(), idOrSlug] as const,
  options: (productId: string) => [...productKeys.detail(productId), 'options'] as const,
  variants: (productId: string) => [...productKeys.detail(productId), 'variants'] as const,
  brands: () => [...productKeys.all, 'brands'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};
