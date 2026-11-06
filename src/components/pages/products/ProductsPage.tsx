
import { useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductItem from "./product-list";
import Pagination from "./pagination";
import { useProducts, useCategories } from "../../hooks/products";
import { useAddToCart } from "../../hooks/cart";
import type { Product } from "../../types/product.type";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10) || 1
  );

  const categoryParam = searchParams.get("categoryId") || "";
  const sortParam = searchParams.get("sortBy") || "createdAt";

  const orderParam =
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const searchKeyword = searchParams.get("keyword") || "";

  const containerRef = useRef<HTMLDivElement>(null);

  // Cart UX states
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [recentAddedId, setRecentAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const limit = 18;

  // Products query
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProducts({
    page: pageParam,
    limit,
    categoryId: categoryParam || undefined,
    sortBy: sortParam,
    sortOrder: orderParam,
    keyword: searchKeyword || undefined,
  });

  // Categories query
  const { data: catResponse } = useCategories();

  const categories = catResponse?.data || [];

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  const products = response?.data || [];
  const meta = response?.meta;

  // Update URL params
  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    // Reset page when changing filters
    if (key !== "page") {
      newParams.set("page", "1");
    }

    setSearchParams(newParams);
  };

  // Change pagination
  const handlePageChange = (newPage: number) => {
    if (newPage === pageParam || isFetching) return;

    const newParams = new URLSearchParams(searchParams);

    newParams.set("page", String(newPage));

    setSearchParams(newParams);

    // Scroll to products section
    requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    const productId = product._id || (product as any).id;

    if (!productId || addingProductId) return;

    if (
      (product.stock !== undefined && product.stock <= 0) ||
      product.status === "OUT_OF_STOCK"
    ) {
      setToastMessage(
        `Sản phẩm "${product.name}" hiện đang hết hàng!`
      );

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

          setToastMessage(
            `Đã thêm "${product.name}" vào giỏ hàng!`
          );

          setTimeout(() => {
            setRecentAddedId((prev) =>
              prev === productId ? null : prev
            );
          }, 1800);

          setTimeout(() => {
            setToastMessage((prev) =>
              prev?.includes(product.name) ? null : prev
            );
          }, 3000);
        },

        onError: (err: any) => {
          setAddingProductId(null);

          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            "Không thể thêm vào giỏ hàng.";

          setToastMessage(`Lỗi: ${errMsg}`);

          setTimeout(() => setToastMessage(null), 3500);
        },
      }
    );
  };

  return (
    <div
      ref={containerRef}
      className="
        relative w-full max-w-[1920px] mx-auto
        px-3 sm:px-4 lg:px-6 2xl:px-8
        py-4 sm:py-6
        scroll-mt-20
      "
    >
      {/* Toast notification */}
      {toastMessage && (
        <div
          className="
            fixed z-50
            bottom-4 left-3 right-3
            sm:left-auto sm:right-5 sm:bottom-5
            sm:max-w-md
            flex items-center gap-2
            bg-gray-900/95 backdrop-blur-md
            text-white text-xs sm:text-sm
            px-3 sm:px-4 py-3
            rounded-xl shadow-2xl
            border border-gray-700
            animate-slide-up
          "
        >
          <i className="fas fa-check-circle text-emerald-400 text-base shrink-0" />

          <span className="flex-1 min-w-0 break-words">
            {toastMessage}
          </span>

          <Link
            to="/cart"
            className="
              shrink-0 ml-1
              underline font-semibold
              text-orange-400 hover:text-orange-300
            "
          >
            Xem giỏ
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <nav
        className="
          flex items-center flex-wrap
          gap-2
          text-xs sm:text-sm
          text-gray-500
          mb-4 sm:mb-6
        "
      >
        <Link
          to="/"
          className="hover:text-orange-500 transition-colors"
        >
          Trang chủ
        </Link>

        <i className="fas fa-chevron-right text-[9px] text-gray-400" />

        <span className="text-gray-800 font-medium">
          Tất cả sản phẩm
        </span>
      </nav>

      {/* Filter & Search */}
      <section
        className="
          w-full
          bg-white rounded-xl
          shadow-sm
          border border-gray-100
          p-3 sm:p-4
          mb-4 sm:mb-6
        "
      >
        <div
          className="
            flex flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-3 sm:gap-4
          "
        >
          {/* Filters */}
          <div
            className="
              grid grid-cols-1
              min-[400px]:grid-cols-2
              sm:flex sm:flex-wrap
              gap-2 sm:gap-3
              min-w-0
            "
          >
            {/* Category */}
            <select
              value={categoryParam}
              onChange={(e) =>
                updateParam("categoryId", e.target.value)
              }
              className="
                w-full sm:w-auto
                min-w-0 sm:min-w-[180px]
                px-3 py-2.5
                rounded-lg
                border border-gray-200
                text-xs sm:text-sm
                bg-white text-gray-700
                outline-none
                focus:border-orange-500
                focus:ring-2 focus:ring-orange-100
                transition-all
              "
            >
              <option value="">Tất cả danh mục</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortParam}-${orderParam}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");

                const newParams = new URLSearchParams(searchParams);

                newParams.set("sortBy", sort);
                newParams.set("sortOrder", order);
                newParams.set("page", "1");

                setSearchParams(newParams);
              }}
              className="
                w-full sm:w-auto
                min-w-0 sm:min-w-[180px]
                px-3 py-2.5
                rounded-lg
                border border-gray-200
                text-xs sm:text-sm
                bg-white text-gray-700
                outline-none
                focus:border-orange-500
                focus:ring-2 focus:ring-orange-100
                transition-all
              "
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="sold-desc">Bán chạy nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating-desc">Đánh giá cao nhất</option>
            </select>
          </div>

          {/* Search */}
          <div
            className="
              flex items-center gap-2
              w-full lg:w-auto
              min-w-0
            "
          >
            <div
              className="
                relative flex-1
                min-w-0
                lg:w-64 lg:flex-none
              "
            >
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                defaultValue={searchKeyword}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateParam(
                      "keyword",
                      (e.target as HTMLInputElement).value.trim()
                    );
                  }
                }}
                className="
                  w-full
                  pl-9 pr-3 py-2.5
                  rounded-lg
                  border border-gray-200
                  text-xs sm:text-sm
                  outline-none
                  focus:border-orange-500
                  focus:ring-2 focus:ring-orange-100
                  transition-all
                "
              />

              <i
                className="
                  fas fa-search
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-gray-400 text-xs
                "
              />
            </div>

            {searchKeyword && (
              <button
                type="button"
                onClick={() => updateParam("keyword", "")}
                className="
                  shrink-0
                  text-xs sm:text-sm
                  text-red-500
                  hover:text-red-600
                  hover:underline
                  px-1
                "
              >
                Xoá
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Loading Skeleton */}
      {isLoading && (
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            items-stretch
            gap-2 sm:gap-3 lg:gap-4 2xl:gap-5
            animate-pulse
          "
        >
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="
                min-w-0 bg-white
                rounded-xl p-2.5 sm:p-3
                border border-gray-100
              "
            >
              <div className="aspect-square bg-gray-200 rounded-lg mb-3" />

              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />

              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />

              <div className="h-9 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div
          className="
            bg-white rounded-xl
            p-6 sm:p-12
            flex flex-col items-center
            text-center
            border border-gray-100
          "
        >
          <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-3" />

          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Không thể tải dữ liệu
          </h3>

          <p className="text-sm text-gray-500 max-w-sm mb-4">
            {error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi trong quá trình tải sản phẩm."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="
              px-5 py-2.5
              rounded-lg
              bg-orange-500 text-white
              text-sm font-medium
              hover:bg-orange-600
              transition-colors
            "
          >
            <i className="fas fa-redo-alt mr-2" />
            Tải lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div
          className="
            bg-white rounded-xl
            py-12 sm:py-16
            px-4
            text-center
            text-gray-400 text-sm
            border border-gray-100
          "
        >
          <i className="fas fa-box-open text-4xl text-gray-300 mb-3" />

          <p className="font-medium">
            Không tìm thấy sản phẩm nào phù hợp.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchParams(new URLSearchParams());
            }}
            className="
              mt-4
              text-orange-500
              hover:text-orange-600
              font-medium
            "
          >
            Xoá bộ lọc
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !isError && products.length > 0 && (
        <section
          className={`
            w-full
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6

            items-stretch
            auto-rows-fr

            gap-2
            sm:gap-3
            lg:gap-4
            2xl:gap-5

            transition-opacity duration-200
            ${isFetching ? "opacity-60" : "opacity-100"}
          `}
        >
          {products.map((product) => {
            const productId =
              product._id || (product as any).id;

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
        </section>
      )}

      {/* Pagination */}
      {!isLoading && !isError && meta && meta.totalPages > 1 && (
        <div
          className="
            w-full
            mt-6 sm:mt-8 lg:mt-10
            pt-4 sm:pt-5
            border-t border-gray-100
            overflow-x-auto
          "
        >
          <Pagination
            currentPage={pageParam}
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        </div>
      )}
    </div>
  );
}
