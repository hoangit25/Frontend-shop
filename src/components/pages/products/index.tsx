import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ProductItem from "./product-list";
import Pagination from "./pagination";
import { useProducts } from "../../hooks/products";
import { useAddToCart } from "../../hooks/cart";
import type { Product } from "../../types/product.type";

export default function ProductList() {
  const [page, setPage] = useState<number>(1);
  const limit = 15;
  const sectionRef = useRef<HTMLElement>(null);

  // States hỗ trợ UX thêm giỏ hàng tối ưu từng sản phẩm
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [recentAddedId, setRecentAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TanStack Query hooks
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProducts({
    page,
    limit,
  });

  const addToCartMutation = useAddToCart();

  const products = response?.data || [];
  const meta = response?.meta;

  const handlePageChange = (newPage: number) => {
    if (newPage === page || isLoading) return;
    setPage(newPage);

    // Cuộn mượt lên đầu danh sách sản phẩm khi đổi trang
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddToCart = (product: Product) => {
    const productId = product._id || (product as any).id;
    if (!productId || addingProductId) return;

    if (product.stock !== undefined && product.stock <= 0) {
      setToastMessage(`Sản phẩm "${product.name}" hiện đang hết hàng!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setAddingProductId(productId);

    addToCartMutation.mutate(
      {
        productId,
        quantity: 1,
        selected: true,
      },
      {
        onSuccess: () => {
          setAddingProductId(null);
          setRecentAddedId(productId);
          setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);

          // Tự tắt trạng thái "Đã thêm" sau 1.8 giây
          setTimeout(() => {
            setRecentAddedId((prev) => (prev === productId ? null : prev));
          }, 1800);

          // Tự ẩn toast sau 3 giây
          setTimeout(() => {
            setToastMessage((prev) => (prev?.includes(product.name) ? null : prev));
          }, 3000);
        },
        onError: (err: any) => {
          setAddingProductId(null);
          const errMsg = err?.response?.data?.message || err?.message || "Không thể thêm vào giỏ hàng.";
          setToastMessage(`Lỗi: ${errMsg}`);
          setTimeout(() => setToastMessage(null), 3500);
        },
      }
    );
  };

  return (
    <section ref={sectionRef} className="container mx-auto px-4 mt-6 mb-10 scroll-mt-20 relative">
      {/* Toast thông báo nổi khi thêm giỏ hàng thành công */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900/90 backdrop-blur-md text-white text-xs sm:text-sm px-4 py-3 rounded-lg shadow-2xl border border-gray-700 animate-slide-up">
          <i className="fas fa-check-circle text-emerald-400 text-base" />
          <span>{toastMessage}</span>
          <Link
            to="/cart"
            className="ml-2 underline font-semibold text-orange-400 hover:text-orange-300"
          >
            Xem giỏ
          </Link>
        </div>
      )}

      {/* Section Header */}
      <div className="
        flex items-center justify-between
        bg-white rounded-t-lg
        px-4 sm:px-6 py-4
        border-b border-gray-100
      ">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-orange-500" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="
                text-base sm:text-lg
                font-bold uppercase
                text-orange-600
                tracking-wide
              ">
                Sản phẩm nổi bật
              </h2>

              {isFetching && !isLoading && (
                <span className="flex items-center gap-1 text-[11px] font-normal text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                  <i className="fas fa-spinner fa-spin text-[10px]" />
                  Đang tải...
                </span>
              )}
            </div>

            <p className="hidden sm:block text-xs text-gray-400 mt-1">
              Khám phá các sản phẩm hot giá ưu đãi (Trang {page})
            </p>
          </div>
        </div>

        <Link
          to="/products"
          className="
            flex items-center gap-2
            text-xs sm:text-sm
            font-medium text-orange-500
            hover:text-orange-600
            transition-colors
          "
        >
          Xem tất cả
          <i className="fas fa-chevron-right text-[10px]" />
        </Link>
      </div>

      {/* Product Content */}
      <div className="bg-transparent p-2 sm:p-3">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 space-y-3 border border-gray-100">
                <div className="aspect-square bg-gray-200 rounded-md" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="bg-white rounded-lg p-8 flex flex-col items-center text-center border border-gray-100">
            <i className="fas fa-exclamation-circle text-3xl text-red-400 mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : "Không thể tải danh sách sản phẩm. Vui lòng thử lại."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="bg-white rounded-lg py-12 text-center text-gray-400 text-sm border border-gray-100">
            Chưa có sản phẩm nào ở trang này.
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && products.length > 0 && (
          <div
            className={`
              grid grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
              gap-2 sm:gap-3 lg:gap-4
              transition-opacity duration-200
              ${isFetching ? "opacity-60" : "opacity-100"}
            `}
          >
            {products.map((product) => {
              const productId = product._id || (product as any).id;
              return (
                <ProductItem
                  key={productId}
                  item={product}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addingProductId === productId}
                  isAdded={recentAddedId === productId}
                />
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        )}
      </div>
    </section>
  );
}
