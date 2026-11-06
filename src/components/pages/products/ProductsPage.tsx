import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductItem from "./product-list";
import Pagination from "./pagination";
import { useProducts, useCategories } from "../../hooks/products";
import type { Product } from "../../types/product.type";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const categoryParam = searchParams.get("categoryId") || "";
  const sortParam = searchParams.get("sortBy") || "createdAt";
  const orderParam = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const searchKeyword = searchParams.get("keyword") || "";

  const containerRef = useRef<HTMLDivElement>(null);

  const limit = 18;

  // Gọi query với các tham số từ URL
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

  const { data: catResponse } = useCategories();
  const categories = catResponse?.data || [];

  const products = response?.data || [];
  const meta = response?.meta;

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Khi đổi filter/sort/search thì reset page về 1
    if (key !== "page") {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === pageParam || isLoading) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);

    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddToCart = (product: Product) => {
    console.log("Add to cart:", product);
  };

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-6 scroll-mt-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500 transition-colors">
          Trang chủ
        </Link>
        <i className="fas fa-chevron-right text-[9px] text-gray-400" />
        <span className="text-gray-800 font-medium">Tất cả sản phẩm</span>
      </nav>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">   
          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Select */}
            <select
              value={categoryParam}
              onChange={(e) => updateParam("categoryId", e.target.value)}
              className="
                px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm
                bg-white text-gray-700 focus:outline-none focus:border-orange-500
              "
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={`${sortParam}:${orderParam}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(":");
                const newParams = new URLSearchParams(searchParams);
                newParams.set("sortBy", sb);
                newParams.set("sortOrder", so);
                newParams.set("page", "1");
                setSearchParams(newParams);
              }}
              className="
                px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm
                bg-white text-gray-700 focus:outline-none focus:border-orange-500
              "
            >
              <option value="createdAt:desc">Mới nhất</option>
              <option value="price:asc">Giá: Thấp đến cao</option>
              <option value="price:desc">Giá: Cao đến thấp</option>
              <option value="sold:desc">Bán chạy nhất</option>
              <option value="rating:desc">Đánh giá cao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">
          Danh sách sản phẩm
          {searchKeyword && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              kết quả cho &ldquo;{searchKeyword}&rdquo;
            </span>
          )}
        </h1>

        {isFetching && !isLoading && (
          <span className="flex items-center gap-1.5 text-xs text-orange-500 font-medium">
            <i className="fas fa-spinner fa-spin" />
            Đang tải dữ liệu...
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
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
            Tải lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="
          bg-white rounded-xl
          py-16 text-center
          text-gray-400 text-sm border border-gray-100
        ">
          <i className="fas fa-box-open text-4xl text-gray-300 mb-3" />
          <p>Không tìm thấy sản phẩm nào phù hợp.</p>
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
          currentPage={pageParam}
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          onPageChange={handlePageChange}
          isLoading={isFetching}
        />
      )}
    </div>
  );
}

