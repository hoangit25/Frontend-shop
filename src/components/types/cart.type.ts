export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

export interface CartItemProduct {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  status?: string;
  isActive?: boolean;
  deleted?: boolean;
}

export interface CartItemVariant {
  _id: string;
  sku: string;
  size?: string;
  color?: string;
  colorCode?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  isActive?: boolean;
  deleted?: boolean;
}

export interface CartItem {
  _id: string;
  productId: CartItemProduct | string;
  variantId?: CartItemVariant | string | null;
  sku?: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  selected: boolean;
  attributes?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
}

export interface Cart {
  _id: string;
  userId?: string | null;
  guestId?: string | null;
  items: CartItem[];
  appliedCoupon?: CartCoupon | null;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  totalPrice: number;
  totalItems: number;
  totalQuantity: number;
  status: 'ACTIVE' | 'ORDERED' | 'ABANDONED';
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartPayload {
  productId: string;
  variantId?: string | null;
  quantity: number;
  selected?: boolean;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity?: number;
  selected?: boolean;
}

export interface SelectCartItemsPayload {
  itemIds?: string[];
  selected?: boolean;
  selectAll?: boolean;
}

export interface MergeCartPayload {
  guestId?: string;
  items?: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
    selected?: boolean;
  }>;
}

export interface CartIssue {
  itemId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  code: 'PRODUCT_UNAVAILABLE' | 'VARIANT_UNAVAILABLE' | 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PRICE_CHANGED';
  message: string;
  currentStock?: number;
  requestedQuantity?: number;
  oldPrice?: number;
  newPrice?: number;
}

export interface CartValidationResult {
  isValid: boolean;
  issues: CartIssue[];
  cart: Cart;
}

