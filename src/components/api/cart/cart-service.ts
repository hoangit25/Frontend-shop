import request from '../../utils/request';
import type {
  Cart,
  BackendResponse,
  AddToCartPayload,
  UpdateCartItemPayload,
  SelectCartItemsPayload,
  MergeCartPayload,
  CartValidationResult,
} from '../../types/cart.type';

export const cartService = {
  // 1. Lấy chi tiết giỏ hàng hiện tại (kèm thông tin chi tiết Product & Variant)
  getCart: () => {
    return request.get<BackendResponse<Cart>>('/cart');
  },

  // 2. Thêm sản phẩm vào giỏ
  addItem: (payload: AddToCartPayload) => {
    return request.post<BackendResponse<Cart>, AddToCartPayload>('/cart/items', payload);
  },

  // 3. Cập nhật số lượng / trạng thái chọn của 1 item
  updateItem: ({ itemId, ...data }: UpdateCartItemPayload) => {
    return request.put<BackendResponse<Cart>, { quantity?: number; selected?: boolean }>(
      `/cart/items/${itemId}`,
      data
    );
  },

  // 4. Xoá 1 item khỏi giỏ
  removeItem: (itemId: string) => {
    return request.delete<BackendResponse<Cart>>(`/cart/items/${itemId}`);
  },

  // 5. Làm trống toàn bộ giỏ hàng
  clearCart: () => {
    return request.delete<BackendResponse<Cart>>('/cart');
  },

  // 6. Chọn hoặc bỏ chọn sản phẩm
  selectItems: (payload: SelectCartItemsPayload) => {
    return request.patch<BackendResponse<Cart>, SelectCartItemsPayload>('/cart/select', payload);
  },

  // 7. Gộp giỏ hàng khách vào user khi đăng nhập
  mergeCart: (payload: MergeCartPayload) => {
    return request.post<BackendResponse<Cart>, MergeCartPayload>('/cart/merge', payload);
  },

  // 8. Validate kiểm tra tồn kho & biến động giá trước khi thanh toán
  validateCart: (autoFix: boolean = true) => {
    return request.post<BackendResponse<CartValidationResult>, { autoFix: boolean }>(
      '/cart/validate',
      { autoFix }
    );
  },

  // 9. Áp dụng mã giảm giá
  applyCoupon: (code: string) => {
    return request.post<BackendResponse<Cart>, { code: string }>('/cart/coupon', { code });
  },

  // 10. Gỡ bỏ mã giảm giá
  removeCoupon: () => {
    return request.delete<BackendResponse<Cart>>('/cart/coupon');
  },
};

