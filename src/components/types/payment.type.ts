export type PaymentProviderType = 'COD' | 'VNPAY';
export type PaymentStatusType =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface PaymentRecord {
  _id: string;
  orderId: string;
  orderCode: string;
  userId?: string | null;
  provider: PaymentProviderType;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  paymentUrl?: string;
  transactionId?: string; // vnp_TransactionNo
  bankTranNo?: string;    // vnp_BankTranNo
  bankCode?: string;      // vnp_BankCode
  cardType?: string;      // vnp_CardType
  vnpPayDate?: string;    // vnp_PayDate
  orderInfo?: string;     // vnp_OrderInfo
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  provider: PaymentProviderType;
  returnUrl?: string;
}

export interface CreatePaymentResponse {
  payment: PaymentRecord;
  paymentUrl: string;
  provider: PaymentProviderType;
  orderCode: string;
  amount: number;
}
