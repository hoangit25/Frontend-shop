import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../api/cart/cart-service';
import { cartKeys } from './cart.keys';
import type {
  Cart,
  BackendResponse,
  AddToCartPayload,
  UpdateCartItemPayload,
  SelectCartItemsPayload,
  MergeCartPayload,
  CartValidationResult,
} from '../../types/cart.type';

// ── 1. QUERY: Lấy thông tin giỏ hàng ──
export function useCart() {
  const query = useQuery<BackendResponse<Cart>>({
    queryKey: cartKeys.detail(),
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 2, // 2 phút cache
  });

  const cart = query.data?.data;
  const items = cart?.items || [];
  const selectedItems = items.filter((item) => item.selected !== false);
  const totalQuantity = cart?.totalQuantity ?? items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart?.totalPrice ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const discountTotal = cart?.discountTotal ?? 0;
  const shippingFee = cart?.shippingFee ?? 0;
  const appliedCoupon = cart?.appliedCoupon ?? null;

  return {
    ...query,
    cart,
    items,
    selectedItems,
    totalQuantity,
    totalPrice,
    subtotal,
    discountTotal,
    shippingFee,
    appliedCoupon,
    isEmpty: items.length === 0,
  };
}

// ── 2. MUTATION: Thêm sản phẩm vào giỏ hàng ──
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<Cart>, Error, AddToCartPayload>({
    mutationFn: (payload: AddToCartPayload) => cartService.addItem(payload),
    onSuccess: (response) => {
      // Cập nhật ngay cache cart với dữ liệu trả về từ server
      queryClient.setQueryData(cartKeys.detail(), response);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 3. MUTATION: Cập nhật số lượng / trạng thái chọn của sản phẩm (hỗ trợ Optimistic UI) ──
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<
    BackendResponse<Cart>,
    Error,
    UpdateCartItemPayload,
    { previousCart?: BackendResponse<Cart> }
  >({
    mutationFn: (payload: UpdateCartItemPayload) => cartService.updateItem(payload),
    onMutate: async (payload) => {
      // Huỷ các queries đang chạy để tránh ghi đè optimistic update
      await queryClient.cancelQueries({ queryKey: cartKeys.detail() });

      const previousCart = queryClient.getQueryData<BackendResponse<Cart>>(cartKeys.detail());

      // Optimistic update cục bộ giao diện ngay lập tức
      if (previousCart?.data) {
        const updatedItems = previousCart.data.items.map((item) => {
          if (item._id === payload.itemId) {
            return {
              ...item,
              ...(payload.quantity !== undefined && { quantity: payload.quantity }),
              ...(payload.selected !== undefined && { selected: payload.selected }),
            };
          }
          return item;
        });

        queryClient.setQueryData<BackendResponse<Cart>>(cartKeys.detail(), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          },
        });
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      // Rollback về dữ liệu cũ nếu server báo lỗi
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(), context.previousCart);
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.detail(), response);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 4. MUTATION: Xoá 1 sản phẩm khỏi giỏ hàng ──
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<
    BackendResponse<Cart>,
    Error,
    string,
    { previousCart?: BackendResponse<Cart> }
  >({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.detail() });
      const previousCart = queryClient.getQueryData<BackendResponse<Cart>>(cartKeys.detail());

      if (previousCart?.data) {
        queryClient.setQueryData<BackendResponse<Cart>>(cartKeys.detail(), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: previousCart.data.items.filter((item) => item._id !== itemId),
          },
        });
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(), context.previousCart);
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.detail(), response);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 5. MUTATION: Xoá sạch giỏ hàng ──
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<Cart>, Error, void>({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.detail(), response);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 6. MUTATION: Chọn / Bỏ chọn sản phẩm thanh toán ──
export function useSelectCartItems() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<Cart>, Error, SelectCartItemsPayload>({
    mutationFn: (payload: SelectCartItemsPayload) => cartService.selectItems(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.detail(), response);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 7. MUTATION: Gộp giỏ hàng khách vào tài khoản khi đăng nhập ──
export function useMergeCart() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<Cart>, Error, MergeCartPayload>({
    mutationFn: (payload: MergeCartPayload) => cartService.mergeCart(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.detail(), response);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 8. MUTATION: Xác thực giỏ hàng trước khi Checkout ──
export function useValidateCart() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<CartValidationResult>, Error, boolean | void>({
    mutationFn: (autoFix: boolean | void = true) => cartService.validateCart(autoFix !== false),
    onSuccess: (response) => {
      if (response.data?.cart) {
        queryClient.setQueryData(cartKeys.detail(), {
          success: true,
          message: 'Cart updated after validation',
          data: response.data.cart,
        });
      }
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 9. MUTATION: Áp dụng mã giảm giá ──
export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<Cart>, Error, string>({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.detail(), response);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// ── 10. MUTATION: Gỡ mã giảm giá ──
export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<Cart>, Error, void>({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.detail(), response);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

