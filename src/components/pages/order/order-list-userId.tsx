import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Truck,
  CreditCard,
} from "lucide-react";
import { orderService } from "../../api/order/order-service";
import { useAuthStore } from "../../store/auth-store";
import type { Order, OrderStatus } from "../../types/order.type";

type OrderTab = "ALL" | "PENDING_PAY" | "PROCESSING" | "DELIVERED" | "CANCELLED";

const TAB_CONFIG: { id: OrderTab; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING_PAY", label: "Chờ thanh toán" },
  { id: "PROCESSING", label: "Đang xử lý / Vận chuyển" },
  { id: "DELIVERED", label: "Đã giao" },
  { id: "CANCELLED", label: "Đã huỷ" },
];

const formatPrice = (price: number = 0) =>
  `₫${Math.round(price).toLocaleString("vi-VN")}`;

const getStatusBadge = (orderStatus: OrderStatus | string, paymentStatus: string) => {
  if (orderStatus === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
        <AlertCircle className="h-3 w-3" />
        Đã huỷ
      </span>
    );
  }

  if (orderStatus === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" />
        Giao thành công
      </span>
    );
  }

  if (orderStatus === "SHIPPING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200">
        <Truck className="h-3 w-3" />
        Đang giao hàng
      </span>
    );
  }

  if (paymentStatus === "PAID") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" />
        Đã thanh toán
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
      <Clock className="h-3 w-3" />
      Chờ xử lý / Thanh toán
    </span>
  );
};

const OrderListUserId: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderTab>("ALL");

  const userId = user?._id || user?.id;

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Gọi API lấy danh sách đơn hàng của userId hiện tại
      const res = await orderService.getOrders({
        page: 1,
        limit: 50,
      });

      if (res?.data) {
        const ordersData = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.orders || [];
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách đơn hàng của bạn."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  // Lọc đơn hàng theo tab đã chọn
  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;

    return orders.filter((order) => {
      if (activeTab === "PENDING_PAY") {
        return (
          order.paymentStatus === "PENDING" && order.orderStatus !== "CANCELLED"
        );
      }
      if (activeTab === "PROCESSING") {
        return ["CONFIRMED", "PROCESSING", "SHIPPING"].includes(
          order.orderStatus
        );
      }
      if (activeTab === "DELIVERED") {
        return order.orderStatus === "DELIVERED";
      }
      if (activeTab === "CANCELLED") {
        return order.orderStatus === "CANCELLED";
      }
      return true;
    });
  }, [orders, activeTab]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Đơn hàng của tôi
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Xem và theo dõi tất cả đơn hàng theo tài khoản{" "}
            <span className="font-semibold text-gray-700">
              {user?.fullName || user?.email || "của bạn"}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white rounded-t-xl px-2 shadow-xs">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? "border-green-600 text-green-700 font-semibold"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Order List */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="mt-3 text-sm text-gray-500">
            Đang tải danh sách đơn hàng...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-2 text-sm font-semibold text-gray-900">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition"
          >
            Thử lại
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-xs">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-900">
            Chưa có đơn hàng nào
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {activeTab === "ALL"
              ? "Bạn chưa có đơn đặt hàng nào trong tài khoản."
              : "Không có đơn hàng nào trong mục này."}
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-green-700"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Mua sắm ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = Array.isArray(order?.items) ? order.items : [];
            const itemCount = items.reduce(
              (acc, item) => acc + (item?.quantity || 1),
              0
            );

            return (
              <div
                key={order?._id || Math.random()}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition hover:border-gray-300"
              >
                {/* Header card */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">
                      Mã đơn: #{order?.orderCode || "---"}
                    </span>
                    {getStatusBadge(order?.orderStatus || "", order?.paymentStatus || "")}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {order?.createdAt
                        ? `${new Date(order.createdAt).toLocaleDateString("vi-VN")} ${new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "---"}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100 px-5">
                  {items.map((item, idx) => {
                    const itemImg =
                      item?.image ||
                      (typeof item?.productId === "object"
                        ? item.productId?.image
                        : "");

                    return (
                      <div key={idx} className="flex items-center gap-4 py-3.5">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={item?.name || "Product"}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <Package size={24} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                            {item?.name || "Sản phẩm"}
                          </h4>
                          {item?.sku && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              SKU: {item.sku}
                            </p>
                          )}
                          <div className="mt-1 text-xs text-gray-500">
                            Số lượng:{" "}
                            <span className="font-semibold text-gray-700">
                              {item?.quantity || 1}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(item?.subtotal || (item?.price || 0) * (item?.quantity || 1))}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatPrice(item?.price || 0)} / sp
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer card */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/30 px-5 py-3.5">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>{order?.paymentMethod === "VNPAY" ? "VNPay" : "COD"}</span>
                    </div>

                    <div>
                      <span className="text-gray-500">Tổng ({itemCount} món): </span>
                      <strong className="text-base font-bold text-green-700">
                        {formatPrice(order?.pricing?.totalAmount || 0)}
                      </strong>
                    </div>
                  </div>

                  <Link
                    to={`/orders/${order?._id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-green-600 hover:text-green-700"
                  >
                    <span>Chi tiết đơn</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderListUserId;
