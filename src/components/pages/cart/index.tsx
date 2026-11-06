import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useSelectCartItems,
  useValidateCart,
  cartKeys,
} from "../../hooks/cart";
import type { Cart, CartItem, BackendResponse } from "../../types/cart.type";

const formatPrice = (price: number = 0) =>
  `₫${Math.round(price).toLocaleString("vi-VN")}`;

// ── Checkbox Component ──
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function Checkbox({ checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`
        flex h-[18px] w-[18px] shrink-0 items-center justify-center
        rounded-[2px] border transition-colors
        ${
          checked
            ? "border-[#ee4d2d] bg-[#ee4d2d]"
            : "border-gray-300 bg-white hover:border-gray-400"
        }
        ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
      `}
    >
      {checked && (
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="m3 8 3.5 3.5L13 5" />
        </svg>
      )}
    </button>
  );
}

// ── Quantity Control Component (Phản hồi tức thì 0ms trên giao diện) ──
interface QuantityControlProps {
  quantity: number;
  maxStock?: number;
  disabled?: boolean;
  onChange: (quantity: number) => void;
}

function QuantityControl({
  quantity,
  maxStock = 999,
  disabled = false,
  onChange,
}: QuantityControlProps) {
  const [localQty, setLocalQty] = useState<number>(quantity);

  // Đồng bộ lại nếu quantity từ server/cache thay đổi
  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  const handleStep = (delta: number) => {
    if (disabled) return;
    const next = Math.max(1, Math.min(maxStock, localQty + delta));
    if (next !== localQty) {
      setLocalQty(next);
      onChange(next);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setLocalQty(1);
      onChange(1);
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(1, Math.min(maxStock, val));
      setLocalQty(clamped);
      onChange(clamped);
    }
  };

  return (
    <div className="flex h-8 items-center select-none">
      <button
        type="button"
        disabled={disabled || localQty <= 1}
        onClick={() => handleStep(-1)}
        className="flex h-8 w-8 items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
      >
        −
      </button>

      <input
        type="number"
        min={1}
        max={maxStock}
        disabled={disabled}
        value={localQty}
        onChange={handleInputChange}
        className="h-8 w-12 border-y border-gray-200 text-center text-sm outline-none focus:bg-orange-50/30"
      />

      <button
        type="button"
        disabled={disabled || localQty >= maxStock}
        onClick={() => handleStep(1)}
        className="flex h-8 w-8 items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
      >
        +
      </button>
    </div>
  );
}

