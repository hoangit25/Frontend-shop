export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'VNPAY';

export interface OrderItem {
  productId: string | { _id: string; name: string; image?: string };
  variantId?: string | { _id: string; sku?: string; color?: string; size?: string } | null;
  sku?: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  subtotal: number;
  attributes?: Record<string, any>;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  note?: string;
}

export interface OrderPricing {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  changedAt: string;
  changedBy?: string | null;
  note?: string;
}

export interface Order {
  _id: string;
  orderCode: string;
  userId?: string | null;
  guestId?: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  pricing: OrderPricing;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  transactionNo?: string;
  bankCode?: string;
  paidAt?: string;
  cancelReason?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  fromCart?: boolean;
  items?: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  note?: string;
}
