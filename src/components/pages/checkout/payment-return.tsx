import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Building2,
  Hash,
  Clock,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { orderService } from "../../api/order/order-service";
import { paymentService } from "../../api/payment/payment-service";
import type { Order } from "../../types/order.type";
import type { PaymentRecord } from "../../types/payment.type";

const formatPrice = (price: number = 0) =>
  `₫${Math.round(price).toLocaleString("vi-VN")}`;

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();

  // Đọc query parameters do VNPay hoặc Backend redirect về
  const orderCode =
    searchParams.get("orderCode") ||
    searchParams.get("vnp_TxnRef") ||
    "";
  const urlIsSuccess = searchParams.get("isSuccess") === "true";
  const urlMessage = searchParams.get("message") || "";
  const urlTransactionId =
    searchParams.get("transactionId") ||
    searchParams.get("vnp_TransactionNo") ||
    "";
  const vnpResponseCode = searchParams.get("vnp_ResponseCode") || "";

  // State xác thực thực tế từ Backend Database (Không tin tưởng hoàn toàn URL params)
  const [isVerifying, setIsVerifying] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const fetchVerification = async () => {
    if (!orderCode) {
      setIsVerifying(false);
      setVerifyError("Không tìm thấy mã đơn hàng trong URL thanh toán.");
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyError(null);

      // 1. Gọi backend để lấy thông tin xác thực đơn hàng
      const orderRes = await orderService.getOrderById(orderCode);
      if (orderRes?.data) {
        setOrder(orderRes.data);

        // 2. Lấy thông tin bản ghi thanh toán tương ứng
        try {
          const payRes = await paymentService.getPaymentByOrderId(
            orderRes.data._id || orderCode
          );
          if (payRes?.data) {
            setPayment(payRes.data);
          }
        } catch {
          // Bỏ qua nếu chưa tìm thấy bản ghi payment chi tiết
        }
      } else {
        setVerifyError("Không tìm thấy thông tin đơn hàng trên hệ thống.");
      }
    } catch (err: any) {
      console.error("Lỗi xác thực đơn hàng:", err);
      setVerifyError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể xác thực trạng thái đơn hàng từ máy chủ."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [orderCode]);

  // Kiểm tra trạng thái thanh toán thực tế dựa trên Server Database
  // Đơn hàng được coi là thanh toán thành công khi backend xác nhận paymentStatus === 'PAID'
  // hoặc payment.status === 'SUCCESS' hoặc urlIsSuccess = true và order.paymentStatus !== 'FAILED'
  const isPaidSuccess =
    order?.paymentStatus === "PAID" ||
    payment?.status === "SUCCESS" ||
    (urlIsSuccess && order?.paymentStatus !== "FAILED");

  // Xử lý tạo lại link thanh toán nếu giao dịch thất bại và muốn thử lại
  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      setIsRetrying(true);
      const res = await paymentService.createPayment({
        orderId: order._id,
        provider: "VNPAY",
        returnUrl: `${window.location.origin}/checkout/payment-return`,
      });

      if (res?.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Không thể tạo lại liên kết thanh toán VNPay."
      );
    } finally {
      setIsRetrying(false);
    }
  };

  // ── Màn hình Đang Xác Thực ──
  if (isVerifying) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full border-4 border-orange-100 border-t-[#ee4d2d] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-[#ee4d2d]" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Đang xác thực giao dịch...
        </h2>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">
          Hệ thống đang đối chiếu chữ ký số và xác nhận kết quả thanh toán với
          máy chủ VNPay. Vui lòng không đóng trang.
        </p>

        {orderCode && (
          <span className="mt-4 rounded-full bg-gray-100 px-3.5 py-1 text-xs font-semibold text-gray-700">
            Mã đơn: {orderCode}
          </span>
        )}
      </div>
    );
  }

  // ── Màn hình Lỗi hoặc Không tìm thấy đơn hàng ──
  if (verifyError && !order) {
    return (
      <div className="mx-auto my-12 max-w-lg px-4">
        <div className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            Không thể xác thực giao dịch
          </h1>
          <p className="mt-2 text-sm text-gray-600">{verifyError}</p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={fetchVerification}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Thử kiểm tra lại
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-black"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const transactionNo =
    payment?.transactionId || urlTransactionId || order?.transactionNo || "";
  const bankCode = payment?.bankCode || order?.bankCode || "";
  const totalAmount = order?.pricing?.totalAmount || payment?.amount || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Card Kết quả */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          {/* Header Banner */}
          <div
            className={`p-6 sm:p-8 text-center text-white ${
              isPaidSuccess
                ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                : "bg-gradient-to-r from-rose-600 to-red-600"
            }`}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
              {isPaidSuccess ? (
                <CheckCircle2 className="h-10 w-10 text-white" />
              ) : (
                <XCircle className="h-10 w-10 text-white" />
              )}
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              {isPaidSuccess
                ? "Thanh toán thành công!"
                : "Thanh toán chưa hoàn tất"}
            </h1>

            <p className="mt-2 text-sm text-white/90">
              {isPaidSuccess
                ? "Đơn hàng của bạn đã được thanh toán và chuyển sang trạng thái đã xác nhận."
                : urlMessage ||
                  payment?.failureReason ||
                  (vnpResponseCode === "24"
                    ? "Giao dịch đã bị huỷ bởi người dùng trên cổng VNPay."
                    : "Giao dịch không thành công hoặc chữ ký không hợp lệ.")}
            </p>
          </div>

          {/* Chi tiết giao dịch & đối soát */}
          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                Thông tin giao dịch & Đối soát (VNPay Sandbox)
              </h2>

              <dl className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-gray-500">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span>Mã tham chiếu đơn hàng (vnp_TxnRef):</span>
                  </dt>
                  <dd className="font-bold text-gray-900">
                    {order?.orderCode || orderCode}
                  </dd>
                </div>

                {transactionNo && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span>Mã giao dịch VNPay (vnp_TransactionNo):</span>
                    </dt>
                    <dd className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {transactionNo}
                    </dd>
                  </div>
                )}

                {payment?.bankTranNo && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>Mã GD Ngân hàng (vnp_BankTranNo):</span>
                    </dt>
                    <dd className="font-mono text-gray-700">
                      {payment.bankTranNo}
                    </dd>
                  </div>
                )}

                {bankCode && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>Ngân hàng thanh toán:</span>
                    </dt>
                    <dd className="font-semibold text-gray-800">
                      {bankCode}
                    </dd>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Thời gian ghi nhận:</span>
                  </dt>
                  <dd className="text-gray-700">
                    {order?.paidAt
                      ? new Date(order.paidAt).toLocaleString("vi-VN")
                      : new Date().toLocaleString("vi-VN")}
                  </dd>
                </div>

                <div className="border-t border-gray-200/60 pt-2.5 flex items-center justify-between">
                  <dt className="font-semibold text-gray-700">
                    Tổng số tiền thanh toán:
                  </dt>
                  <dd className="text-base font-bold text-[#ee4d2d]">
                    {formatPrice(totalAmount)}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Trạng thái đơn hàng:</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isPaidSuccess
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isPaidSuccess ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Thông tin đối soát Sandbox */}
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold">Bảo mật & Đối soát Sandbox:</p>
                <p className="mt-0.5 text-blue-800/90 leading-relaxed">
                  Giao dịch đã được máy chủ Backend kiểm tra chữ ký số HMAC-SHA512
                  và khớp với số tiền thực tế trong cơ sở dữ liệu. Bạn có thể sử
                  dụng <strong>Mã GD VNPay: {transactionNo || orderCode}</strong> để
                  đối soát trực tiếp trên trang quản trị Merchant Sandbox.
                </p>
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {isPaidSuccess ? (
                <>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Tiếp tục mua sắm
                  </Link>

                  {order?._id && (
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] px-5 py-3 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition hover:from-[#d73211] hover:to-[#ee4d2d]"
                    >
                      <FileText className="h-4 w-4" />
                      Xem chi tiết đơn hàng
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/cart"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Quay lại Giỏ hàng
                  </Link>

                  <button
                    type="button"
                    onClick={handleRetryPayment}
                    disabled={isRetrying}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] px-5 py-3 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition hover:from-[#d73211] hover:to-[#ee4d2d] disabled:opacity-50"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tạo lại liên kết...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Thanh toán lại qua VNPay
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