// ── Main Cart Page Component ──
export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. TanStack Query: Lấy toàn bộ trạng thái giỏ hàng từ server
  const {
    items,
    selectedItems,
    totalPrice,
    subtotal,
    shippingFee,
    totalQuantity,
    isEmpty,
    isLoading,
    isError,
    error,
    refetch,
  } = useCart();

  // 2. TanStack Query: Các mutations thao tác giỏ hàng
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const selectItemsMutation = useSelectCartItems();
  const validateCartMutation = useValidateCart();

  // 3. Quản lý Debounce khi người dùng nhấn tăng/giảm liên tục (450ms)
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingQtyRef = useRef<Record<string, number>>({});

  // Dọn dẹp timers khi unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  // 4. Local UI States
  const [validationModal, setValidationModal] = useState<{
    show: boolean;
    issues: any[];
  }>({ show: false, issues: [] });

  // Kiểm tra trạng thái đã chọn tất cả sản phẩm hợp lệ
  const availableItems = items.filter((item) => {
    const p = item.productId as any;
    const v = item.variantId as any;
    const stock = v ? v.stock : p ? p.stock : 1;
    return stock > 0;
  });

  const isAllSelected =
    availableItems.length > 0 &&
    availableItems.every((item) => item.selected !== false);

  const selectedCount = selectedItems.length;

  // ── Handlers ──
  const handleToggleSelectAll = () => {
    selectItemsMutation.mutate({ selectAll: !isAllSelected });
  };

  const handleToggleItem = (item: CartItem) => {
    updateItemMutation.mutate({
      itemId: item._id,
      selected: !item.selected,
    });
  };

  /**
   * Xử lý tăng giảm số lượng có Debounce:
   * - Cập nhật tức thì (0ms) lên cache TanStack Query để UI, tổng tiền, thành tiền nhảy ngay lập tức.
   * - Chỉ gửi 1 request API lên server sau khi người dùng ngừng thao tác 450ms.
   */
  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    // 1. Huỷ timer đang đếm trước đó của item này (nếu đang bấm liên tục)
    if (debounceTimersRef.current[itemId]) {
      clearTimeout(debounceTimersRef.current[itemId]);
    }

    pendingQtyRef.current[itemId] = newQty;

    // 2. Cập nhật Optimistic tức thì lên cache TanStack Query để giao diện phản hồi 0ms
    queryClient.setQueryData<BackendResponse<Cart>>(cartKeys.detail(), (old) => {
      if (!old?.data) return old;
      const updatedItems = old.data.items.map((it) =>
        it._id === itemId ? { ...it, quantity: newQty } : it
      );

      // Tính nhanh subtotal & totalPrice hiển thị mượt mà không độ trễ
      const newSubtotal = updatedItems
        .filter((it) => it.selected !== false)
        .reduce((sum, it) => sum + it.price * it.quantity, 0);

      const newTotalQuantity = updatedItems.reduce(
        (sum, it) => sum + it.quantity,
        0
      );

      return {
        ...old,
        data: {
          ...old.data,
          items: updatedItems,
          subtotal: newSubtotal,
          totalPrice: Math.max(0, newSubtotal + (old.data.shippingFee || 0)),
          totalQuantity: newTotalQuantity,
        },
      };
    });

    // 3. Thiết lập Debounce 450ms: chỉ gọi API sau khi người dùng ngừng bấm
    debounceTimersRef.current[itemId] = setTimeout(() => {
      const finalQty = pendingQtyRef.current[itemId];
      delete debounceTimersRef.current[itemId];
      delete pendingQtyRef.current[itemId];

      if (finalQty !== undefined) {
        updateItemMutation.mutate({
          itemId,
          quantity: finalQty,
        });
      }
    }, 450);
  };

  const handleDeleteItem = (itemId: string) => {
    // Nếu item đang có timer debounce tăng giảm số lượng, huỷ ngay để không gọi đè
    if (debounceTimersRef.current[itemId]) {
      clearTimeout(debounceTimersRef.current[itemId]);
      delete debounceTimersRef.current[itemId];
      delete pendingQtyRef.current[itemId];
    }
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    if (selectedCount === 0) return;

    // Flush ngay các lệnh tăng giảm số lượng đang nằm trong hàng đợi debounce trước khi checkout
    Object.entries(debounceTimersRef.current).forEach(([itemId, timer]) => {
      clearTimeout(timer);
      const finalQty = pendingQtyRef.current[itemId];
      if (finalQty !== undefined) {
        updateItemMutation.mutate({ itemId, quantity: finalQty });
      }
    });
    debounceTimersRef.current = {};
    pendingQtyRef.current = {};

    // Validate giỏ hàng trước khi chuyển sang bước thanh toán
  validateCartMutation.mutate(true, {
    onSuccess: (res) => {
      const issues = res.data?.issues ?? [];

      if (issues.length > 0) {
        setValidationModal({
          show: true,
          issues,
        });
        return;
      }

      navigate("/checkout");
    },

    onError: (error) => {
      console.error("Validate cart failed:", error);

      // Không chuyển trang khi API validate thất bại
      // Có thể hiển thị toast thông báo lỗi
    },
  });
};

  // ── Render Helpers ──
  const getVariationText = (item: CartItem) => {
    const v = item.variantId as any;
    if (v && (v.color || v.size)) {
      const parts = [];
      if (v.color) parts.push(`Màu: ${v.color}`);
      if (v.size) parts.push(`Size: ${v.size}`);
      return parts.join(", ");
    }
    if (item.attributes && Object.keys(item.attributes).length > 0) {
      return Object.entries(item.attributes)
        .map(([k, val]) => `${k}: ${val}`)
        .join(", ");
    }
    return item.sku ? `SKU: ${item.sku}` : "Tiêu chuẩn";
  };

  // ── SKELETON LOADING ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] py-6 sm:py-8">
        <div className="mx-auto max-w-[1200px] px-3 sm:px-5 space-y-4 animate-pulse">
          <div className="h-20 bg-white rounded-sm" />
          <div className="h-12 bg-white rounded-sm" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-sm p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-sm" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f5f5f5] px-4">
        <div className="bg-white p-8 rounded-lg shadow-xs text-center max-w-md w-full">
          <i className="fas fa-exclamation-triangle text-4xl text-orange-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Không thể tải giỏ hàng</h2>
          <p className="text-sm text-gray-500 mb-4">
            {error instanceof Error ? error.message : "Đã có lỗi xảy ra khi kết nối máy chủ."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="w-full rounded-sm bg-[#ee4d2d] py-2.5 text-sm font-medium text-white hover:bg-[#d73211] transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f5f5] pb-[160px] text-gray-800">
      {/* Header Giỏ Hàng Shopee Style */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-xs">
        <div className="mx-auto flex min-h-[60px] sm:min-h-[72px] max-w-[1200px] items-center justify-between gap-4 px-3 sm:px-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#ee4d2d] sm:text-3xl">
                SHOP
              </span>
            </Link>
            <div className="h-6 w-px bg-[#ee4d2d]" />
            <h1 className="text-base sm:text-xl font-medium text-[#ee4d2d]">
              Giỏ Hàng
            </h1>
          </div>

          <Link
            to="/products"
            className="text-xs sm:text-sm text-gray-600 hover:text-[#ee4d2d] flex items-center gap-1"
          >
            <span>Tiếp tục tìm kiếm</span>
            <i className="fas fa-chevron-right text-[10px]" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1200px] px-3 sm:px-5 pt-4">
        {/* Banner Miễn phí vận chuyển */}
        <div className="mb-3 flex items-center gap-2 rounded-sm bg-[#fff8e8] border border-[#f5dfb8] px-4 py-2.5 text-xs sm:text-sm text-gray-700">
          <i className="fas fa-truck-fast text-[#ee4d2d] text-base" />
          <span>
            {subtotal >= 500000 ? (
              <strong className="text-emerald-600 font-semibold">
                Bạn đã được Miễn phí vận chuyển cho đơn hàng này!
              </strong>
            ) : (
              <span>
                Mua thêm <strong>{formatPrice(Math.max(0, 500000 - subtotal))}</strong> để được <strong>Miễn phí vận chuyển</strong> toàn quốc (đơn từ 500.000đ).
              </span>
            )}
          </span>
        </div>

        {/* Table Header (Desktop) */}
        {!isEmpty && (
          <div className="hidden lg:grid grid-cols-[24px_minmax(0,1fr)_130px_120px_130px_80px] items-center gap-4 rounded-sm bg-white px-5 py-3.5 text-xs text-gray-500 shadow-xs mb-3">
            <Checkbox
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
            />
            <span>Sản Phẩm ({items.length})</span>
            <span className="text-center">Đơn Giá</span>
            <span className="text-center">Số Lượng</span>
            <span className="text-center">Số Tiền</span>
            <span className="text-center">Thao Tác</span>
          </div>
        )}

        {/* Cart Items List */}
        {!isEmpty ? (
          <div className="space-y-3">
            {items.map((item) => {
              const p = item.productId as any;
              const v = item.variantId as any;
              const availableStock = v?.stock ?? p?.stock ?? 999;
              const isSoldOut = availableStock <= 0;
              const unitPrice = item.price;
              const originalPrice = item.originalPrice || unitPrice;
              const itemTotal = unitPrice * item.quantity;
              const variationText = getVariationText(item);

              return (
                <div
                  key={item._id}
                  className={`
                    rounded-sm bg-white shadow-xs border border-gray-100 transition-all
                    ${isSoldOut ? "bg-gray-50/70 opacity-70" : ""}
                  `}
                >
                  <div className="grid grid-cols-[20px_minmax(0,1fr)] lg:grid-cols-[24px_minmax(0,1fr)_130px_120px_130px_80px] items-start lg:items-center gap-3 lg:gap-4 p-3 sm:p-5">
                    {/* Checkbox */}
                    <div className="pt-2 lg:pt-0">
                      <Checkbox
                        checked={item.selected !== false && !isSoldOut}
                        disabled={isSoldOut}
                        onChange={() => handleToggleItem(item)}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex gap-3 min-w-0">
                      <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-sm border border-gray-200 bg-gray-50">
                        <img
                          src={item.image || p?.image || "/placeholder.png"}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[9px] font-bold">
                            HẾT HÀNG
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <Link
                          to={`/product-detail/${p?._id || p?.slug || ""}`}
                          className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#ee4d2d] transition-colors"
                        >
                          {item.name}
                        </Link>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {variationText}
                          </span>
                        </div>

                        {/* Mobile: Price & Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between lg:hidden pt-2 border-t border-gray-50">
                          <div>
                            <span className="text-xs font-bold text-[#ee4d2d]">
                              {formatPrice(unitPrice)}
                            </span>
                            {originalPrice > unitPrice && (
                              <span className="text-[10px] text-gray-400 line-through ml-1.5">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>

                          <QuantityControl
                            quantity={item.quantity}
                            maxStock={availableStock}
                            disabled={isSoldOut}
                            onChange={(q) => handleQuantityChange(item._id, q)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Price */}
                    <div className="hidden lg:flex flex-col items-center justify-center">
                      <span className="text-sm font-medium text-gray-800">
                        {formatPrice(unitPrice)}
                      </span>
                      {originalPrice > unitPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Desktop: Quantity */}
                    <div className="hidden lg:flex justify-center">
                      <QuantityControl
                        quantity={item.quantity}
                        maxStock={availableStock}
                        disabled={isSoldOut}
                        onChange={(q) => handleQuantityChange(item._id, q)}
                      />
                    </div>

                    {/* Desktop: Item Total */}
                    <div className="hidden lg:block text-center text-sm font-bold text-[#ee4d2d]">
                      {formatPrice(itemTotal)}
                    </div>

                    {/* Action: Delete */}
                    <div className="hidden lg:flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-xs sm:text-sm text-gray-500 hover:text-[#ee4d2d] transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Cart State */
          <div className="mt-6 flex min-h-[350px] flex-col items-center justify-center rounded-sm bg-white p-8 text-center shadow-xs">
            <div className="mb-4 text-6xl text-gray-300">
              <i className="fas fa-shopping-cart" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-700">
              Giỏ hàng của bạn còn trống
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              Hãy chọn những sản phẩm yêu thích và thêm vào giỏ hàng ngay!
            </p>
            <Link
              to="/"
              className="mt-6 rounded-sm bg-[#ee4d2d] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#d73211] shadow-md transition-all active:scale-95"
            >
              MUA NGAY
            </Link>
          </div>
        )}
      </main>

      {/* Checkout Bottom Floating Bar */}
      {!isEmpty && (
        <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-[1200px]">
            {/* Main Checkout Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5">
              {/* Left Actions */}
              <div className="flex items-center gap-3 sm:gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-xs sm:text-sm">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                  />
                  <span>Chọn tất cả ({items.length})</span>
                </label>

                <button
                  type="button"
                  onClick={() => clearCartMutation.mutate()}
                  className="hidden text-xs sm:text-sm text-gray-600 hover:text-[#ee4d2d] sm:block"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Right Summary & Checkout Button */}
              <div className="flex items-center gap-3 sm:gap-6 ml-auto">
                <div className="text-right">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Tổng thanh toán ({selectedCount} sản phẩm / {totalQuantity} món):
                  </div>
                  <div className="text-base sm:text-2xl font-bold text-[#ee4d2d]">
                    {formatPrice(totalPrice)}
                  </div>
                  {shippingFee > 0 && (
                    <div className="text-[10px] text-gray-400">
                      Phí vận chuyển: {formatPrice(shippingFee)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={selectedCount === 0 || validateCartMutation.isPending}
                  onClick={handleCheckout}
                  className="
                    h-11 sm:h-12 w-32 sm:w-48
                    rounded-sm bg-[#ee4d2d] text-sm sm:text-base font-semibold text-white
                    hover:bg-[#d73211] disabled:cursor-not-allowed disabled:bg-gray-300
                    shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
                  "
                >
                  {validateCartMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Mua Hàng</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Modal Thông báo Điều chỉnh Giỏ hàng khi Validate */}
      {validationModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-base pb-3 border-b border-gray-100">
              <i className="fas fa-exclamation-triangle" />
              <span>Giỏ hàng có thay đổi về tồn kho / giá</span>
            </div>

            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {validationModal.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900"
                >
                  <p className="font-semibold">{issue.productName}</p>
                  <p className="mt-0.5 text-gray-700">{issue.message}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Chúng tôi đã tự động cập nhật giỏ hàng theo đúng dữ liệu mới nhất từ kho hàng. Vui lòng kiểm tra lại trước khi tiếp tục.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setValidationModal({ show: false, issues: [] })}
                className="px-4 py-2 rounded-sm border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                onClick={() => {
                  setValidationModal({ show: false, issues: [] });
                  navigate("/checkout");
                }}
                className="px-5 py-2 rounded-sm bg-[#ee4d2d] text-xs font-semibold text-white hover:bg-[#d73211]"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
