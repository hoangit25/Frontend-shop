import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Package,
  Minus,
  Plus,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart, useUpdateCartItem } from "../../hooks/cart";
import { useAuthStore } from "../../store/auth-store";
import type { CartItem } from "../../types/cart.type";

interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  note?: string;
}

type PaymentMethod = "COD" | "CARD";

const formatPrice = (price: number = 0) =>
  `₫${Math.round(price).toLocaleString("vi-VN")}`;

const getVariationText = (item: CartItem) => {
  const v = typeof item.variantId === "object" ? (item.variantId as any) : null;
  if (v && (v.color || v.size)) {
    const parts: string[] = [];
    if (v.color) parts.push(`Màu: ${v.color}`);
    if (v.size) parts.push(`Size: ${v.size}`);
    return parts.join(", ");
  }
  if (item.attributes && Object.keys(item.attributes).length > 0) {
    return Object.entries(item.attributes)
      .map(([k, val]) => `${k}: ${val}`)
      .join(", ");
  }
  return item.sku ? `SKU: ${item.sku}` : "";
};

const getItemImage = (item: CartItem) => {
  const p = typeof item.productId === "object" ? item.productId : null;
  const v = typeof item.variantId === "object" ? item.variantId : null;
  return (
    item.image ||
    v?.image ||
    p?.image ||
    (p?.images && p.images.length > 0 ? p.images[0] : "") ||
    ""
  );
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // 1. TanStack Query: Lấy toàn bộ giỏ hàng
  const { items, selectedItems, isLoading, cart } = useCart();
  const updateCartItemMutation = useUpdateCartItem();

  // 2. Danh sách sản phẩm được chọn để thanh toán (nếu không chọn riêng thì mặc định toàn bộ giỏ hàng)
  const checkoutItems = useMemo(() => {
    if (selectedItems && selectedItems.length > 0) {
      return selectedItems;
    }
    return items || [];
  }, [selectedItems, items]);

  // 3. Khởi tạo form thông tin giao hàng
  const [form, setForm] = useState<ShippingForm>(() => {
    const saved = localStorage.getItem("checkout_shipping_address");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      note: "",
    };
  });

  // Tự động điền fullName/email nếu user thay đổi
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Tính toán số tiền cần thanh toán
  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0
    );
  }, [checkoutItems]);

  const discount = useMemo(() => {
    if (cart?.discountTotal && cart.discountTotal > 0) {
      return cart.discountTotal;
    }
    if (cart?.appliedCoupon) {
      const coupon = cart.appliedCoupon;
      if (coupon.discountType === "PERCENTAGE") {
        const disc = (subtotal * coupon.discountValue) / 100;
        return coupon.maxDiscountAmount
          ? Math.min(disc, coupon.maxDiscountAmount)
          : disc;
      }
      return coupon.discountValue;
    }
    return 0;
  }, [cart, subtotal]);

  // Miễn phí vận chuyển nếu đơn hàng từ 500.000đ trở lên
  const isFreeShipping = subtotal >= 500000;
  const shippingFee = useMemo(() => {
    if (checkoutItems.length === 0 || subtotal === 0) return 0;
    if (isFreeShipping) return 0;
    if (cart?.shippingFee !== undefined && cart.shippingFee > 0) {
      return cart.shippingFee;
    }
    return 30000; // Tiêu chuẩn 30.000đ
  }, [checkoutItems, subtotal, isFreeShipping, cart]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discount + shippingFee);
  }, [subtotal, discount, shippingFee]);

  const totalQuantity = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [checkoutItems]);

  // Cập nhật số lượng sản phẩm trực tiếp từ Order Summary
  const handleUpdateQuantity = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    const p = typeof item.productId === "object" ? item.productId : null;
    const v = typeof item.variantId === "object" ? item.variantId : null;
    const maxStock = v?.stock ?? p?.stock ?? 999;
    if (delta > 0 && newQty > maxStock) return;

    updateCartItemMutation.mutate({
      itemId: item._id,
      quantity: newQty,
    });
  };

  // Thay đổi input form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit thanh toán
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (checkoutItems.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (saveAddress) {
        localStorage.setItem(
          "checkout_shipping_address",
          JSON.stringify(form)
        );
      }

      const orderPayload = {
        shippingInfo: form,
        items: checkoutItems.map((item) => ({
          itemId: item._id,
          productId:
            typeof item.productId === "object"
              ? item.productId._id
              : item.productId,
          variantId:
            typeof item.variantId === "object"
              ? item.variantId?._id
              : item.variantId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
        saveAddress,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
      };

      console.log("Order payload:", orderPayload);

      // ID đơn hàng demo - sẵn sàng gắn API backend khi order routes hoạt động
      const orderId = `DH_${Date.now()}`;

      if (paymentMethod === "CARD") {
        navigate(`/payment/${orderId}`);
      } else {
        navigate(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/60 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10";

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <header className="mx-auto mb-8 flex w-full max-w-7xl items-center justify-between">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#ee4d2d]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Quay lại Giỏ hàng</span>
          <span className="sm:hidden">Giỏ hàng</span>
        </Link>

        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#ee4d2d] to-[#ff7337] text-white shadow-sm shadow-orange-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            SHOP<span className="text-[#ee4d2d]">.VN</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 sm:text-sm">
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Thanh toán an toàn 100%</span>
          <span className="sm:hidden">Bảo mật</span>
        </div>
      </header>

      {/* Page Title */}
      <div className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Tiến hành đặt hàng
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Vui lòng kiểm tra địa chỉ giao hàng và danh sách sản phẩm trước khi xác nhận.
        </p>
      </div>

      {/* Main Content */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8"
      >
        {/* ================= THÔNG TIN GIAO HÀNG ================= */}
        <section className="flex min-w-0 flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Truck className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  Thông tin nhận hàng
                </h2>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Nhập đầy đủ thông tin để đơn hàng được giao chính xác nhất.
              </p>
            </div>
            <span className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#ee4d2d] sm:block">
              Bước 1/2
            </span>
          </div>

          <div className="mb-6 h-px w-full bg-gray-100" />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Họ và tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={form.fullName}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Email nhận thông báo <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                placeholder="Số nhà, tên ngõ, đường, phường/xã..."
                value={form.address}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Tỉnh / Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Ví dụ: Hà Nội, TP.HCM..."
                  value={form.city}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Mã bưu điện (Tùy chọn)
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  placeholder="Ví dụ: 700000"
                  value={form.postalCode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="note"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Ghi chú cho shipper (Tùy chọn)
              </label>
              <input
                id="note"
                name="note"
                type="text"
                placeholder="Giao giờ hành chính, gọi trước khi giao..."
                value={form.note || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* ================= PHƯƠNG THỨC THANH TOÁN ================= */}
          <div className="mt-8 border-t border-gray-100 pt-7">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <CreditCard className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Phương thức thanh toán
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Chọn hình thức thanh toán thuận tiện nhất với bạn.
              </p>
            </div>

            <div className="space-y-3">
              {/* COD */}
              <label
                className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all duration-200 ${
                  paymentMethod === "COD"
                    ? "border-[#ee4d2d] bg-orange-50/40 ring-1 ring-[#ee4d2d]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="h-4 w-4 shrink-0 accent-[#ee4d2d]"
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Thanh toán khi nhận hàng (COD)
                  </p>
                  <p className="text-xs text-gray-500">
                    Kiểm tra hàng và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng.
                  </p>
                </div>
                {paymentMethod === "COD" && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#ee4d2d]" />
                )}
              </label>

              {/* CARD */}
              <label
                className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all duration-200 ${
                  paymentMethod === "CARD"
                    ? "border-[#ee4d2d] bg-orange-50/40 ring-1 ring-[#ee4d2d]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="h-4 w-4 shrink-0 accent-[#ee4d2d]"
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Thẻ ngân hàng / Thẻ quốc tế (Visa, Master, Napas)
                  </p>
                  <p className="text-xs text-gray-500">
                    Thanh toán trực tuyến qua cổng bảo mật 256-bit SSL.
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                      VISA
                    </span>
                    <span className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                      Mastercard
                    </span>
                    <span className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Napas
                    </span>
                  </div>
                </div>
                {paymentMethod === "CARD" && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#ee4d2d]" />
                )}
              </label>
            </div>
          </div>

          {/* Lưu địa chỉ */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#ee4d2d]"
              />
              <span className="text-xs text-gray-600 select-none">
                Lưu địa chỉ này cho các lần mua sắm tiếp theo
              </span>
            </label>
          </div>
        </section>

        {/* ================= ORDER SUMMARY ================= */}
        <section className="flex min-w-0 flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-6">
          {/* Header tóm tắt đơn hàng */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#ee4d2d]">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Tóm tắt đơn hàng
                </h2>
                <p className="text-xs text-gray-500">
                  Kiểm tra lại sản phẩm và số tiền cần thanh toán
                </p>
              </div>
            </div>

            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#ee4d2d]">
              {totalQuantity} món ({checkoutItems.length} SP)
            </span>
          </div>

          {/* Banner Miễn phí vận chuyển */}
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900">
            <Truck className="h-4 w-4 shrink-0 text-[#ee4d2d]" />
            <div>
              {isFreeShipping ? (
                <span className="font-semibold text-emerald-700">
                  🎉 Đơn hàng đã đạt điều kiện Miễn phí vận chuyển!
                </span>
              ) : (
                <span>
                  Mua thêm{" "}
                  <strong className="text-[#ee4d2d]">
                    {formatPrice(500000 - subtotal)}
                  </strong>{" "}
                  để được <strong>Freeship</strong> toàn quốc (đơn từ 500.000đ).
                </span>
              )}
            </div>
          </div>

          <div className="mb-4 h-px w-full bg-gray-100" />

          {/* DANH SÁCH SẢN PHẨM: HIỂN THỊ ĐẦY ĐỦ ITEM, NHIỀU THÌ DÙNG SCROLL */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Sản phẩm trong giỏ ({checkoutItems.length})
              </h3>
              {checkoutItems.length > 3 && (
                <span className="text-[11px] text-gray-400">
                  ↓ Cuộn để xem thêm
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#ee4d2d]" />
                <span className="ml-2 text-sm">Đang tải sản phẩm...</span>
              </div>
            ) : checkoutItems.length > 0 ? (
              <div className="max-h-[360px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 space-y-4 divide-y divide-gray-100/90 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                {checkoutItems.map((item) => {
                  const imageSrc = getItemImage(item);
                  const variation = getVariationText(item);
                  const p =
                    typeof item.productId === "object" ? item.productId : null;
                  const v =
                    typeof item.variantId === "object" ? item.variantId : null;
                  const maxStock = v?.stock ?? p?.stock ?? 999;

                  return (
                    <div
                      key={item._id}
                      className="flex min-w-0 gap-3 pt-4 first:pt-0"
                    >
                      {/* Ảnh sản phẩm */}
                      <div className="relative flex h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="h-full w-full object-contain transition-transform duration-200 hover:scale-105"
                            onError={(e) => {
                              // Khi ảnh lỗi thì ẩn thẻ img và fallback
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-300" />
                        )}
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white shadow-sm">
                          {item.quantity}
                        </span>
                      </div>

                      {/* Chi tiết sản phẩm */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4
                              className="line-clamp-2 text-xs font-semibold leading-4 text-gray-900 sm:text-sm"
                              title={item.name}
                            >
                              {item.name}
                            </h4>
                            {variation && (
                              <p className="mt-1 inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                                <Tag className="h-3 w-3 text-gray-400" />
                                {variation}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-gray-900 sm:text-sm">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>

                        {/* Điều chỉnh số lượng & Thành tiền */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex h-7 items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, -1)}
                              disabled={
                                item.quantity <= 1 ||
                                updateCartItemMutation.isPending
                              }
                              aria-label="Giảm số lượng"
                              className="flex h-full w-7 items-center justify-center text-gray-500 transition hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <span className="min-w-7 text-center text-xs font-semibold text-gray-800">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, 1)}
                              disabled={
                                item.quantity >= maxStock ||
                                updateCartItemMutation.isPending
                              }
                              aria-label="Tăng số lượng"
                              className="flex h-full w-7 items-center justify-center text-gray-500 transition hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-xs">
                            <span className="text-gray-400">Thành tiền: </span>
                            <span className="font-bold text-[#ee4d2d]">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  Giỏ hàng của bạn đang trống
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
                </p>
                <Link
                  to="/"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}
          </div>

          {/* ================= TÍNH TIỀN CẦN THANH TOÁN ================= */}
          <div className="space-y-3 border-t border-gray-100 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Chi tiết thanh toán
            </h3>

            {/* Tạm tính */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Tạm tính ({totalQuantity} món)
              </span>
              <span className="font-medium text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Giảm giá nếu có */}
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span>Giảm giá / Voucher</span>
                  {cart?.appliedCoupon && (
                    <span className="rounded bg-orange-100 px-1.5 py-0.2 text-[10px] font-bold text-[#ee4d2d]">
                      {cart.appliedCoupon.code}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-emerald-600">
                  -{formatPrice(discount)}
                </span>
              </div>
            )}

            {/* Phí vận chuyển */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Phí vận chuyển</span>
              {shippingFee === 0 ? (
                <span className="font-semibold text-emerald-600">
                  Miễn phí
                </span>
              ) : (
                <span className="font-medium text-gray-900">
                  {formatPrice(shippingFee)}
                </span>
              )}
            </div>
          </div>

          {/* Tổng tiền cần thanh toán */}
          <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-gray-200 pt-5">
            <div>
              <p className="text-sm font-bold text-gray-900 sm:text-base">
                Tổng thanh toán
              </p>
              <p className="text-[11px] text-gray-400">
                (Đã bao gồm VAT và các loại phí)
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black tracking-tight text-[#ee4d2d] sm:text-3xl">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Nút Đặt hàng */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={checkoutItems.length === 0 || isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:from-[#d73211] hover:to-[#ee4d2d] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý đơn hàng...</span>
                </>
              ) : paymentMethod === "CARD" ? (
                <span>Tiến hành thanh toán thẻ</span>
              ) : (
                <span>Xác nhận Đặt hàng (COD)</span>
              )}
            </button>

            <div className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Giao dịch an toàn & cam kết bảo mật thông tin</span>
            </div>
          </div>
        </section>
      </form>

      {/* Footer */}
      <footer className="mx-auto mt-12 max-w-7xl border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} SHOP.VN. Mọi quyền được bảo lưu.
        </p>
      </footer>
    </div>
  );
}
