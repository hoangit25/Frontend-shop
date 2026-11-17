import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { orderService } from "../../api/order/order-service";
import type { Order } from "../../types/order.type";

const formatPrice = (price: number = 0) =>
  `₫${Math.round(price).toLocaleString("vi-VN")}`;

const getStatusBadge = (orderStatus: string, paymentStatus: string) => {
  if (paymentStatus === "PAID") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
        <CheckCircle2 className="h-3 w-3" />
        Đã thanh toán
      </span>
    );
  }
  if (orderStatus === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
        <AlertCircle className="h-3 w-3" />
        Đã huỷ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
      <Clock className="h-3 w-3" />
      Chờ thanh toán
    </span>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await orderService.getOrders();
      if (res?.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
              Đơn hàng của tôi
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Quản lý và theo dõi trạng thái các đơn hàng đã đặt.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#ee4d2d]" />
            <p className="mt-3 text-sm text-gray-500">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <p className="mt-2 text-sm font-semibold text-gray-900">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              Thử lại
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-base font-bold text-gray-900">
              Chưa có đơn hàng nào
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Bạn chưa thực hiện đơn đặt hàng nào gần đây.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] px-5 py-2.5 text-xs font-bold text-white shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition hover:border-gray-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-gray-900">
                      #{order.orderCode}
                    </span>
                    {getStatusBadge(order.orderStatus, order.paymentStatus)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                {/* Items summary */}
                <div className="py-3.5 space-y-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 line-clamp-1 flex-1">
                        {item.name} × <strong>{item.quantity}</strong>
                      </span>
                      <span className="font-semibold text-gray-900 shrink-0 ml-3">
                        {formatPrice(item.subtotal || item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-[11px] text-gray-400">
                      và {order.items.length - 3} sản phẩm khác...
                    </p>
                  )}
                </div>

                {/* Footer card */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
                  <div className="text-xs">
                    <span className="text-gray-500">Tổng thanh toán: </span>
                    <strong className="text-sm font-black text-[#ee4d2d]">
                      {formatPrice(order.pricing.totalAmount)}
                    </strong>
                    <span className="ml-2 text-[11px] text-gray-400">
                      ({order.paymentMethod === "VNPAY" ? "VNPay" : "COD"})
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ee4d2d] hover:underline"
                  >
                    <span>Chi tiết</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
