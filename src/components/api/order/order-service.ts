import request from '../../utils/request';
import type { BackendResponse } from '../../types/cart.type';
import type { Order, CreateOrderPayload } from '../../types/order.type';

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
  search?: string;
}

export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderService = {
  // 1. Tạo đơn hàng mới từ giỏ hàng hoặc danh sách items
  createOrder: (payload: CreateOrderPayload) => {
    return request.post<BackendResponse<Order>, CreateOrderPayload>(
      '/orders',
      payload
    );
  },

  // 2. Lấy danh sách đơn hàng của người dùng hiện tại
  getOrders: (params?: GetOrdersParams) => {
    return request.get<BackendResponse<PaginatedOrders>>('/orders', params);
  },

  // 3. Lấy chi tiết đơn hàng theo ID hoặc OrderCode
  getOrderById: (orderIdOrCode: string) => {
    return request.get<BackendResponse<Order>>(`/orders/${orderIdOrCode}`);
  },

  // 4. Huỷ đơn hàng
  cancelOrder: (orderId: string, reason?: string) => {
    return request.patch<BackendResponse<Order>, { reason?: string }>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
  },
};
