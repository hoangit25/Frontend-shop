import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Loader2,
  ShieldCheck,
  MapPin,
  Calendar,
} from "lucide-react";
import { orderService } from "../../api/order/order-service";
import { paymentService } from "../../api/payment/payment-service";
import type { Order } from "../../types/order.type";
import type { PaymentRecord } from "../../types/payment.type";

const formatPrice = (price: number = 0) =>
  `₫${Math.round(price).toLocaleString("vi-VN")}`;

const getStatusBadge = (orderStatus: string, paymentStatus: string) => {
  if (paymentStatus === "PAID") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã thanh toán ({orderStatus})
      </span>
    );
  }
  if (orderStatus === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
        <AlertCircle className="h-3.5 w-3.5" />
        Đã huỷ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
      <Clock className="h-3.5 w-3.5" />
      Chờ thanh toán / Chờ xử lý
    </span>
  );
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const fetchOrderData = async (showLoadingSpinner = true) => {
    if (!id) return;
    try {
      if (showLoadingSpinner) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const orderRes = await orderService.getOrderById(id);
      if (orderRes?.data) {
        setOrder(orderRes.data);

        // Lấy thông tin bản ghi thanh toán
        try {
          const payRes = await paymentService.getPaymentByOrderId(
            orderRes.data._id || id
          );
          if (payRes?.data) {
            setPayment(payRes.data);
          }
        } catch {
          // Bỏ qua nếu chưa có payment
        }
      } else {
        setError("Không tìm thấy thông tin đơn hàng.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải thông tin đơn hàng.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  // Xử lý khi khách hàng chưa thanh toán và bấm "Thanh toán ngay bằng VNPay"
  const handlePayNow = async () => {
    if (!order) return;
    try {
      setIsPaying(true);
      const res = await paymentService.createPayment({
        orderId: order._id,
        provider: "VNPAY",
        returnUrl: `${window.location.origin}/checkout/payment-return`,
      });

      if (res?.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể tạo liên kết thanh toán.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ee4d2d]" />
        <p className="mt-3 text-sm text-gray-500">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto my-16 max-w-md px-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-3 text-lg font-bold text-gray-900">
          Không tìm thấy đơn hàng
        </h2>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "PAID" || payment?.status === "SUCCESS";
  const transactionNo = payment?.transactionId || order.transactionNo || "";
  const bankCode = payment?.bankCode || order.bankCode || "";

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Top Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to={-1 as any}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition hover:text-[#ee4d2d]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>

          <button
            type="button"
            onClick={() => fetchOrderData(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 active:scale-98"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Đồng bộ trạng thái thanh toán</span>
          </button>
        </div>

        {/* Order Header Card */}
        <div className="mb-6 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-black text-gray-900 sm:text-2xl">
                  Đơn hàng #{order.orderCode}
                </h1>
                {getStatusBadge(order.orderStatus, order.paymentStatus)}
              </div>
              <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                Ngày đặt:{" "}
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>

            {/* Nếu đơn VNPAY chưa thanh toán -> Hiện nút thanh toán ngay */}
            {!isPaid &&
              order.orderStatus !== "CANCELLED" &&
              order.paymentMethod === "VNPAY" && (
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] px-5 py-3 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition hover:from-[#d73211] hover:to-[#ee4d2d]"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang kết nối VNPay...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Thanh toán ngay qua VNPay
                    </>
                  )}
                </button>
              )}
          </div>
        </div>

        {/* Main Grid: Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Products List */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800">
                <Package className="h-4 w-4 text-[#ee4d2d]" />
                Danh sách sản phẩm ({order.items.length})
              </h2>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, index) => {
                  const imageSrc =
                    item.image ||
                    (typeof item.productId === "object"
                      ? (item.productId as any).image
                      : "") ||
                    "";

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-xs font-semibold text-gray-900 sm:text-sm">
                          {item.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>Số lượng: {item.quantity}</span>
                          <span>•</span>
                          <span>Đơn giá: {formatPrice(item.price)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900 sm:text-sm">
                          {formatPrice(item.subtotal || item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính:</span>
                  <span className="font-medium text-gray-800">
                    {formatPrice(order.pricing.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-gray-800">
                    {order.pricing.shippingFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">
                        Miễn phí
                      </span>
                    ) : (
                      formatPrice(order.pricing.shippingFee)
                    )}
                  </span>
                </div>

                {order.pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Giảm giá:</span>
                    <span className="font-semibold text-emerald-600">
                      -{formatPrice(order.pricing.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-3 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    Tổng thanh toán:
                  </span>
                  <span className="text-lg font-black text-[#ee4d2d] sm:text-xl">
                    {formatPrice(order.pricing.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Shipping Info */}
          <div className="space-y-6">
            {/* Payment Details & VNPay Reconcile Card */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800">
                <CreditCard className="h-4 w-4 text-[#ee4d2d]" />
                Thông tin thanh toán
              </h2>

              <dl className="space-y-3 text-xs sm:text-sm">
                <div>
                  <dt className="text-gray-400 text-[11px] uppercase">
                    Phương thức thanh toán
                  </dt>
                  <dd className="mt-0.5 font-semibold text-gray-800">
                    {order.paymentMethod === "VNPAY"
                      ? "Cổng thanh toán trực tuyến VNPay"
                      : "Thanh toán khi nhận hàng (COD)"}
                  </dd>
                </div>

                <div>
                  <dt className="text-gray-400 text-[11px] uppercase">
                    Trạng thái thanh toán
                  </dt>
                  <dd className="mt-0.5">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Đã thanh toán thành công
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <Clock className="h-4 w-4" />
                        Chưa thanh toán
                      </span>
                    )}
                  </dd>
                </div>

                {/* Dữ liệu đối soát VNPay Sandbox */}
                {transactionNo && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
                      Đối soát VNPay Sandbox
                    </dt>
                    <dd className="mt-1.5 space-y-1 text-xs text-blue-800">
                      <div>
                        Mã GD VNPay:{" "}
                        <strong className="font-mono">{transactionNo}</strong>
                      </div>
                      {payment?.bankTranNo && (
                        <div>
                          Mã GD Ngân hàng:{" "}
                          <strong className="font-mono">
                            {payment.bankTranNo}
                          </strong>
                        </div>
                      )}
                      {bankCode && (
                        <div>
                          Ngân hàng: <strong>{bankCode}</strong>
                        </div>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Shipping Info Card */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800">
                <MapPin className="h-4 w-4 text-[#ee4d2d]" />
                Địa chỉ nhận hàng
              </h2>

              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                <p className="font-bold text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-gray-600">{order.shippingAddress.email}</p>
                <p className="text-gray-600 leading-relaxed">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </p>
                {order.shippingAddress.note && (
                  <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs italic text-gray-500">
                    Ghi chú: "{order.shippingAddress.note}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
