import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ProductItem from "./product-list";
import Pagination from "./pagination";
import { useProducts } from "../../hooks/products";
import type { Product } from "../../types/product.type";

export default function ProductList() {
  const [page, setPage] = useState<number>(1);
  const limit = 15;
  const sectionRef = useRef<HTMLElement>(null);

  // Quản lý state query qua TanStack Query với pagination
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
    console.log("Add to cart:", product);
    // Gọi cart store hoặc addToCart service tại đây.
  };

  return (
    <section ref={sectionRef} className="container mx-auto px-4 mt-6 mb-10 scroll-mt-20">
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
        {/* Loading Skeleton lần đầu */}
        {isLoading && (
          <div className="
            grid grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
            gap-2 sm:gap-3 lg:gap-4
          ">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden animate-pulse border border-gray-100"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="
            bg-white rounded-lg
            py-12 px-4
            flex flex-col items-center
            text-center border border-gray-100
          ">
            <i className="fas fa-exclamation-circle text-3xl text-red-400 mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : "Không thể tải danh sách sản phẩm. Vui lòng thử lại."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="
                px-5 py-2 rounded-md
                bg-orange-500 text-white
                text-sm font-medium
                hover:bg-orange-600
                transition-colors
              "
            >
              Tải lại trang
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="
            bg-white rounded-lg
            py-12 text-center
            text-gray-400 text-sm border border-gray-100
          ">
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
            {products.map((product) => (
              <ProductItem
                key={product._id || product.id}
                item={product}
                onAddToCart={handleAddToCart}
              />
            ))}
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
