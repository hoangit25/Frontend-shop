import request from '../../utils/request';
import type { BackendResponse } from '../../types/cart.type';
import type {
  PaymentRecord,
  CreatePaymentPayload,
  CreatePaymentResponse,
} from '../../types/payment.type';

export const paymentService = {
  // 1. Khởi tạo thanh toán (Lấy URL thanh toán VNPay)
  createPayment: (payload: CreatePaymentPayload) => {
    return request.post<BackendResponse<CreatePaymentResponse>, CreatePaymentPayload>(
      '/payments/create',
      payload
    );
  },

  // 2. Tra cứu thông tin thanh toán theo orderId hoặc orderCode
  getPaymentByOrderId: (orderId: string) => {
    return request.get<BackendResponse<PaymentRecord>>(
      `/payments/order/${orderId}`
    );
  },
};
